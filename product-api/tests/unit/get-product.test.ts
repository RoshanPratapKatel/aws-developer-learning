import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../../lambda_code/get_product";

const request = (id?: string) =>
  ({ pathParameters: id ? { id } : null }) as APIGatewayProxyEvent;

afterEach(() => jest.restoreAllMocks());

test("retrieves the stored product directly by its ID", async () => {
  const item = { id: "p1", title: "Keyboard", price: 29.99 };
  const send = jest.spyOn(DynamoDBDocumentClient.prototype, "send")
    .mockImplementation(async () => ({ Item: item }));
  const response = await handler(request(item.id));
  expect(send).toHaveBeenCalledWith(expect.any(GetCommand));
  expect(send.mock.calls[0][0].input).toEqual({ TableName: "Products", Key: { id: item.id } });
  expect(response.statusCode).toBe(200);
  expect(JSON.parse(response.body)).toEqual(item);
});

test("distinguishes a missing ID from an absent database item", async () => {
  const send = jest.spyOn(DynamoDBDocumentClient.prototype, "send")
    .mockImplementation(async () => ({}));
  expect((await handler(request())).statusCode).toBe(400);
  expect(send).not.toHaveBeenCalled();
  expect((await handler(request("absent"))).statusCode).toBe(404);
});
