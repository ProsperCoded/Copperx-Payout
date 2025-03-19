#### Workspace Folder strucutre

📦 copperx-telegram-bot
├── 📂 src
│ ├── 📂 bot
│ │ ├── webhook.ts # Handles Telegram webhook updates
│ │ ├── middleware.ts # Authentication & rate limiting
│ │ ├── keyboards.ts # Defines inline/reply keyboard buttons
│ │ ├── handlers/ # Handles bot commands & messages
│ │ │ ├── start.handler.ts # Handles /start command
│ │ │ ├── auth.handler.ts # Handles authentication flow
│ │ │ ├── wallet.handler.ts # Handles wallet-related commands
│ │ │ ├── transfer.handler.ts # Handles fund transfers
│ │ │ ├── notifications.handler.ts # Handles deposit notifications
│ ├── 📂 config
│ │ ├── env.ts # Loads environment variables
│ │ ├── telegram.ts # Telegram API configurations
│ ├── 📂 services
│ │ ├── auth.service.ts # Handles authentication logic with Copperx API
│ │ ├── wallet.service.ts # Handles wallet interactions
│ │ ├── transfer.service.ts # Handles fund transfer logic
│ │ ├── notification.service.ts # Handles real-time updates via Pusher
│ ├── 📂 utils
│ │ ├── logger.ts # Centralized logging utility
│ │ ├── rateLimiter.ts # Rate limiting logic
│ │ ├── apiClient.ts # Handles API requests with axios
│ ├── 📂 types
│ │ ├── auth.types.ts # Type definitions for authentication
│ │ ├── wallet.types.ts # Type definitions for wallet operations
│ │ ├── transfer.types.ts # Type definitions for transactions
│ ├── server.ts # Express server to receive Telegram webhooks
│ ├── botEntry.ts # Initializes webhook & sets it on Telegram
├── 📂 tests # Contains unit and integration tests
├── .env # Environment variables (API keys, bot token)
├── package.json # Dependencies and scripts
├── tsconfig.json # TypeScript configuration
├── README.md # Documentation
