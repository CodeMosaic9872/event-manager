export type CardcomCreateLowProfileParams = {
  terminalNumber: number;
  username: string;
  billGoldUserId: number;
  operation: 'BillAndCreateToken' | 'BillOnly';
  returnValue: string;
  sumToBill: string;
  language: string;
  successRedirectUrl: string;
  errorRedirectUrl: string;
  indicatorUrl: string;
  cancelUrl: string;
  isCreateInvoice: boolean;
  productName?: string;
  invoiceEmail?: string;
  invoiceCustName?: string;
  token?: string;
};

export type CardcomCreateLowProfileResult = {
  responseCode: number;
  description: string | null;
  lowProfileCode: string | null;
  lowProfileVersion: number | null;
  baseUrl: string | null;
  urlPath: string | null;
};

export type CardcomIndicatorParsed = {
  returnValue: string | null;
  lowProfileCode: string | null;
  internalDealNumber: string | null;
  token: string | null;
  tokenExDate: string | null;
  prossesEndOK: number | null;
  dealRespone: number | null;
  isRevoked: boolean | null;
};

export type CardcomGetLowProfileIndicatorResult = {
  responseCode: number;
  description: string | null;
  indicator: CardcomIndicatorParsed | null;
};
