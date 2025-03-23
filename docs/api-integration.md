# CopperX API Integration

This document provides details on how the CopperX Payout Bot integrates with the CopperX API for authentication, wallet management, transfers, and notifications.

## API Overview

The CopperX Payout Bot integrates with the following APIs:

1. **CopperX API**: For authentication, wallet management, and transfers
2. **Telegram Bot API**: For user interactions
3. **Pusher API**: For real-time notifications

## CopperX API Integration

### Base Configuration

The bot communicates with the CopperX API through a set of specialized service classes. The base API client is configured in `src/utils/copperxApi/copperxApi.ts`:

```typescript
export class CopperxApiBase {
  public readonly api = axios.create({
    baseURL: "https://income-api.copperx.io",
    headers: {
      "Content-Type": "application/json",
    },
  });
  protected readonly logger = new LoggerService(LoggerPaths.COPPERX_API);
}
```

### Authentication API

The bot authenticates users with the CopperX platform using email OTP verification. This is implemented in `src/utils/copperxApi/copperxApi.auth.ts`:

```typescript
// Request an email OTP and return the session ID (sid)
async requestEmailOtp(email: string): Promise<{ email: string; sid: string }> {
  try {
    const response = await this.api.post("/api/auth/email-otp/request", {
      email,
    });
    this.logger.info("Requested email OTP", { email });
    return response.data;
  } catch (error) {
    this.logger.error("Error requesting email OTP", error.message);
    throw error;
  }
}

// Authenticate using email OTP and return the access token
async authenticateWithEmailOtp(
  email: string,
  otp: string,
  sid: string
): Promise<{
  scheme: string;
  accessToken: string;
  accessTokenId: string;
  expireAt: string;
  user: UserProfile;
}> {
  try {
    const response = await this.api.post("/api/auth/email-otp/authenticate", {
      email,
      otp,
      sid,
    });
    this.logger.info("Authenticated with email OTP", { email });
    return response.data;
  } catch (error) {
    this.logger.error("Error authenticating with email OTP", error.message);
    throw error;
  }
}
```

### Wallet API

The wallet operations are handled by `src/utils/copperxApi/copperxApi.wallet.ts`:

```typescript
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
```

### Transfer API

Transfer operations are managed by `src/utils/copperxApi/copperxApi.transfers.ts`:

```typescript
async listTransfers(params?: {
  page?: number;
  limit?: number;
  status?: "pending" | "initiated" | "processing" | "success" | "canceled" | "failed" | "refunded";
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
```

## Telegram API Integration

The bot communicates with the Telegram Bot API through the `TelegramService` in `src/utils/telegram/telegram.service.ts`:

```typescript
static async sendMessage(
  chatId: number,
  text: string,
  options?: {
    inlineKeyboard?: InlineKeyboardButton[][];
    replyKeyboard?: ReplyKeyboardButton[][];
    oneTimeKeyboard?: boolean;
    removeKeyboard?: boolean;
  }
) {
  const replyMarkup: any = {};

  if (options?.inlineKeyboard) {
    replyMarkup.inline_keyboard = options.inlineKeyboard;
  }

  // ...more options processing...

  try {
    await this.apiTelegram.post(`/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: Object.keys(replyMarkup).length ? replyMarkup : undefined,
    });
  } catch (error) {
    console.error("Error sending telegram message:", error);
    throw error;
  }
}
```

## Pusher Integration for Real-time Notifications

The bot uses Pusher for real-time notifications. This is implemented in `src/services/notification.service.ts`:

```typescript
public async initializePusher(
  chatId: number,
  organizationId: string,
  accessToken: string
): Promise<boolean> {
  try {
    const pusherKey = configService.get(ENV.PUSHER_KEY) || "e089376087cac1a62785";
    const pusherCluster = configService.get(ENV.PUSHER_CLUSTER) || "ap1";
    const apiUrl = configService.get(ENV.COPPERX_API_URL) || "https://income-api.copperx.io";

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
```

## Authentication Flow

1. User sends `/login` command or clicks login button
2. Bot asks for email address
3. User provides email
4. Bot calls `requestEmailOtp` to obtain a session ID (sid)
5. CopperX sends OTP to user's email
6. User provides OTP to bot
7. Bot calls `authenticateWithEmailOtp` to verify OTP and obtain access token
8. Access token is stored in user's session for subsequent API calls

## API Security Considerations

1. **Token Management**: Access tokens are stored securely in the Redis database
2. **Token Refresh**: Tokens have an expiration time and are refreshed as needed
3. **Rate Limiting**: API calls are rate-limited to prevent abuse
4. **Error Handling**: API errors are properly logged and handled gracefully
5. **Authorization**: All API calls requiring authentication include the access token in the Authorization header

## Error Handling

Each API call includes proper error handling and logging:

```typescript
try {
  // API call
} catch (error) {
  this.logger.error("Error description", {
    error: error.message,
    additionalContext,
  });
  // Handle error appropriately
}
```

## Best Practices

1. **Abstraction**: API calls are abstracted behind service classes
2. **Modularity**: Each API area (auth, wallet, transfers) has its own service
3. **Error Handling**: All API calls include proper error handling
4. **Logging**: Comprehensive logging for debugging and auditing
5. **Rate Limiting**: Prevents abuse of the API
6. **Security**: Proper token management and authorization
