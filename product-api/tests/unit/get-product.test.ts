import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { getProductEvent } from "../fixtures/api-gateway-events";
import { handler } from "../../lambda_code/get_product";

afterEach(() => jest.restoreAllMocks());

test("retrieves the stored product directly by its ID", async () => {
  const item = { id: "p1", title: "Keyboard", price: 29.99 };
  const send = jest.spyOn(DynamoDBDocumentClient.prototype, "send")
    .mockImplementation(async () => ({ Item: item }));
  const response = await handler(getProductEvent(item.id));
  expect(send).toHaveBeenCalledWith(expect.any(GetCommand));
  expect(send.mock.calls[0][0].input).toEqual({ TableName: "Products", Key: { id: item.id } });
  expect(response.statusCode).toBe(200);
  expect(JSON.parse(response.body)).toEqual(item);
});

test("distinguishes a missing ID from an absent database item", async () => {
  const send = jest.spyOn(DynamoDBDocumentClient.prototype, "send")
    .mockImplementation(async () => ({}));
  const missingId = { ...getProductEvent("p1"), pathParameters: null };
  expect((await handler(missingId)).statusCode).toBe(400);
  expect(send).not.toHaveBeenCalled();
  expect((await handler(getProductEvent("absent"))).statusCode).toBe(404);
});
