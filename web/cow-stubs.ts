// Stubs for @cowprotocol/cow-sdk
export enum OrderStatus {
  PRESIGNATURE_PENDING = 'PRESIGNATURE_PENDING',
  PENDING = 'PENDING',
  FULFILLED = 'FULFILLED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export class OrderBookApi {
  getOrder = async () => null;
  sendOrder = async () => ({});
  getTwapOrder = async () => null;
  getTwapOrderTxs = async () => [];
  getQuote = async () => null;
  getOrderStatus = async () => null;
}

export type CowSwapOrder = any;
export type TwapOrder = any;
