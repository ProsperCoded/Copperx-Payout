# CopperX Payout Bot Setup Guide

This guide provides step-by-step instructions for setting up the CopperX Payout Bot on your server.

## Prerequisites

Before you begin, ensure you have the following:

- Node.js (v16 or higher)
- npm or pnpm package manager
- A registered Telegram Bot (via BotFather) and its token
- A CopperX API key
- Redis server (or a Redis cloud service like Upstash)
- A public-facing server for the webhook (or ngrok for local development)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/copperx-payout-bot.git
cd copperx-payout-bot
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Using pnpm
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Bot Configuration
BOT_TOKEN=your_telegram_bot_token
BOT_USER=https://t.me/your_bot_username

# CopperX API
COPPERX_API_KEY=your_copperx_api_key
COPPERX_API_URL=https://income-api.copperx.io

# Redis Database
REDIS_DATABASE_URL=your_redis_connection_string

# Server Settings
SERVER_URL=https://your-server-url.com
PORT=3000
NODE_ENV=development

# Pusher Settings (for real-time notifications)
PUSHER_KEY=your_pusher_key
PUSHER_CLUSTER=your_pusher_cluster
```

### 4. Set Up Redis Database

If you're using Upstash Redis:

1. Create an account at [Upstash](https://upstash.com/)
2. Create a new Redis database
3. Copy the connection string to your `.env` file

For local Redis:

1. Install Redis on your machine
2. Set `REDIS_DATABASE_URL=redis://localhost:6379`

### 5. Build the Project

```bash
npm run build
```

This command will:

- Clean the dist directory
- Compile TypeScript code
- Set up the Telegram webhook
- Configure bot commands in Telegram
- Create necessary log directories

### 6. Start the Server

For development with hot-reloading:

```bash
npm run dev
```

For production:

```bash
npm run start
```

## Webhook Configuration

### Using ngrok for Local Development

1. Install ngrok: `npm install -g ngrok`
2. Start your bot server: `npm run dev`
3. In another terminal, run: `ngrok http 3000`
4. Copy the HTTPS URL provided by ngrok
5. Update the `SERVER_URL` in your `.env` file
6. Restart the server to update the webhook

### For Production Servers

1. Ensure your server has a public HTTPS endpoint
2. Set the `SERVER_URL` in your `.env` file to this endpoint
3. Run `npm run setup` to configure the webhook

## Verifying the Setup

1. Open Telegram and search for your bot username
2. Send `/start` to the bot
3. You should receive a welcome message with login options

## Troubleshooting Setup Issues

- **Webhook Not Working**: Verify your `SERVER_URL` is publicly accessible and using HTTPS
- **Redis Connection Errors**: Check your Redis connection string and ensure the Redis server is running
- **Bot Not Responding**: Verify your BOT_TOKEN is correct and the bot is enabled
- **Build Errors**: Ensure you have the correct Node.js version and all dependencies are installed

For more detailed troubleshooting, see the [Troubleshooting Guide](./troubleshooting.md).
