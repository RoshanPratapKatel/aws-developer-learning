import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { listProducts } from "../lambda_code/data/list-products";

afterEach(() => jest.restoreAllMocks());

test("lists the whole table, including products after the first scan page", async () => {
  const send = jest.spyOn(DynamoDBDocumentClient.prototype, "send")
    .mockImplementationOnce(async () => ({ Items: [{ id: "a" }], LastEvaluatedKey: { id: "a" } }))
    .mockImplementationOnce(async () => ({ Items: [{ id: "b" }] }));
  expect(await listProducts()).toEqual([{ id: "a" }, { id: "b" }]);
  expect(send.mock.calls[1][0]).toBeInstanceOf(ScanCommand);
  expect(send.mock.calls[1][0].input).toMatchObject({
    TableName: "Products", ExclusiveStartKey: { id: "a" },
  });
});

test("queries the category index and returns an empty list when nothing matches", async () => {
  const send = jest.spyOn(DynamoDBDocumentClient.prototype, "send")
    .mockImplementation(async () => ({ Items: [] }));
  expect(await listProducts("Audio")).toEqual([]);
  expect(send.mock.calls[0][0]).toBeInstanceOf(QueryCommand);
  expect(send.mock.calls[0][0].input).toMatchObject({
    TableName: "Products", IndexName: "category-index",
    KeyConditionExpression: "#category = :category",
    ExpressionAttributeNames: { "#category": "category" },
    ExpressionAttributeValues: { ":category": "Audio" },
  });
});
