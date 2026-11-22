import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createResponse } from "./catalog";
import { listProducts } from "./data/list-products";
import { errorResponse } from "./error-response";

export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  try {
    const products = await listProducts(event.queryStringParameters?.category);

    return createResponse(200, products);
  } catch (error) {
    console.error("Error querying products:", event.requestContext.requestId, error);
    return errorResponse(event, "internal_error");
  }
}
