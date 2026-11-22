import { ConditionalCheckFailedException, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { ProductInput } from "../schemas/product-input";

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export async function insertProduct(product: ProductInput & { id: string }, actor: string) {
  const timestamp = new Date().toISOString();
  const item = {
    ...product,
    created_at: timestamp,
    created_by: actor,
    updated_at: timestamp,
    updated_by: actor,
  };

  try {
    await db.send(new PutCommand({
      TableName: "Products",
      Item: item,
      ConditionExpression: "attribute_not_exists(id)",
    }));
    return { status: "created", item } as const;
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      return { status: "conflict" } as const;
    }
    throw error;
  }
}
