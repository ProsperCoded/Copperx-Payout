import { HttpStatus } from "../../constants/http-status";
import { BaseException } from "./base.exception";

export class NotFoundException extends BaseException {
  constructor(message: string, cause?: string) {
    super(message, cause || "Not Found");
    this.status = HttpStatus.NOT_FOUND;
  }
}
