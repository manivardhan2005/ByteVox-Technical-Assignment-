export type Side = 'BUY' | 'SELL';
export type OrderType = 'LIMIT' | 'MARKET';

export interface Order {
  id: string;
  side: Side;
  type: OrderType;
  price: number;
  quantity: number;
  timestamp: number;
}

export interface Trade {
  id: string;
  makerOrderId: string;
  takerOrderId: string;
  price: number;
  quantity: number;
  timestamp: number;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
}
