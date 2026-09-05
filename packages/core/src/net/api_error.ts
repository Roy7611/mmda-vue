export interface ValidationError {
  field: string;
  error: string;
}

/** 后端 JSON 错误体（HTTP 错误或 200 内嵌业务错误） */
export interface ApiErrorPayload {
  status?: number | string;
  code?: string;
  error?: string;
  message?: string;
  detail?: string;
  cause?: string;
  validationErrors?: ValidationError[];
}

/** @deprecated 使用 {@link ApiProblem}。 */
export class ApiError extends Error {
  readonly name = "ApiError";

  constructor(
    public readonly code?: string,
    public readonly error?: string,
    message?: string,
    public readonly cause?: string,
    public readonly status?: number,
    public readonly validationErrors?: Array<ValidationError>,
    public readonly request?: Request,
  ) {
    super(message ?? error ?? code ?? "ApiError");
    Object.setPrototypeOf(this, new.target.prototype);
  }

  override toString() {
    return `${this.message}${this.cause ? `, ${this.cause}` : ""}`;
  }

  toJSON(): ApiErrorPayload {
    return {
      code: this.code,
      error: this.error,
      message: this.message,
      cause: this.cause,
      status: this.status,
      validationErrors: this.validationErrors,
    };
  }
}

export function isApiError(data: unknown): data is ApiError {
  return data instanceof ApiError;
}

/**
 * 判断 JSON 体是否为后端业务错误（HTTP 200 但 body 含 status/code/message）。
 */
export function isApiErrorPayload(data: unknown): data is ApiErrorPayload {
  if (!data || typeof data !== "object" || data instanceof ApiError) return false;
  const d = data as Record<string, unknown>;
  const status = d.status;
  const statusNum = typeof status === "string" ? Number(status) : status;
  return (
    typeof statusNum === "number" &&
    !Number.isNaN(statusNum) &&
    statusNum >= 400 &&
    Boolean(d.code || d.error || d.message || d.detail)
  );
}

function asStatus(value: unknown): number | undefined {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value !== "") {
    const n = Number(value);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

/**
 * 将 plain object、Response 失败体或已有 ApiError 统一转为 ApiError。
 */
export function toApiError(data: unknown, req?: Request): ApiError {
  if (data instanceof ApiError) {
    if (req && !data.request) {
      return new ApiError(
        data.code,
        data.error,
        data.message,
        data.cause,
        data.status,
        data.validationErrors,
        req,
      );
    }
    return data;
  }
  if (data instanceof Error && data.name === "ApiProblem") {
    const problem = data as Error & {
      type?: string;
      title?: string;
      status?: number;
      detail?: string;
      cause?: unknown;
      validationErrors?: ValidationError[];
      request?: Request;
    };
    const code =
      typeof problem.type === "string" && problem.type !== "about:blank"
        ? problem.type
        : undefined;
    return new ApiError(
      code,
      problem.title,
      problem.detail ?? problem.message,
      typeof problem.cause === "string" ? problem.cause : undefined,
      problem.status,
      problem.validationErrors,
      req ?? problem.request,
    );
  }
  if (data instanceof Error) {
    return new ApiError(undefined, undefined, data.message, undefined, undefined, undefined, req);
  }
  const d =
    data && typeof data === "object"
      ? (data as ApiErrorPayload)
      : ({ message: data == null ? undefined : String(data) } as ApiErrorPayload);
  return new ApiError(
    d.code,
    d.error,
    d.message ?? d.detail,
    d.cause,
    asStatus(d.status),
    d.validationErrors,
    req,
  );
}
