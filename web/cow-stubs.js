// Stubs for @cowprotocol/cow-sdk
export const OrderStatus = {
  PRESIGNATURE_PENDING: 'PRESIGNATURE_PENDING',
  PENDING: 'PENDING',
  FULFILLED: 'FULFILLED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
};

export class OrderBookApi {
  async getOrder() {
    return null;
  }
  async sendOrder() {
    return {};
  }
  async getTwapOrder() {
    return null;
  }
  async getTwapOrderTxs() {
    return [];
  }
  async getQuote() {
    return null;
  }
  async getOrderStatus() {
    return null;
  }
}

export const CowSwapOrder = {};
export const TwapOrder = {};
