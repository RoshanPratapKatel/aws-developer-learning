import type { APIGatewayProxyEvent } from "aws-lambda";
import { createResponse } from "./catalog";

const errors = {
  invalid_json: {
    status: 400, message: "Invalid JSON",
    suggestions: ["Send the product as a valid JSON object."],
  },
  validation_error: {
    status: 400, message: "Product data validation failed",
    suggestions: ["Correct the fields listed in details and submit again."],
  },
  missing_product_id: {
    status: 400, message: "Product ID required",
    suggestions: ["Include the product ID in the URL: /products/{id}."],
  },
  product_not_found: {
    status: 404, message: "Product not found",
    suggestions: ["Verify the product ID is correct."],
  },
  product_id_conflict: {
    status: 409, message: "Product ID already exists",
    suggestions: ["Submit the request again to generate a new product ID."],
  },
  internal_error: {
    status: 500, message: "Internal server error",
    suggestions: ["If the problem persists, contact support with the request ID."],
  },
};

export function errorResponse(
  event: APIGatewayProxyEvent,
  type: keyof typeof errors,
  details?: { field: string; message: string }[],
) {
  const { status, message, suggestions } = errors[type];
  return createResponse(status, {
    error: {
      type, message, timestamp: new Date().toISOString(),
      request_id: event.requestContext.requestId, details, suggestions,
    },
  });
}
