# CopperX Payout Bot Architecture

This document outlines the architecture of the CopperX Payout Bot, explaining how the different components work together to create a seamless user experience.

## System Overview

The CopperX Payout Bot is built on a webhook-based architecture that integrates with Telegram's Bot API and the CopperX financial platform. The system is designed to be modular, scalable, and fault-tolerant.

![System Architecture](./images/architecture-diagram.png)

## Core Components

### 1. Webhook Handler

The entry point for all interactions is the webhook handler in `src/bot/webhook.ts`. This component:

- Receives updates from Telegram
- Routes them to appropriate handlers
- Applies rate limiting
- Handles errors gracefully
- Returns appropriate responses

```typescript
export const handler: RequestHandler = async (req, res) => {
  try {
    // Extract chatId for rate limiting
    let chatId: number | undefined;
    if (req.body?.callback_query) {
      chatId = req.body.callback_query.message.chat.id;
    } else if (req.body?.message) {
      chatId = req.body.message.chat.id;
    }

    // Apply rate limiting if chatId exists
    if (chatId) {
      const rateLimit = await rateLimitService.checkRateLimit(chatId);
      if (rateLimit.isLimited) {
        // Handle rate limit...
      }
    }

    // Route based on update type
    if (req.body?.callback_query) {
      // Handle callback queries...
    } else if (req.body?.message) {
      // Handle messages...
    }

    res.status(200).send();
  } catch (error) {
    logger.error("Error in webhook handler", { error: error.message });
    res.status(200).send(); // Always return 200 to prevent Telegram retries
  }
};
```

### 2. Command Operations

Commands are structured in the `src/bot/operations/command.operations.ts` file. This maps Telegram commands to their handler functions:

```typescript
export const commandOperations: {
  [key in CommandsEnum]: (msgObj: TelegramMessage) => Promise<void> | void;
} = {
  [CommandsEnum.START]: startHandler,
  [CommandsEnum.LOGIN]: loginHandler,
  [CommandsEnum.WALLET]: handleWalletCommand,
  [CommandsEnum.TRANSFER]: handleTransferCommand,
  [CommandsEnum.SEND]: handleSendCommand,
  [CommandsEnum.LOGOUT]: handleLogout,
  [CommandsEnum.HELP]: handleHelpCommand,
};
```

### 3. Callback Operations

Callbacks from inline keyboards are handled by `src/bot/operations/callback.operations.ts`. This includes a dynamic system for handling callbacks with parameters:

```typescript
export const handleCallback = async (
  callbackData: string,
  message: TelegramMessage
) => {
  // Extract base callback and parameters
  const [baseCallback, ...params] = callbackData.split(":");

  // Handle various callback types
  if (baseCallback === CallbackEnum.WALLET_DETAILS) {
    return handleWalletDetailsCallback(message, params[0]);
  }

  // Handle standard callbacks
  if (baseCallback in callbackOperations) {
    return callbackOperations[baseCallback](message);
  }
};
```

### 4. Services Layer

The services layer abstracts API interactions:

- **AuthService**: Handles authentication with CopperX
- **WalletService**: Manages wallet operations
- **TransferService**: Handles fund transfers
- **NotificationService**: Manages real-time notifications

### 5. Session Management

User sessions are managed by the `SessionService`, which uses Redis for persistence. Each user has a session object that tracks:

- Authentication state
- KYC verification status
- Current command flow state
- Temporary data for multi-step operations

### 6. Rate Limiting

The `RateLimitService` provides protection against abuse by limiting the number of requests per user within a time window. This is implemented using Redis-based counters.

## Data Flow

1. **User Input**: User sends a command or clicks a button in Telegram
2. **Webhook Processing**: Express server receives the update and passes it to the handler
3. **Command/Callback Routing**: Update is routed to the appropriate handler
4. **Business Logic**: Handler executes business logic, often calling services
5. **API Interaction**: Services interact with the CopperX API as needed
6. **Response Generation**: Handler prepares and sends a response to the user
7. **Session Update**: User session is updated to reflect new state

## State Management

The bot implements a state machine pattern using the `UserState` enum to track where users are in multi-step flows:

```typescript
export enum UserState {
  IDLE = "IDLE",
  AWAITING_LOGIN_EMAIL = "AWAITING_LOGIN_EMAIL",
  AWAITING_OTP = "AWAITING_OTP",
  AUTHENTICATED = "AUTHENTICATED",
  AWAITING_RECIPIENT_EMAIL = "AWAITING_RECIPIENT_EMAIL",
  AWAITING_WALLET_ADDRESS = "AWAITING_WALLET_ADDRESS",
  AWAITING_AMOUNT = "AWAITING_AMOUNT",
  AWAITING_CURRENCY = "AWAITING_CURRENCY",
  AWAITING_PURPOSE = "AWAITING_PURPOSE",
  AWAITING_CONFIRMATION = "AWAITING_CONFIRMATION",
}
```

## Authentication Flow

1. User initiates login with `/login` command
2. Bot prompts for email address
3. CopperX API sends OTP to user's email
4. User provides OTP to bot
5. Bot verifies OTP with CopperX API
6. On success, session is updated with authentication tokens
7. KYC status is checked and stored in session

## Security Considerations

- **Rate Limiting**: Prevents abuse
- **Error Handling**: Properly catches and logs errors without exposing sensitive information
- **Session Management**: Securely stores user sessions with expiration
- **Input Validation**: Validates all user inputs before processing
- **Access Control**: Verifies authentication and KYC status before allowing sensitive operations

## External Integrations

- **Telegram Bot API**: For all user interactions
- **CopperX API**: For financial operations
- **Redis**: For session and rate limit storage
- **Pusher**: For real-time notifications
