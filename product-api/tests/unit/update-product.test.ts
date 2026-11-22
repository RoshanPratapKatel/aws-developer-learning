import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { putProductEvent } from "../fixtures/api-gateway-events";
import { handler } from "../../lambda_code/update_product";

const product = { category: "Audio", title: "Headphones", description: "Wired", price: 29.99 };

afterEach(() => jest.restoreAllMocks());

test("updates the addressed item conditionally and returns the full stored record", async () => {
  const stored = { ...product, id: "p1", created_by: "original creator", updated_by: "unknown" };
  const send = jest.spyOn(DynamoDBDocumentClient.prototype, "send")
    .mockImplementation(async () => ({ Attributes: stored }));
  const response = await handler(putProductEvent("p1", product));
  expect(response.statusCode).toBe(200);
  expect(JSON.parse(response.body)).toEqual(stored);
  const command = send.mock.calls[0][0];
  expect(command).toBeInstanceOf(UpdateCommand);
  expect(command.input).toMatchObject({
    Key: { id: "p1" }, ConditionExpression: "attribute_exists(id)", ReturnValues: "ALL_NEW",
    ExpressionAttributeValues: {
      ":category": "Audio", ":title": "Headphones", ":description": "Wired",
      ":price": 29.99, ":actor": "unknown", ":now": expect.any(String),
    },
  });
});

test("rejects missing ID, malformed JSON, and partial updates before writing", async () => {
  const send = jest.spyOn(DynamoDBDocumentClient.prototype, "send");
  const valid = putProductEvent("p1", product);
  for (const event of [
    { ...valid, pathParameters: null },
    { ...valid, body: "{" },
    putProductEvent("p1", { price: 5 }),
  ]) {
    expect((await handler(event)).statusCode).toBe(400);
  }
  expect(send).not.toHaveBeenCalled();
});

test("returns 404 when the conditional update finds no existing item", async () => {
  jest.spyOn(DynamoDBDocumentClient.prototype, "send").mockImplementation(async () => {
    throw new ConditionalCheckFailedException({ $metadata: {}, message: "Missing item" });
  });
  expect((await handler(putProductEvent("absent", product))).statusCode).toBe(404);
});
