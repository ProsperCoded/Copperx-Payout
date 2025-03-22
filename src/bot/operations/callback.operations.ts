import { CallbackEnum } from "../../constants/callback.enum";
import { TelegramMessage } from "../../types/webhook.types";
import { loginHandler } from "../handlers/login.handler";
import {
  handleWalletDetailsCallback,
  handleSetDefaultWalletCallback,
  handleDepositCallback,
  handleAllBalancesCallback,
  handleWalletBackCallback,
  handleCreateWalletCallback,
} from "../handlers/wallet.handler";
import { handleCheckVerification } from "../handlers/check-verification.handler";
import {
  handleTransferListCallback,
  handleTransferDetailsCallback,
  handleSendTransferCallback,
  handleSendByEmailCallback,
  handleSendByWalletCallback,
  handleSendConfirmCallback,
  handleSendCancelCallback,
  handleTransferBackCallback,
  handleCurrencyCallback,
  handlePurposeCallback,
} from "../handlers/transfer.handler";

// Remove the KYC-related callback handlers since we're using URL buttons now

export const callbackOperations: Record<
  string,
  (msgObj: TelegramMessage, ...args: any[]) => Promise<void> | void
> = {
  [CallbackEnum.LOGIN]: loginHandler,
  [CallbackEnum.HELP]: (msgObj: TelegramMessage) => {},
  [CallbackEnum.WALLET_ALL_BALANCES]: handleAllBalancesCallback,
  [CallbackEnum.WALLET_BACK]: handleWalletBackCallback,
  [CallbackEnum.WALLET_CREATE]: handleCreateWalletCallback,
  [CallbackEnum.CHECK_VERIFICATION]: handleCheckVerification, // Add the check verification handler
  // Removed learn_kyc and complete_kyc handlers since they're now URL buttons

  // Transfer-related operations
  [CallbackEnum.TRANSFER_LIST]: handleTransferListCallback,
  [CallbackEnum.TRANSFER_SEND]: handleSendTransferCallback,
  [CallbackEnum.TRANSFER_BACK]: handleTransferBackCallback,
  [CallbackEnum.SEND_BY_EMAIL]: handleSendByEmailCallback,
  [CallbackEnum.SEND_BY_WALLET]: handleSendByWalletCallback,
  [CallbackEnum.SEND_CONFIRM]: handleSendConfirmCallback,
  [CallbackEnum.SEND_CANCEL]: handleSendCancelCallback,
};

// Handle dynamic callbacks with parameters
export const handleCallback = async (
  callbackData: string,
  message: TelegramMessage
) => {
  // Extract the base callback and parameters
  const [baseCallback, ...params] = callbackData.split(":");

  if (baseCallback === CallbackEnum.WALLET_DETAILS) {
    return handleWalletDetailsCallback(message, params[0]);
  }

  if (baseCallback === CallbackEnum.WALLET_SET_DEFAULT) {
    return handleSetDefaultWalletCallback(message, params[0]);
  }

  if (baseCallback === CallbackEnum.WALLET_DEPOSIT) {
    return handleDepositCallback(message, params[0]);
  }

  if (baseCallback === CallbackEnum.TRANSFER_DETAILS) {
    return handleTransferDetailsCallback(message, params[0]);
  }

  if (baseCallback === CallbackEnum.TRANSFER_NEXT_PAGE) {
    return handleTransferListCallback(message, parseInt(params[0]));
  }

  if (baseCallback === CallbackEnum.TRANSFER_PREV_PAGE) {
    return handleTransferListCallback(message, parseInt(params[0]));
  }

  if (baseCallback === "transfer_currency") {
    return handleCurrencyCallback(message, params[0]);
  }

  if (baseCallback === "transfer_purpose") {
    return handlePurposeCallback(message, params[0]);
  }

  // If it's a standard callback without parameters
  if (baseCallback in callbackOperations) {
    return callbackOperations[baseCallback](message);
  }

  // Handle network-specific wallet creation
  if (baseCallback.startsWith("create_wallet_")) {
    const network = baseCallback.replace("create_wallet_", "");
    // Implement wallet creation for specific network
    // This would be added in a future update
  }
};
