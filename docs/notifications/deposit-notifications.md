# Deposit Notifications

This document details the real-time deposit notification system implemented in the CopperX Payout Bot. The notification system uses Pusher to provide instant alerts when funds are deposited to a user's wallet.

## Notification System Overview

The CopperX Payout Bot includes a real-time notification system that:

1. Subscribes to private channels for each authenticated user
2. Listens for deposit events on these channels
3. Sends immediate Telegram notifications when deposits are received
4. Automatically resubscribes users when the bot restarts

This provides users with timely information about their wallet activity without requiring them to manually check their balances.

## Notification Implementation

### Notification Service

The core of the notification system is the `NotificationService` in `src/services/notification.service.ts`. This service:

- Manages connections to Pusher
- Handles authentication with the CopperX API
- Subscribes to private channels for users
- Processes incoming events
- Sends formatted notifications to users

The service is implemented as a singleton to ensure a single instance manages all connections:

```typescript
export class NotificationService {
  private static instance: NotificationService;
  private logger = new LoggerService(LoggerPaths.APP);
  private pusherClient: Pusher | null = null;
  private sessionService = SessionService.getInstance();
  private channelSubscriptions: Record<string, Channel> = {};

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // ...service methods
}
```

### Initializing Pusher for a User

When a user successfully authenticates, the notification service initializes a Pusher connection for them:

```typescript
public async initializePusher(
  chatId: number,
  organizationId: string,
  accessToken: string
): Promise<boolean> {
  try {
    // Get configuration values
    const pusherKey = configService.get(ENV.PUSHER_KEY) || "e089376087cac1a62785";
    const pusherCluster = configService.get(ENV.PUSHER_CLUSTER) || "ap1";
    const apiUrl = configService.get(ENV.COPPERX_API_URL) || "https://income-api.copperx.io";

    // Check if already subscribed
    if (this.channelSubscriptions[organizationId]) {
      this.logger.info(`Channel for organization ${organizationId} already exists`);
      return true;
    }

    this.logger.info(`Initializing Pusher for organization ${organizationId}`);

    // Initialize Pusher client with authentication
    if (!this.pusherClient) {
      this.pusherClient = new Pusher(pusherKey, {
        cluster: pusherCluster,
        authorizer: (channel) => ({
          authorize: async (socketId, callback) => {
            try {
              // Authenticate with CopperX API
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
      this.logger.error(`Subscription error for channel ${channelName}:`, error);
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
```

### Handling Deposit Events

When a deposit event is received, the service processes it and sends a notification to the user:

```typescript
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
```

### Subscribing All Users on Startup

When the bot starts up, it automatically subscribes all authenticated users to their notification channels:

```typescript
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
```

### Unsubscribing Users

When a user logs out, the service unsubscribes them from their notification channel:

```typescript
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
```

## Deposit Event Data Structure

The notification system handles deposit events with the following structure:

```typescript
interface DepositEvent {
  amount: string; // Amount of the deposit
  currency: string; // Currency code
  network: string; // Blockchain network
  walletAddress: string; // Wallet address receiving the deposit
  transactionHash: string; // Blockchain transaction hash
  timestamp: string; // Timestamp of the deposit
}
```

## Notification Example

When a user receives a deposit, they will see a message like this:

```
💰 New Deposit Received

Amount: 100.25 USDT
Network: ethereum
Address: 0x1234...5678
Transaction: 0xabcd...efgh
Time: 3/15/2023, 2:30:45 PM
```

## System Initialization

The notification system is initialized when the Express application starts up:

```typescript
// In app.ts
// Initialize notification service for all authenticated users
(async () => {
  try {
    const notificationService = NotificationService.getInstance();
    await notificationService.subscribeAllUsers();
    logger.info("Notifications system initialized");
  } catch (error) {
    logger.error("Failed to initialize notification system:", error);
  }
})();
```

## Integrating with Authentication Flow

The notification system is also integrated into the user authentication flow:

```typescript
// In AuthService.verifyOtp method
// After successful authentication
await this.notificationService.initializePusher(
  chatId,
  authResult.user.organizationId,
  authResult.accessToken
);
```

## Security Considerations

1. **Private Channels**: Notifications use private channels, requiring server-side authentication
2. **Token-based Authentication**: Each connection is authenticated with the user's access token
3. **Channel Naming**: Channels follow the format `private-org-{organizationId}` for consistency and security
4. **Error Handling**: Comprehensive error handling for reliable operation
5. **Logging**: Detailed logging for troubleshooting and auditing

## Testing Deposit Notifications

Deposit notifications can be tested using the CopperX API's test mode:

1. Set up the bot with test API credentials
2. Use the CopperX dashboard to simulate a deposit
3. Verify that the notification is received in Telegram

## Troubleshooting Deposit Notifications

If deposit notifications aren't working as expected, check the following:

1. **Authentication Issues**: Ensure the user is properly authenticated with a valid access token
2. **Pusher Connection**: Verify that the Pusher connection is established successfully
3. **Channel Subscription**: Check logs for successful channel subscription messages
4. **API Errors**: Look for authentication or API errors in the logs
5. **Network Connectivity**: Ensure the bot can connect to both the Pusher and CopperX APIs
6. **Token Expiration**: Check if the user's access token has expired

Common issues include:

- **Missing Notifications**: Usually due to channel subscription failures or expired tokens
- **Authentication Errors**: Often caused by invalid or expired access tokens
- **Connection Failures**: May be due to network issues or incorrect Pusher credentials

## Performance Considerations

The notification system is designed to be efficient and scalable:

1. **Singleton Pattern**: Single notification service instance manages all connections
2. **Connection Reuse**: The Pusher client is reused across all users
3. **Selective Subscriptions**: Only subscribes users with valid authentication
4. **Automatic Reconnection**: Pusher client handles reconnection automatically
5. **Memory Management**: Properly tracks and cleans up channel subscriptions

## Related Files

- `src/services/notification.service.ts` - Main notification service implementation
- `src/utils/telegram/telegram.service.ts` - Service for sending Telegram messages
- `src/services/auth.service.ts` - Integrates authentication with notifications
- `src/app.ts` - Initializes the notification system on startup
- `src/utils/session/session.service.ts` - Provides session data for notification subscriptions
