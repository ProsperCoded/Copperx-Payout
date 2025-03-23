import Pusher, { Channel } from "pusher-js";
import axios from "axios";
import { configService } from "../utils/config";
import { ENV } from "../constants/env.enum";
import { LoggerService } from "../utils/logger/logger.service";
import { LoggerPaths } from "../constants/logger-paths.enum";
import { TelegramService } from "../utils/telegram/telegram.service";
import { SessionService } from "../utils/session/session.service";

interface DepositEvent {
  amount: string;
  currency: string;
  network: string;
  walletAddress: string;
  transactionHash: string;
  timestamp: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private logger = new LoggerService(LoggerPaths.APP);
  private pusherClient: Pusher | null = null;
  private sessionService = SessionService.getInstance();
  private channelSubscriptions: Record<string, Channel> = {};

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!this.instance) {
      this.instance = new NotificationService();
    }
    return this.instance;
  }

  /**
   * Initialize the Pusher client for a user
   * @param chatId Telegram chat ID
   * @param organizationId User's organization ID
   * @param accessToken User's access token
   */
  public async initializePusher(
    chatId: number,
    organizationId: string,
    accessToken: string
  ): Promise<boolean> {
    try {
      const pusherKey =
        configService.get(ENV.PUSHER_KEY) || "e089376087cac1a62785";
      const pusherCluster = configService.get(ENV.PUSHER_CLUSTER) || "ap1";
      const apiUrl =
        configService.get(ENV.COPPERX_API_URL) ||
        "https://income-api.copperx.io";

      if (this.channelSubscriptions[organizationId]) {
        this.logger.info(
          `Channel for organization ${organizationId} already exists`
        );
        return true;
      }

      this.logger.info(
        `Initializing Pusher for organization ${organizationId}`
      );

      // Initialize Pusher client with authentication
      if (!this.pusherClient) {
        this.pusherClient = new Pusher(pusherKey, {
          cluster: pusherCluster,
          authorizer: (channel) => ({
            authorize: async (socketId, callback) => {
              try {
                const response = await axios.post(
                  `${apiUrl}/api/notifications/auth`,
                  {
                    socket_id: socketId,
                    channel_name: channel.name,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                    },
                  }
                );

                if (response.data) {
                  callback(null, response.data);
                } else {
                  callback(new Error("Pusher authentication failed"), null);
                }
              } catch (error) {
                this.logger.error("Pusher authorization error:", error);
                callback(error, null);
              }
            },
          }),
        });
      }

      // Subscribe to organization's private channel
      const channelName = `private-org-${organizationId}`;
      const channel = this.pusherClient.subscribe(channelName);

      // Store subscription for later use
      this.channelSubscriptions[organizationId] = channel;

      // Set up event listeners
      channel.bind("pusher:subscription_succeeded", () => {
        this.logger.info(`Successfully subscribed to channel ${channelName}`);
      });

      channel.bind("pusher:subscription_error", (error) => {
        this.logger.error(
          `Subscription error for channel ${channelName}:`,
          error
        );
        return false;
      });

      // Bind to the deposit event
      channel.bind("deposit", async (data: DepositEvent) => {
        await this.handleDepositEvent(chatId, data);
      });

      return true;
    } catch (error) {
      this.logger.error("Error initializing Pusher client:", error);
      return false;
    }
  }

  /**
   * Handle incoming deposit events
   * @param chatId Telegram chat ID
   * @param data Deposit event data
   */
  private async handleDepositEvent(
    chatId: number,
    data: DepositEvent
  ): Promise<void> {
    try {
      // Format the message with deposit details
      const message =
        `💰 *New Deposit Received*\n\n` +
        `Amount: ${data.amount} ${data.currency}\n` +
        `Network: ${data.network}\n` +
        `Address: ${this.shortenAddress(data.walletAddress)}\n` +
        `Transaction: ${this.shortenAddress(data.transactionHash)}\n` +
        `Time: ${new Date(data.timestamp).toLocaleString()}`;

      // Send notification to user via Telegram
      await TelegramService.sendMessage(chatId, message);

      this.logger.info(`Sent deposit notification to user ${chatId}`, {
        amount: data.amount,
        currency: data.currency,
      });
    } catch (error) {
      this.logger.error("Error handling deposit event:", error);
    }
  }

  /**
   * Subscribe all authenticated users to their respective organization channels
   */
  public async subscribeAllUsers(): Promise<void> {
    try {
      // Get all valid sessions from Redis
      const sessions = await this.sessionService.getAllSessions();

      for (const session of sessions) {
        if (
          session.authData?.accessToken &&
          session.organizationId &&
          new Date(session.authData.expireAt) > new Date()
        ) {
          await this.initializePusher(
            session.chatId,
            session.organizationId,
            session.authData.accessToken
          );
        }
      }

      this.logger.info(
        `Subscribed ${sessions.length} users to their notification channels`
      );
    } catch (error) {
      this.logger.error("Error subscribing all users to notifications:", error);
    }
  }

  /**
   * Unsubscribe from a user's organization channel
   * @param organizationId The organization ID to unsubscribe from
   */
  public unsubscribe(organizationId: string): void {
    try {
      if (this.pusherClient && this.channelSubscriptions[organizationId]) {
        this.pusherClient.unsubscribe(`private-org-${organizationId}`);
        delete this.channelSubscriptions[organizationId];
        this.logger.info(
          `Unsubscribed from channel for organization ${organizationId}`
        );
      }
    } catch (error) {
      this.logger.error(
        `Error unsubscribing from organization ${organizationId}:`,
        error
      );
    }
  }

  /**
   * Helper function to shorten addresses/hashes for display
   */
  private shortenAddress(address: string): string {
    if (!address) return "";
    return address.length > 15
      ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      : address;
  }
}
