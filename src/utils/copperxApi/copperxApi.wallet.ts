import {
  Wallet,
  WalletBalance,
  WalletBalances,
} from "../../types/wallet.types";
import { CopperxApiBase } from "./copperxApi";

export class CopperxApiWalletService extends CopperxApiBase {
  /**
   * Sets the authorization token for API requests
   * @param accessToken User's access token
   */
  setAccessToken(accessToken: string): void {
    this.api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  }

  async getOrganizationWallets(): Promise<Wallet[]> {
    try {
      const response = await this.api.get("/api/wallets");
      this.logger.info("Fetched organization wallets", response.data);
      return response.data;
    } catch (error) {
      this.logger.error("Error fetching organization wallets", error.message);
      throw error;
    }
  }

  async generateOrGetWallet(network: string): Promise<Wallet> {
    try {
      const response = await this.api.post("/api/wallets", { network });
      this.logger.info(
        "Generated or retrieved wallet",
        { network },
        response.data
      );
      return response.data;
    } catch (error) {
      this.logger.error("Error generating or retrieving wallet", error.message);
      throw error;
    }
  }

  async getDefaultWallet() {
    try {
      const response = await this.api.get("/api/wallets/default");
      this.logger.info("Fetched default wallet", response.data);
      return response.data;
    } catch (error) {
      this.logger.error("Error fetching default wallet", error.message);
      throw error;
    }
  }

  async setDefaultWallet(walletId: string) {
    try {
      const response = await this.api.post("/api/wallets/default", {
        walletId,
      });
      this.logger.info("Set default wallet", { walletId }, response.data);
      return response.data;
    } catch (error) {
      this.logger.error("Error setting default wallet", error.message);
      throw error;
    }
  }

  async getDefaultWalletBalance(): Promise<WalletBalance> {
    try {
      const response = await this.api.get("/api/wallets/balance");
      this.logger.info("Fetched default wallet balance", response.data);
      return response.data;
    } catch (error) {
      this.logger.error("Error fetching default wallet balance", error.message);
      throw error;
    }
  }

  async getAllWalletBalances(): Promise<WalletBalances> {
    try {
      const response = await this.api.get("/api/wallets/balances");
      this.logger.info("Fetched all wallet balances", response.data);
      return response.data;
    } catch (error) {
      this.logger.error("Error fetching all wallet balances", error.message);
      throw error;
    }
  }

  async getSupportedNetworks(): Promise<string[]> {
    try {
      // Mock implementation until API endpoint is available
      return ["ethereum", "polygon", "bitcoin", "solana"];
    } catch (error) {
      this.logger.error("Error fetching supported networks", error.message);
      throw error;
    }
  }
}
