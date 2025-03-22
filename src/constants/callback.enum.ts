export enum CallbackEnum {
  LOGIN = "login",
  HELP = "help",
  WALLET_DETAILS = "wallet_details",
  WALLET_SET_DEFAULT = "wallet_set_default",
  WALLET_DEPOSIT = "wallet_deposit",
  WALLET_BACK = "wallet_back",
  WALLET_ALL_BALANCES = "wallet_all_balances",
  WALLET_CREATE = "wallet_create",
  CHECK_VERIFICATION = "check_verification",

  // Transfer-related callbacks
  TRANSFER_LIST = "transfer_list",
  TRANSFER_SEND = "transfer_send",
  TRANSFER_WITHDRAW = "transfer_withdraw",
  TRANSFER_BATCH = "transfer_batch",
  TRANSFER_OFFRAMP = "transfer_offramp",
  TRANSFER_DETAILS = "transfer_details",
  TRANSFER_NEXT_PAGE = "transfer_next_page",
  TRANSFER_PREV_PAGE = "transfer_prev_page",
  TRANSFER_BACK = "transfer_back",

  // Send flow callbacks
  SEND_BY_EMAIL = "send_by_email",
  SEND_BY_WALLET = "send_by_wallet",
  SEND_CANCEL = "send_cancel",
  SEND_CONFIRM = "send_confirm",
}
