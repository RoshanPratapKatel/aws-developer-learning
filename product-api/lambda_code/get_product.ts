import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createResponse } from "./catalog";
import { getProduct } from "./data/get-product";
import { errorResponse } from "./error-response";

export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  try {
    const productId = event.pathParameters?.id;

    if (!productId) {
      return errorResponse(event, "missing_product_id");
    }

    const product = await getProduct(productId);

    if (!product) {
      return errorResponse(event, "product_not_found");
    }

    return createResponse(200, product);
  } catch (error) {
    console.error("Error fetching product:", event.requestContext.requestId, error);
    return errorResponse(event, "internal_error");
  }
}
