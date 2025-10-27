type ApiEnv = "dev" | "prod";

const rawEnv = (process.env.NEXT_PUBLIC_APP_ENV || process.env.APP_ENV || "")
  .trim()
  .toLowerCase();

const resolveApiEnv = (): ApiEnv => {
  if (rawEnv === "prod" || rawEnv === "production") {
    return "prod";
  }
  if (rawEnv === "dev" || rawEnv === "development") {
    return "dev";
  }
  return process.env.NODE_ENV === "production" ? "prod" : "dev";
};

export const apiEnv: ApiEnv = resolveApiEnv();

const devTarget =
  process.env.NEXT_PUBLIC_API_TARGET_DEV || "http://localhost:8889";
const prodTarget =
  process.env.NEXT_PUBLIC_API_TARGET_PROD ||
  process.env.NEXT_PUBLIC_API_TARGET ||
  "http://blogapi.hejiajun.icu";

const normalize = (url: string) => url.replace(/\/$/, "");

const apiTargets: Record<ApiEnv, string> = {
  dev: normalize(devTarget),
  prod: normalize(prodTarget),
};

export const apiServerTarget = apiTargets[apiEnv];
export const apiServerBaseUrl = `${apiServerTarget}/api`;

const clientBaseMap: Record<ApiEnv, string> = {
  dev: process.env.NEXT_PUBLIC_API_BASE_URL_DEV || "/api",
  prod:
    process.env.NEXT_PUBLIC_API_BASE_URL_PROD ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "/api",
};

export const apiClientBaseUrl = clientBaseMap[apiEnv];
