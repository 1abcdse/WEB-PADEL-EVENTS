export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export const notFound = (what: string) => new ApiError(404, "NOT_FOUND", `${what} not found`);
export const conflict = (code: string, message: string, details?: unknown) => new ApiError(409, code, message, details);
export const badRequest = (code: string, message: string, details?: unknown) => new ApiError(400, code, message, details);
export const forbidden = (message = "Forbidden") => new ApiError(403, "FORBIDDEN", message);
