import {
  BulkTransferRequest,
  CreateOfframpTransferRequest,
  Transfer,
  TransferListResponse,
  TransferRequest,
} from "../../types/transfers.types";
import { CopperxApiBase } from "./copperxApi";

// Define types for request and response bodies

export class CopperxApiTransfersService extends CopperxApiBase {
  setAccessToken(accessToken: string): void {
    this.api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  }

  /**
   * Fetch a list of all transfers with optional query parameters.
   * @param params Optional query parameters for filtering results.
   * @returns A list of transfers matching the given filters.
   */
  async listTransfers(params?: {
    page?: number;
    limit?: number;
    status?:
      | "pending"
      | "initiated"
      | "processing"
      | "success"
      | "canceled"
      | "failed"
      | "refunded";
  }): Promise<TransferListResponse> {
    try {
      const response = await this.api.get("/api/transfers", { params });
      this.logger.info("Fetched transfers list", params);
      return response.data;
    } catch (error) {
      this.logger.error("Error fetching transfers list", error.message);
      throw error;
    }
  }

  /**
   * Fetch a transfer by its ID.
   * @param id The transfer ID.
   * @returns The transfer details.
   */
  async getTransferById(id: string): Promise<Transfer> {
    try {
      const response = await this.api.get(`/api/transfers/${id}`);
      this.logger.info("Fetched transfer by ID", { id });
      return response.data;
    } catch (error) {
      this.logger.error("Error fetching transfer by ID", error.message);
      throw error;
    }
  }

  /**
   * Create an offramp transfer, allowing funds to be moved off the platform.
   * @param data The transfer request details, including recipient information and payment details.
   * @returns The response containing details of the created transfer.
   */
  // Context: An offramp transfer refers to the process of converting cryptocurrency or digital assets into traditional (fiat) currency and withdrawing it to a bank account or other off-chain financial system. This is the opposite of onramp transfers, where fiat is converted into crypto.
  // Moves Money from Web3 to Web2 Financial Systems
  async createOfframpTransfer(
    data: CreateOfframpTransferRequest
  ): Promise<Transfer> {
    try {
      const response = await this.api.post("/api/transfers/offramp", data);
      this.logger.info("Created offramp transfer", data);
      return response.data;
    } catch (error) {
      this.logger.error("Error creating offramp transfer", error.message);
      throw error;
    }
  }

  /**
   * Send a payment to a user using email or wallet address.
   * @param data Transfer request details.
   * @returns The transfer response.
   */
  async sendTransfer(data: TransferRequest): Promise<Transfer> {
    try {
      this.logger.info("Sending transfer...", data);
      const response = await this.api.post("/api/transfers/send", data);
      this.logger.info("Sent transfer", data);
      return response.data;
    } catch (error) {
      this.logger.error("Error sending transfer", error.message);
      throw error;
    }
  }

  /**
   * Withdraw balance to a specified wallet.
   * @param data Transfer request details.
   * @returns The transfer response.
   */
  async withdrawToWallet(data: TransferRequest): Promise<Transfer> {
    try {
      const response = await this.api.post(
        "/api/transfers/wallet-withdraw",
        data
      );
      this.logger.info("Withdrawn balance to wallet", data);
      return response.data;
    } catch (error) {
      this.logger.error("Error withdrawing to wallet", error.message);
      throw error;
    }
  }

  /**
   * Send payments to multiple users in a batch.
   * @param data Bulk transfer request.
   * @returns The transfer response.
   */
  async sendBatchTransfer(
    data: BulkTransferRequest
  ): Promise<{ responses: Transfer[] }> {
    try {
      const response = await this.api.post("/api/transfers/send-batch", data);
      this.logger.info("Sent batch transfer", data);
      return response.data;
    } catch (error) {
      this.logger.error("Error sending batch transfer", error.message);
      throw error;
    }
  }
}
