import { ConditionalCheckFailedException, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { ProductInput } from "../schemas/product-input";

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export async function updateProduct(id: string, product: ProductInput, actor: string) {
  try {
    const { Attributes } = await db.send(new UpdateCommand({
      TableName: "Products",
      Key: { id },
      ConditionExpression: "attribute_exists(id)",
      UpdateExpression: "SET #category = :category, title = :title, #description = :description, price = :price, updated_at = :now, updated_by = :actor",
      ExpressionAttributeNames: { "#category": "category", "#description": "description" },
      ExpressionAttributeValues: {
        ":category": product.category,
        ":title": product.title,
        ":description": product.description,
        ":price": product.price,
        ":now": new Date().toISOString(),
        ":actor": actor,
      },
      ReturnValues: "ALL_NEW",
    }));
    if (!Attributes) throw new Error("UpdateItem returned no product attributes");
    return { status: "updated", item: Attributes } as const;
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) return { status: "not-found" } as const;
    throw error;
  }
}
