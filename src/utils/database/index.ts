import { DatabaseService } from "./database.service";

const databaseService = new DatabaseService();

// Verify connection before exporting
(async () => {
  const isConnected = await databaseService.ping();
  if (!isConnected) {
    console.error("Failed to establish Redis connection");
    process.exit(1);
  }
})();

export default databaseService.getClient();
