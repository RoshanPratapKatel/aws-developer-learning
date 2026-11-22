import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export async function getProduct(productId: string) {
  const { Item } = await db.send(new GetCommand({
    TableName: "Products",
    Key: { id: productId },
  }));
  return Item;
}
