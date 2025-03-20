import { TelegramService } from "../../utils/telegram/telegram.service";
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
  // Removed learn_kyc and complete_kyc handlers since they're now URL buttons
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
