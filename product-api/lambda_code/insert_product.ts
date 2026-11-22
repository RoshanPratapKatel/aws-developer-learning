import { randomUUID } from "node:crypto";
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createResponse } from "./catalog";
import { insertProduct } from "./data/insert-product";
import { parseProductBody } from "./parse-product-body";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const product = parseProductBody(event);
  if (!product.success) return product.response;

  try {
    const actor = event.requestContext.identity.userArn ?? "unknown";
    const result = await insertProduct({ ...product.data, id: randomUUID() }, actor);
    if (result.status === "conflict") {
      return createResponse(409, { error: "Product ID already exists" });
    }
    return createResponse(201, result.item);
  } catch (error) {
    console.error("Error inserting product:", error);
    return createResponse(500, { error: "Internal server error" });
  }
}
