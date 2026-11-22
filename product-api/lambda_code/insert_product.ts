import { randomUUID } from "node:crypto";
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createResponse } from "./catalog";
import { insertProduct } from "./data/insert-product";
import { parseProductBody } from "./parse-product-body";
import { errorResponse } from "./error-response";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const product = parseProductBody(event);
  if (!product.success) return product.response;

  try {
    const actor = event.requestContext.identity.userArn ?? "unknown";
    const result = await insertProduct({ ...product.data, id: randomUUID() }, actor);
    if (result.status === "conflict") {
      return errorResponse(event, "product_id_conflict");
    }
    return createResponse(201, result.item);
  } catch (error) {
    console.error("Error inserting product:", event.requestContext.requestId, error);
    return errorResponse(event, "internal_error");
  }
}
