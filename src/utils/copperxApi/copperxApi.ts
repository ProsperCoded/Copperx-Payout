import axios from "axios";
import { LoggerService } from "../logger/logger.service";
import { LoggerPaths } from "../../constants/logger-paths.enum";

export class CopperxApiBase {
  protected readonly api = axios.create({
    baseURL: "https://income-api.copperx.io",
    headers: {
      "Content-Type": "application/json",
    },
  });
  protected readonly logger = new LoggerService(LoggerPaths.COPPERX_API);
}
