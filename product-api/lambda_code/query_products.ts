import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  createResponse,
  getAllProducts,
  getProductsByCategory,
} from "./catalog";

export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  try {
    // /Products?category={category} - category is the optional query parameter to filter products by category.
    const category = event.queryStringParameters?.category;
    const products = category
      ? getProductsByCategory(category)
      : getAllProducts();

    return createResponse(200, products);
  } catch (error) {
    console.error("Error querying products:", error);
    return createResponse(500, { error: "Internal server error" });
  }
}
