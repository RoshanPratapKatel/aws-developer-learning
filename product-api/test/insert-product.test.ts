import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../lambda_code/insert_product";

const product = { title: "Keyboard", category: "Computers", description: "USB keyboard", price: 29.99 };
const request = (body: string, userArn: string | null = null) =>
  ({ body, requestContext: { identity: { userArn } } }) as APIGatewayProxyEvent;

afterEach(() => jest.restoreAllMocks());

test("returns the audited product written by a conditional put", async () => {
  const send = jest.spyOn(DynamoDBDocumentClient.prototype, "send").mockImplementation(async () => ({}));
  const actor = "arn:aws:iam::123456789012:user/test";
  jest.replaceProperty(process, "env", { ...process.env, PRODUCTS_TABLE_NAME: "Products" });
  const response = await handler(request(JSON.stringify(product), actor));
  expect(response.statusCode).toBe(201);
  const item = JSON.parse(response.body);
  expect(item).toMatchObject({
    ...product, id: expect.stringMatching(/^[0-9a-f-]{36}$/),
    created_by: actor, updated_by: actor, created_at: expect.any(String), updated_at: item.created_at,
  });
  const command = send.mock.calls[0][0];
  expect(command).toBeInstanceOf(PutCommand);
  expect(command.input).toMatchObject({
    TableName: "Products", Item: item, ConditionExpression: "attribute_not_exists(id)",
  });
});

test.each(["{", JSON.stringify({ ...product, id: "client-id" })])(
  "rejects invalid input before writing", async body => {
    const send = jest.spyOn(DynamoDBDocumentClient.prototype, "send").mockImplementation(async () => ({}));
    expect((await handler(request(body))).statusCode).toBe(400);
    expect(send).not.toHaveBeenCalled();
  },
);

test("distinguishes a duplicate key from other database failures", async () => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(DynamoDBDocumentClient.prototype, "send")
    .mockImplementationOnce(async () => { throw new ConditionalCheckFailedException({ $metadata: {}, message: "Duplicate" }); })
    .mockImplementationOnce(async () => { throw new Error("Unexpected failure"); });
  const event = request(JSON.stringify(product));
  expect((await handler(event)).statusCode).toBe(409);
  expect((await handler(event)).statusCode).toBe(500);
});
