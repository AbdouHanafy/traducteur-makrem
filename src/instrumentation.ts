import type { Instrumentation } from "next";

export function register() {
  // Provider-neutral hook point. Production platforms can collect stdout as structured JSON;
  // an APM SDK can be registered here without changing application routes.
  console.info(JSON.stringify({ level: "info", event: "app_started", runtime: process.env.NEXT_RUNTIME ?? "nodejs" }));
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const message = error instanceof Error ? error.message : String(error);
  const digest = typeof error === "object" && error !== null && "digest" in error ? String(error.digest) : undefined;
  // Never log headers, query strings, request bodies, cookies, documents, or payment payloads.
  console.error(JSON.stringify({
    level: "error",
    event: "request_error",
    message,
    digest,
    method: request.method,
    path: request.path.split("?", 1)[0],
    route: context.routePath,
    routeType: context.routeType,
  }));
};
