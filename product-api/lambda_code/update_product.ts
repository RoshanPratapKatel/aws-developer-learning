import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createResponse } from "./catalog";
import { updateProduct } from "./data/update-product";
import { parseProductBody } from "./parse-product-body";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const id = event.pathParameters?.id;
  if (!id) return createResponse(400, { error: "Product ID required" });

  const product = parseProductBody(event);
  if (!product.success) return product.response;

  try {
    const actor = event.requestContext.identity.userArn ?? "unknown";
    const result = await updateProduct(id, product.data, actor);
    if (result.status === "not-found") return createResponse(404, { error: "Product not found" });
    return createResponse(200, result.item);
  } catch (error) {
    console.error("Error updating product:", error);
    return createResponse(500, { error: "Internal server error" });
  }
}
