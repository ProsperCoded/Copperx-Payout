import { ENV } from "../../constants/env.enum";
export interface ConfigInterface {
  get<T = string>(key: string, defaultValue: T): T | undefined;

  set<T = string>(key: string, value: T): void;
}
