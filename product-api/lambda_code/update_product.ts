import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createResponse } from "./catalog";
import { updateProduct } from "./data/update-product";
import { parseProductBody } from "./parse-product-body";
import { errorResponse } from "./error-response";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const id = event.pathParameters?.id;
  if (!id) return errorResponse(event, "missing_product_id");

  const product = parseProductBody(event);
  if (!product.success) return product.response;

  try {
    const actor = event.requestContext.identity.userArn ?? "unknown";
    const result = await updateProduct(id, product.data, actor);
    if (result.status === "not-found") return errorResponse(event, "product_not_found");
    return createResponse(200, result.item);
  } catch (error) {
    console.error("Error updating product:", event.requestContext.requestId, error);
    return errorResponse(event, "internal_error");
  }
}
