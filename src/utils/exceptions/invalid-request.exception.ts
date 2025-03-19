import { HttpStatus } from "../../constants/http-status";
import { BaseException } from "./base.exception";

export class InvalidRequestException extends BaseException {
  constructor(message: string, cause?: string) {
    super(message, cause || "Invalid Request");
    this.status = HttpStatus.BAD_REQUEST;
  }
}
