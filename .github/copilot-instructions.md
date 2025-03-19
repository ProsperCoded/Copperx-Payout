# Copilot Custom Instructions for Telegram Bot Project

## **Overview**

This is a TypeScript-based Telegram bot using the native Telegram Bot API. It follows an object-oriented approach and is designed for webhook-based communication.

## **Best Practices**

- **Write Clean, Modular Code** : Keep functions small, reusable, and well-documented.
- **Use TypeScript** : Ensure strict typings for functions, variables, and objects.
- **Adopt an Object-Oriented Approach** : Use classes for structured logic.
- **Follow a Clear Folder Structure, already defined**

## **Workflow Overview**

1. User sends a message.
2. Webhook receives and parses it.
3. The appropriate controller processes it.
4. If an inline keyboard button is clicked, the bot handles the `callback_query`.
5. The bot responds via `axios.post` (`sendMessage`, `editMessageText`, etc.).
6. Errors are logged, and rate limiting ensures stability.

Following these guidelines ensures Copilot generates **clean, scalable, and maintainable code** tailored for this project.
