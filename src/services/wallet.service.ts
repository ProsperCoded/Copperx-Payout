import { CopperxApiWalletService } from "../utils/copperxApi/copperxApi.wallet";
import { AuthService } from "./auth.service";
import { LoggerService } from "../utils/logger/logger.service";
import { LoggerPaths } from "../constants/logger-paths.enum";
import { TelegramService } from "../utils/telegram/telegram.service";
import { Wallet, WalletBalance, WalletBalances } from "../types/wallet.types";

export class WalletService {
  private static instance: WalletService;
  private copperxWalletApi = new CopperxApiWalletService();
  private authService = AuthService.getInstance();
  private logger = new LoggerService(LoggerPaths.APP);

  private constructor() {}

  public static getInstance(): WalletService {
    if (!this.instance) {
      this.instance = new WalletService();
    }
    return this.instance;
  }

  /**
   * Set the access token for the wallet API
   * @param accessToken The user's access token
   */
  private setAccessToken(accessToken: string): void {
    this.copperxWalletApi.setAccessToken(accessToken);
  }

  async getUserWallets(chatId: number): Promise<Wallet[] | null> {
    const accessToken = await this.authService.getAccessToken(chatId);
    if (!accessToken) {
      return null;
    }

    try {
      this.setAccessToken(accessToken);
      const wallets = await this.copperxWalletApi.getOrganizationWallets();
      return wallets;
    } catch (error) {
      this.logger.error("Error fetching user wallets", {
        error: error.message,
        chatId,
      });
      return null;
    }
  }

  async getWalletBalance(
    chatId: number,
    walletId?: string
  ): Promise<WalletBalance | null> {
    const accessToken = await this.authService.getAccessToken(chatId);
    if (!accessToken) {
      return null;
    }

    try {
      this.setAccessToken(accessToken);

      if (walletId) {
        // If a specific walletId is provided, first set it as the default
        await this.copperxWalletApi.setDefaultWallet(walletId);
      }

      const balanceData = await this.copperxWalletApi.getDefaultWalletBalance();
      return balanceData;
    } catch (error) {
      this.logger.error("Error fetching wallet balance", {
        error: error.message,
        chatId,
        walletId,
      });
      return null;
    }
  }

  async getAllWalletBalances(chatId: number): Promise<WalletBalance[] | null> {
    const accessToken = await this.authService.getAccessToken(chatId);
    if (!accessToken) {
      return null;
    }

    try {
      this.setAccessToken(accessToken);
      const balances = await this.copperxWalletApi.getAllWalletBalances();

      return balances.map((balance) => ({
        network: balance.network,
        balance: `${balance.balance} ${balance.symbol || ""}`,
        token: balance.token,
      }));
    } catch (error) {
      this.logger.error("Error fetching all wallet balances", {
        error: error.message,
        chatId,
      });
      return null;
    }
  }

  async setDefaultWallet(chatId: number, walletId: string): Promise<boolean> {
    const accessToken = await this.authService.getAccessToken(chatId);
    if (!accessToken) {
      return false;
    }

    try {
      this.setAccessToken(accessToken);
      await this.copperxWalletApi.setDefaultWallet(walletId);
      return true;
    } catch (error) {
      this.logger.error("Error setting default wallet", {
        error: error.message,
        chatId,
        walletId,
      });
      return false;
    }
  }

  async generateWallet(
    chatId: number,
    network: string
  ): Promise<Wallet | null> {
    const accessToken = await this.authService.getAccessToken(chatId);
    if (!accessToken) {
      return null;
    }

    try {
      this.setAccessToken(accessToken);
      const wallet = await this.copperxWalletApi.generateOrGetWallet(network);

      return {
        id: wallet.id,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
        organizationId: wallet.organizationId,
        walletType: wallet.walletType,
        network: wallet.network,
        walletAddress: wallet.walletAddress,
        isDefault: wallet.isDefault,
      };
    } catch (error) {
      this.logger.error("Error generating wallet", {
        error: error.message,
        chatId,
        network,
      });
      return null;
    }
  }

  async getSupportedNetworks(chatId: number): Promise<string[] | null> {
    const accessToken = await this.authService.getAccessToken(chatId);
    if (!accessToken) {
      return null;
    }

    try {
      this.setAccessToken(accessToken);
      const networks = await this.copperxWalletApi.getSupportedNetworks();
      return networks;
    } catch (error) {
      this.logger.error("Error fetching supported networks", {
        error: error.message,
        chatId,
      });
      return null;
    }
  }
}
