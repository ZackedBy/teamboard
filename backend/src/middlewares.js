import { env } from "./env.js";

export function notFound(req, res, next) {
  res.status(404);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  next(error);
}

export function errorHandler(err, _req, res, _next) {
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  if (err.code === "23505") statusCode = 409;
  if (err.code === "23503" || err.code === "22P02") statusCode = 400;

  let message = err.message;
  if (err.code === "23505") message = "This record already exists";
  if (err.code === "23503") message = "Related record was not found";
  if (err.code === "22P02") message = "Invalid identifier";
  if (statusCode >= 500) message = "Internal server error";

  const body = { message };
  if (env.NODE_ENV === "development" && statusCode >= 500) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}
