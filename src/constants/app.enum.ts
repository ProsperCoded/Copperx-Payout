import { HelmetOptions } from "helmet";
import { configService } from "../utils/config";
import { ENV } from "./env.enum";
import { CorsOptions } from "cors";

const HELMET_OPTIONS: HelmetOptions = {
  contentSecurityPolicy: false,
};

const CORS_OPTIONS: CorsOptions = {
  origin: "*", // allow all origins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export const AppEnum = {
  PORT: configService.get(ENV.PORT) || "3000",
  BASE_URL: configService.get("BASE_URL") || "http://localhost",
  NODE_ENV: configService.get(ENV.NODE_ENV) || "development",
  CORS_OPTIONS,
  HELMET_OPTIONS,
};
