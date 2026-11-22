import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { postProductEvent } from "../fixtures/api-gateway-events";
import { handler } from "../../lambda_code/insert_product";

const product = { title: "Keyboard", category: "Computers", description: "USB keyboard", price: 29.99 };

afterEach(() => jest.restoreAllMocks());

test("returns the audited product written by a conditional put", async () => {

  const send = jest.spyOn(DynamoDBDocumentClient.prototype, "send").mockImplementation(async () => ({}));
  const actor = "arn:aws:iam::123456789012:user/test";
  jest.replaceProperty(process, "env", { ...process.env, PRODUCTS_TABLE_NAME: "Products" });
  
  const response = await handler(postProductEvent(product, { userArn: actor }));
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

test.each([
  { ...postProductEvent(product), body: "{" },
  postProductEvent({ ...product, id: "client-id" }),
])(
  "rejects invalid input before writing", async event => {
    const send = jest.spyOn(DynamoDBDocumentClient.prototype, "send").mockImplementation(async () => ({}));
    expect((await handler(event)).statusCode).toBe(400);
    expect(send).not.toHaveBeenCalled();
  },
);

test("distinguishes a duplicate key from other database failures", async () => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(DynamoDBDocumentClient.prototype, "send")
    .mockImplementationOnce(async () => { throw new ConditionalCheckFailedException({ $metadata: {}, message: "Duplicate" }); })
    .mockImplementationOnce(async () => { throw new Error("Unexpected failure"); });
  const event = postProductEvent(product);
  const conflict = await handler(event);
  expect(conflict.statusCode).toBe(409);
  expect(JSON.parse(conflict.body).error.type).toBe("product_id_conflict");
  const failure = await handler(event);
  expect(failure.statusCode).toBe(500);
  expect(JSON.parse(failure.body).error.type).toBe("internal_error");
  expect(failure.body).not.toContain("Unexpected failure");
});

test("reports field-level feedback with the API Gateway request ID", async () => {
  const event = postProductEvent({ ...product, price: -5 });
  event.requestContext.requestId = "validation-request";
  const response = await handler(event);
  expect(response.statusCode).toBe(400);
  expect(JSON.parse(response.body)).toEqual({
    error: {
      type: "validation_error",
      message: "Product data validation failed",
      request_id: "validation-request",
      timestamp: expect.stringMatching(/Z$/),
      details: [{ field: "price", message: expect.any(String) }],
      suggestions: expect.arrayContaining([expect.any(String)]),
    },
  });
});
