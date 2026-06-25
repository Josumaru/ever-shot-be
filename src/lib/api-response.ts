import { NextResponse } from "next/server";
import {
  HTTP_STATUS,
  type HttpStatusCode,
} from "@/shared/constants/status-codes";

type ApiResponseData = Record<string, unknown> | unknown[] | null;

type ApiResponseEnvelope<T = ApiResponseData> = {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

export function apiSuccess<T = ApiResponseData>(
  data: T,
  message = "Success",
  status: HttpStatusCode = HTTP_STATUS.OK,
  meta?: Record<string, unknown>,
) {
  const body: ApiResponseEnvelope<T> = { success: true, message, data };
  if (meta) body.meta = meta;
  return NextResponse.json(body, { status });
}

export function apiCreated<T = ApiResponseData>(data: T, message = "Created") {
  return apiSuccess(data, message, HTTP_STATUS.CREATED);
}

export function apiError(
  message: string,
  status: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
) {
  const body: ApiResponseEnvelope = { success: false, message, data: null };
  return NextResponse.json(body, { status });
}

export function apiBadRequest(message: string) {
  return apiError(message, HTTP_STATUS.BAD_REQUEST);
}

export function apiUnauthorized(message = "Unauthorized") {
  return apiError(message, HTTP_STATUS.UNAUTHORIZED);
}

export function apiNotFound(message = "Not found") {
  return apiError(message, HTTP_STATUS.NOT_FOUND);
}

export function apiForbidden(message = "Forbidden") {
  return apiError(message, HTTP_STATUS.FORBIDDEN);
}

export function apiConflict(message: string) {
  return apiError(message, HTTP_STATUS.CONFLICT);
}
