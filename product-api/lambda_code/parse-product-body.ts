import type { APIGatewayProxyEvent } from "aws-lambda";
import { createResponse } from "./catalog";
import { productInputSchema } from "./schemas/product-input";

export function parseProductBody(event: APIGatewayProxyEvent) {
  let input: unknown;
  try {
    const body = event.body ?? "";
    input = JSON.parse(event.isBase64Encoded ? Buffer.from(body, "base64").toString("utf8") : body);
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    return { success: false, response: createResponse(400, { error: "Invalid JSON" }) } as const;
  }

  const result = productInputSchema.safeParse(input);
  if (!result.success) {
    const response = createResponse(400, { error: "Validation failed", issues: result.error.issues });
    return { success: false, response } as const;
  }
  return { success: true, data: result.data } as const;
}
