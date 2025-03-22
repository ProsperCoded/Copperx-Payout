export interface Transfer {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  status: string;
  customerId: string;
  customer: {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    businessName: string;
    email: string;
    country: string;
  };
  type: string;
  sourceCountry: string;
  destinationCountry: string;
  destinationCurrency: string;
  amount: string;
  currency: string;
  amountSubtotal: string;
  totalFee: string;
  feePercentage: string;
  feeCurrency: string;
  invoiceNumber: string;
  invoiceUrl: string;
  sourceOfFundsFile: string;
  note: string;
  purposeCode: string;
  sourceOfFunds: string;
  recipientRelationship: string;
  sourceAccountId: string;
  destinationAccountId: string;
  paymentUrl: string;
  mode: string;
  isThirdPartyPayment: boolean;
  transactions: {
    id: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    type: string;
    providerCode: string;
    kycId: string;
    transferId: string;
    status: string;
    externalStatus: string;
    fromAccountId: string;
    toAccountId: string;
    fromAmount: string;
    fromCurrency: string;
    toAmount: string;
    toCurrency: string;
    totalFee: string;
    feeCurrency: string;
    transactionHash: string;
    depositAccount: {
      id: string;
      createdAt: string;
      updatedAt: string;
      type: string;
      country: string;
      network: string;
      accountId: string;
      walletAddress: string;
      bankName: string;
      bankAddress: string;
      bankRoutingNumber: string;
      bankAccountNumber: string;
      bankDepositMessage: string;
      wireMessage: string;
      payeeEmail: string;
      payeeOrganizationId: string;
      payeeId: string;
      payeeDisplayName: string;
    };
    externalTransactionId: string;
    externalCustomerId: string;
    depositUrl: string;
  }[];
  destinationAccount: {
    id: string;
    createdAt: string;
    updatedAt: string;
    type: string;
    country: string;
    network: string;
    accountId: string;
    walletAddress: string;
    bankName: string;
    bankAddress: string;
    bankRoutingNumber: string;
    bankAccountNumber: string;
    bankDepositMessage: string;
    wireMessage: string;
    payeeEmail: string;
    payeeOrganizationId: string;
    payeeId: string;
    payeeDisplayName: string;
  };
  sourceAccount: {
    id: string;
    createdAt: string;
    updatedAt: string;
    type: string;
    country: string;
    network: string;
    accountId: string;
    walletAddress: string;
    bankName: string;
    bankAddress: string;
    bankRoutingNumber: string;
    bankAccountNumber: string;
    bankDepositMessage: string;
    wireMessage: string;
    payeeEmail: string;
    payeeOrganizationId: string;
    payeeId: string;
    payeeDisplayName: string;
  };
  senderDisplayName: string;
}

export interface TransferListResponse {
  page: number;
  limit: number;
  count: number;
  hasMore: boolean;
  data: Transfer[];
}

export interface TransferRequest {
  walletAddress?: string;
  email?: string;
  payeeId?: string;
  amount: string;
  purposeCode: string;
  currency: string;
}

export interface BulkTransferRequest {
  requests: { requestId: string; request: TransferRequest }[];
}

export interface CreateOfframpTransferRequest {
  invoiceNumber: string;
  invoiceUrl: string;
  purposeCode: string;
  sourceOfFunds: string;
  recipientRelationship: string;
  quotePayload: string;
  quoteSignature: string;
  preferredWalletId: string;
  customerData: {
    name: string;
    businessName: string;
    email: string;
    country: string;
  };
  sourceOfFundsFile: string;
  note: string;
}
