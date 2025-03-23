# Development Guide

This guide provides information for developers who want to extend or modify the CopperX Payout Bot.

## Development Environment Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or pnpm
- Redis (local or cloud)
- Telegram Bot Token (from BotFather)
- CopperX API credentials
- Text editor or IDE (VSCode recommended)

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/ProsperCoded/Copperx-Payout.git
   cd Copperx-Payout
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or with pnpm
   pnpm install
   ```

3. **Configure environment variables**

   - Copy `.env.example` to `.env` (if available)
   - Otherwise create a new `.env` file with the required variables:

   ```env
   BOT_TOKEN=your_telegram_bot_token
   BOT_USER=https://t.me/your_bot_username
   COPPERX_API_KEY=your_copperx_api_key
   REDIS_DATABASE_URL=your_redis_connection_string
   SERVER_URL=https://your-webhook-url.com
   PORT=3000
   NODE_ENV=development
   PUSHER_KEY=your_pusher_key
   PUSHER_CLUSTER=your_pusher_cluster
   COPPERX_API_URL=https://income-api.copperx.io
   ```

4. **Set up ngrok for local development**

   Since Telegram requires a public HTTPS endpoint for webhooks, you'll need ngrok or a similar tool for local development:

   ```bash
   # Install ngrok globally if not already installed
   npm install -g ngrok

   # Start your local server
   npm run dev

   # In a separate terminal, start ngrok
   ngrok http 3000
   ```

   Then update your `.env` file with the ngrok HTTPS URL:

   ```
   SERVER_URL=https://your-ngrok-url.ngrok.io
   ```

5. **Set up the webhook and commands**
   ```bash
   npm run setup
   ```

## Project Structure

The project follows a modular structure for maintainability and separation of concerns:

```
src/
├── app.ts                 # Express application setup
├── server.ts              # Server startup
├── bot/                   # Telegram bot-specific code
│   ├── webhook.ts         # Webhook handler
│   ├── handlers/          # Command handlers
│   ├── messages/          # Message templates
│   ├── operations/        # Command and callback operations
│   └── utils/             # Bot-specific utilities
├── constants/             # Application constants
├── services/              # Business logic services
├── types/                 # TypeScript type definitions
└── utils/                 # Shared utilities
    ├── config/            # Configuration management
    ├── copperxApi/        # CopperX API clients
    ├── database/          # Database utilities
    ├── exceptions/        # Custom exceptions
    ├── logger/            # Logging utilities
    ├── middleware/        # Express middleware
    ├── rate-limit/        # Rate limiting utilities
    ├── session/           # Session management
    └── telegram/          # Telegram API utilities
```

## Key Components

### 1. Webhook Handler

The webhook handler (`src/bot/webhook.ts`) is the entry point for all Telegram updates. It:

- Receives and validates webhook requests
- Extracts chat ID and applies rate limiting
- Routes updates to appropriate handlers based on type
- Manages error handling and response codes

### 2. Command System

Commands are processed through:

1. **Command Operations** (`src/bot/operations/command.operations.ts`): Maps command strings to handler functions
2. **Command Handlers** (`src/bot/handlers/`): Implement the logic for each command
3. **Command Enum** (`src/constants/bot-commands.ts`): Defines available commands

To add a new command:

1. Add your command to `CommandsEnum`
2. Create a handler function in the appropriate file under `src/bot/handlers/`
3. Add the command to `commandOperations` in `src/bot/operations/command.operations.ts`
4. Add your command to `BotCommands` to make it visible in the Telegram command menu
5. Run `npm run setup` to update the bot commands in Telegram

Example command handler:

```typescript
export async function handleMyCommand(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  // Check authentication if needed
  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  // Command-specific logic here

  // Send response
  await TelegramService.sendMessage(chatId, "My command response", {
    inlineKeyboard: [
      [{ text: "Option 1", callback_data: "my_callback_1" }],
      [{ text: "Option 2", callback_data: "my_callback_2" }],
    ],
  });
}
```

### 3. Callback System

Callbacks are processed through:

1. **Callback Operations** (`src/bot/operations/callback.operations.ts`): Maps callback data to handler functions
2. **Callback Handlers**: Often included in the same file as related command handlers
3. **Callback Enum** (`src/constants/callback.enum.ts`): Defines available callbacks

To add a new callback:

1. Add your callback to `CallbackEnum`
2. Create a handler function for the callback
3. Add the callback to `callbackOperations` or handle it in `handleCallback`

Example callback handler:

```typescript
export async function handleMyCallback(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  // Callback-specific logic

  // Send response or update message
  await TelegramService.sendMessage(chatId, "Callback response");
}
```

For parameterized callbacks, add a case in the `handleCallback` function:

```typescript
if (baseCallback === "my_parameterized_callback") {
  return handleMyParameterizedCallback(message, params[0]);
}
```

### 4. Services

Services encapsulate business logic and API interactions:

- **AuthService**: Handles user authentication
- **WalletService**: Manages wallet operations
- **TransferService**: Handles transfer operations
- **NotificationService**: Manages real-time notifications

Services typically follow the singleton pattern:

```typescript
export class MyService {
  private static instance: MyService;

