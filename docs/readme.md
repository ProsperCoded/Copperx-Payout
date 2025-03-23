# CopperX Payout Bot Documentation

Welcome to the comprehensive documentation for the CopperX Payout Bot. This Telegram bot enables seamless cryptocurrency transactions, wallet management, and user authentication through the CopperX API.

## 📚 Documentation Structure

This documentation is organized into several sections:

1. **[Setup Guide](./setup.md)** - Instructions for installing and configuring the bot
2. **[Architecture Overview](./architecture.md)** - System design and components
3. **[Command Reference](./commands/index.md)** - Detailed guide for all bot commands
4. **[Callbacks Reference](./callbacks/index.md)** - Documentation for all callback operations
5. **[API Integration](./api-integration.md)** - Details about CopperX API integration
6. **[Troubleshooting](./troubleshooting.md)** - Common issues and their solutions
7. **[Development Guide](./development.md)** - Guide for developers extending the bot

## 🚀 Key Features

- **Secure Authentication**: OAuth-based authentication with the CopperX platform
- **Wallet Management**: View balances, create wallets, and set default wallets
- **Fund Transfers**: Send funds to users via email or wallet address
- **Transaction History**: View and filter transaction history
- **Real-time Notifications**: Get alerts for deposits and other events
- **Rate Limiting**: Protection against abuse with configurable rate limits

## 🔧 Technology Stack

- **TypeScript**: Strong typing for improved code quality and maintainability
- **Express.js**: Fast, unopinionated web framework for handling webhook requests
- **Redis**: For session management and rate limiting
- **Pusher.js**: Real-time notifications for wallet activities
- **Axios**: HTTP client for communicating with Telegram and CopperX APIs
- **Pino**: Fast, low overhead logging library
- **IoRedis**: Redis client for Node.js
- **Helmet**: Security middleware for Express
- **TSX**: Enhanced TypeScript execution and development experience

## 📂 Quick Links

- [Start Command Reference](./commands/start.md)
- [Login Process](./commands/login.md)
- [Wallet Commands](./commands/wallet.md)
- [Transfer Commands](./commands/transfer.md)
- [Help System](./commands/help.md)

## 🔗 External Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [CopperX API Documentation](https://copperx.io/docs)
- [Redis Documentation](https://redis.io/documentation)
- [Express.js Documentation](https://expressjs.com/)
