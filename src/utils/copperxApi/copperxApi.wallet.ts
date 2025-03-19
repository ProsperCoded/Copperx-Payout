import {
  Wallet,
  WalletBalance,
  WalletBalances,
} from "../../types/wallet.types";
import { CopperxApiBase } from "./copperxApi";

export class CopperxApiWalletService extends CopperxApiBase {
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

  // async getSupportedNetworks() {
  //   try {
  //     const response = await this.api.get("/api/wallets/networks");
  //     this.logger.info("Fetched supported networks", response.data);
  //     return response.data;
  //   } catch (error) {
  //     this.logger.error("Error fetching supported networks", error.message);
  //     throw error;
  //   }
  // }

  // async getTokenBalance(chainId: string, token: string) {
  //   try {
  //     const response = await this.api.get(
  //       `/api/wallets/${chainId}/tokens/${token}/balance`
  //     );
  //     this.logger.info(
  //       "Fetched token balance",
  //       { chainId, token },
  //       response.data
  //     );
  //     return response.data;
  //   } catch (error) {
  //     this.logger.error("Error fetching token balance", error.message);
  //     throw error;
  //   }
  // }
}
