import app from "./app";
import { EnvValidation } from "./utils/env.validation";
const server = app.listen(app.get("port"), () => {
  console.log("Server Starting up....");
  console.log(`=>     http://localhost:${app.get("port")}`);

  // Validating environment variables
  EnvValidation.validate();

  if (EnvValidation.isDevelopment()) {
    console.log("Environment: Development");
  } else {
    console.log("Environment: Production");
  }
  console.log(`Press CTRL + C to stop the server ,`, new Date().toString());
});

export default server;
