import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createResponse } from "./catalog";
import { getProduct } from "./data/get-product";

export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  try {
    const productId = event.pathParameters?.id;

    if (!productId) {
      return createResponse(400, { error: "Product ID required" });
    }

    const product = await getProduct(productId);

    if (!product) {
      return createResponse(404, { error: "Product not found" });
    }

    return createResponse(200, product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return createResponse(500, { error: "Internal server error" });
  }
}
