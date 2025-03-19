export abstract class BaseException extends Error {
  public status?: number;
  constructor(public message: string, public cause?: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  public toString(): string {
    return `${this.name}: ${this.message} (${this.status}) ${
      this.cause ? "; caused by: " + this.cause : ""
    }`;
  }
}
