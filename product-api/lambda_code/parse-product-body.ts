import type { APIGatewayProxyEvent } from "aws-lambda";
import { errorResponse } from "./error-response";
import { productInputSchema } from "./schemas/product-input";

export function parseProductBody(event: APIGatewayProxyEvent) {
  let input: unknown;
  try {
    const body = event.body ?? "";
    input = JSON.parse(event.isBase64Encoded ? Buffer.from(body, "base64").toString("utf8") : body);
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    return { success: false, response: errorResponse(event, "invalid_json") } as const;
  }

  const result = productInputSchema.safeParse(input);
  if (!result.success) {
    const details = result.error.issues.map(issue => ({
      field: issue.path.join(".") || "body",
      message: issue.code === "unrecognized_keys"
        ? "Send only title, category, description, and price."
        : issue.message,
    }));
    const response = errorResponse(event, "validation_error", details);
    return { success: false, response } as const;
  }
  return { success: true, data: result.data } as const;
}
