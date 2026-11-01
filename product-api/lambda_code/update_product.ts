import type { APIGatewayProxyResult } from "aws-lambda";
import { createResponse } from "./catalog";

export async function handler(): Promise<APIGatewayProxyResult> {
  return createResponse(501, {
    error: "NotImplementedError",
    message:
      "PUT /products/{id} is implemented in the data module of this learning plan",
  });
}
