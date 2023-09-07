import { Request, Response } from "express";

interface ResponseBody<T = unknown> {
  code: number;
  result: T | string;
}

export type Category = "ssul";

export type CommonRequest = Request;

export type CommonResponse<T = unknown> = Response<ResponseBody<T>>;

export interface PaginationBody<T = unknown> {
  page: number;
  totalPages: number;
  totalResults: number;
  results: Array<T>;
}