  private constructor() {
    // Initialize service
  }

  public static getInstance(): MyService {
    if (!MyService.instance) {
      MyService.instance = new MyService();
    }
    return MyService.instance;
  }

  // Service methods
  public async myMethod(): Promise<ResultType> {
    // Implementation
  }
}
```

### 5. Session Management

Sessions are managed by `SessionService` using Redis:

```typescript
// Get session
const session = await sessionService.getSession(chatId);

// Update session
await sessionService.updateSession(chatId, {
  state: UserState.NEW_STATE,
  someData: "value",
});
```

User state is tracked using the `UserState` enum in `src/types/session.types.ts`.

## Testing

### Unit Testing

Unit tests can be written using Jest or Mocha. Example test setup:

```typescript
describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = AuthService.getInstance();
  });

  it("should authenticate with valid credentials", async () => {
    // Test implementation
  });
});
```

### Manual Testing

For manual testing:

1. Start the bot in development mode: `npm run dev`
2. Expose your localhost with ngrok
3. Set up the webhook: `npm run setup`
4. Test commands in Telegram

## Deployment

### Railway Deployment

The bot is configured for deployment on Railway:

1. Connect your GitHub repository to Railway
2. Configure environment variables in Railway
3. Railway will use the settings in `railway.json` for deployment

Custom deployment configurations can be set in `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Best Practices

### Code Style

- Follow TypeScript best practices for type safety
- Use async/await for asynchronous operations
- Structure code in a modular, single-responsibility pattern
- Add JSDoc comments for complex functions
- Use constants for magic values

### Error Handling

Always handle errors properly:

```typescript
try {
  // Operation that might fail
} catch (error) {
  logger.error("Operation failed", { error: error.message, context });

  // Provide user-friendly error message
  await TelegramService.sendMessage(chatId, "Sorry, something went wrong.");

  // Optionally propagate or transform errors
  throw new CustomError("Operation failed", error);
}
```

### Logging

Use the `LoggerService` for consistent logging:

```typescript
const logger = new LoggerService(LoggerPaths.MY_COMPONENT);

// Log levels
logger.info("Information message", { context });
logger.warn("Warning message", { context });
logger.error("Error message", { error, context });
logger.debug("Debug information", { context });
```

### Security Considerations

- Validate all user input
- Use rate limiting to prevent abuse
- Store sensitive information in environment variables
- Keep dependencies updated
- Follow the principle of least privilege

## Contributing

When contributing to the project:

1. Create a feature branch from `main`
2. Make your changes following the project's code style
3. Update documentation as necessary
4. Add or update tests when possible
5. Submit a pull request with a clear description of changes
6. Request review from the project maintainers

## Additional Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [CopperX API Documentation](https://copperx.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Redis Documentation](https://redis.io/documentation)
