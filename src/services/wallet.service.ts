import { CopperxApiWalletService } from "../utils/copperxApi/copperxApi.wallet";
import { AuthService } from "./auth.service";
import { LoggerService } from "../utils/logger/logger.service";
import { LoggerPaths } from "../constants/logger-paths.enum";
import { TelegramService } from "../utils/telegram/telegram.service";

export interface WalletInfo {
  id: string;
  address: string;
  network: string;
  isDefault: boolean;
}

export interface WalletBalance {
  network: string;
  balance: string;
  token?: string;
}

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

  async getUserWallets(chatId: number): Promise<WalletInfo[] | null> {
    const accessToken = this.authService.getAccessToken(chatId);
    if (!accessToken) {
      return null;
    }

    try {
      this.copperxWalletApi.api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;
      const wallets = await this.copperxWalletApi.getOrganizationWallets();

      // Get default wallet to compare
      const defaultWallet = await this.copperxWalletApi.getDefaultWallet();

      return wallets.map((wallet) => ({
        id: wallet.id,
        address: wallet.address,
        network: wallet.network,
        isDefault: wallet.id === defaultWallet.id,
      }));
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
    const accessToken = this.authService.getAccessToken(chatId);
    if (!accessToken) {
      return null;
    }

    try {
      this.copperxWalletApi.api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;

      if (walletId) {
        // If a specific walletId is provided, first set it as the default
        await this.copperxWalletApi.setDefaultWallet(walletId);
      }

      const balanceData = await this.copperxWalletApi.getDefaultWalletBalance();

      return {
        network: balanceData.network,
        balance: `${balanceData.balance} ${balanceData.symbol || ""}`,
        token: balanceData.token,
      };
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
    const accessToken = this.authService.getAccessToken(chatId);
    if (!accessToken) {
      return null;
    }

    try {
      this.copperxWalletApi.api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;
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
    const accessToken = this.authService.getAccessToken(chatId);
    if (!accessToken) {
      return false;
    }

    try {
      this.copperxWalletApi.api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;
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
  ): Promise<WalletInfo | null> {
    const accessToken = this.authService.getAccessToken(chatId);
    if (!accessToken) {
      return null;
    }

    try {
      this.copperxWalletApi.api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;
      const wallet = await this.copperxWalletApi.generateOrGetWallet(network);

      return {
        id: wallet.id,
        address: wallet.address,
        network: wallet.network,
        isDefault: false, // Newly created wallet is not default by default
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
    const accessToken = this.authService.getAccessToken(chatId);
    if (!accessToken) {
      return null;
    }

    try {
      this.copperxWalletApi.api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;
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
