import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  paginateQuery,
  paginateScan,
  type ScanCommandOutput,
} from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export async function listProducts(category?: string) {
  const pages = category
    ? paginateQuery({ client }, {
        TableName: "Products",
        IndexName: "category-index",
        KeyConditionExpression: "#category = :category",
        ExpressionAttributeNames: { "#category": "category" },
        ExpressionAttributeValues: { ":category": category },
      })
    : paginateScan({ client }, { TableName: "Products" });

  const products: NonNullable<ScanCommandOutput["Items"]> = [];
  for await (const page of pages) {
    for (const product of page.Items ?? []) products.push(product);
  }
  return products;
}
