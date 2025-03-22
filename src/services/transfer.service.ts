import { CopperxApiTransfersService } from "../utils/copperxApi/copperxApi.transfers";
import { AuthService } from "./auth.service";
import { LoggerService } from "../utils/logger/logger.service";
import { LoggerPaths } from "../constants/logger-paths.enum";
import {
  BulkTransferRequest,
  CreateOfframpTransferRequest,
  Transfer,
  TransferListResponse,
  TransferRequest,
} from "../types/transfers.types";

export class TransferService {
  private static instance: TransferService;
  private copperxTransfersApi = new CopperxApiTransfersService();
  private authService = AuthService.getInstance();
  private logger = new LoggerService(LoggerPaths.APP);

  private constructor() {}

  public static getInstance(): TransferService {
    if (!this.instance) {
      this.instance = new TransferService();
    }
    return this.instance;
  }

  /**
   * Set the access token for the transfers API
   * @param accessToken The user's access token
   */
  private setAccessToken(accessToken: string): void {
    this.copperxTransfersApi.setAccessToken(accessToken);
  }

  async listTransfers(
    chatId: number,
    page: number = 1,
    limit: number = 5,
    status?: string
  ): Promise<TransferListResponse | null> {
    const accessToken = await this.authService.getAccessToken(chatId);
    if (!accessToken) {
      return null;
    }

    try {
      this.setAccessToken(accessToken);
      const transfers = await this.copperxTransfersApi.listTransfers({
        page,
        limit,
        status: status as any,
      });
      return transfers;
    } catch (error) {
      this.logger.error("Error fetching transfers", {
        error: error.message,
        chatId,
        page,
        limit,
      });
      return null;
    }
  }

  async getTransferById(
    chatId: number,
    transferId: string
  ): Promise<Transfer | null> {
    const accessToken = await this.authService.getAccessToken(chatId);
    if (!accessToken) {
      return null;
    }

    try {
      this.setAccessToken(accessToken);
      const transfer = await this.copperxTransfersApi.getTransferById(
        transferId
      );
      return transfer;
    } catch (error) {
      this.logger.error("Error fetching transfer by ID", {
        error: error.message,
        chatId,
        transferId,
      });
      return null;
    }
  }

  async sendTransfer(
    chatId: number,
    transferData: TransferRequest
  ): Promise<Transfer | null> {
    const accessToken = await this.authService.getAccessToken(chatId);
    console.log({ accessToken });
    if (!accessToken) {
      return null;
    }

    try {
      this.setAccessToken(accessToken);
      const result = await this.copperxTransfersApi.sendTransfer(transferData);

      return result;
    } catch (error) {
      this.logger.error("Error sending transfer", {
        error: error.message,
        chatId,
        transferData,
      });
      return null;
    }
  }

  async withdrawToWallet(
    chatId: number,
    transferData: TransferRequest
  ): Promise<Transfer | null> {
    const accessToken = await this.authService.getAccessToken(chatId);
    if (!accessToken) {
      return null;
    }

    try {
      this.setAccessToken(accessToken);
      const result = await this.copperxTransfersApi.withdrawToWallet(
        transferData
      );
      return result;
    } catch (error) {
      this.logger.error("Error withdrawing to wallet", {
        error: error.message,
        chatId,
        transferData,
      });
      return null;
    }
  }

  async sendBatchTransfer(
    chatId: number,
    batchData: BulkTransferRequest
  ): Promise<{ responses: Transfer[] } | null> {
    const accessToken = await this.authService.getAccessToken(chatId);
    if (!accessToken) {
      return null;
    }

    try {
      this.setAccessToken(accessToken);
      const result = await this.copperxTransfersApi.sendBatchTransfer(
        batchData
      );
      return result;
    } catch (error) {
      this.logger.error("Error sending batch transfer", {
        error: error.message,
        chatId,
        batchData,
      });
      return null;
    }
  }

  async createOfframpTransfer(
    chatId: number,
    offrampData: CreateOfframpTransferRequest
  ): Promise<Transfer | null> {
    const accessToken = await this.authService.getAccessToken(chatId);
    if (!accessToken) {
      return null;
    }

    try {
      this.setAccessToken(accessToken);
      const result = await this.copperxTransfersApi.createOfframpTransfer(
        offrampData
      );
      return result;
    } catch (error) {
      this.logger.error("Error creating offramp transfer", {
        error: error.message,
        chatId,
        offrampData,
      });
      return null;
    }
  }
}
