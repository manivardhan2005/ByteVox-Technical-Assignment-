import { Order, Trade, OrderBookLevel } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export class MatchingEngine {
  private buyOrders: Order[] = [];
  private sellOrders: Order[] = [];
  private trades: Trade[] = [];
  private stats = {
    totalBuyOrdersSubmitted: 0,
    totalSellOrdersSubmitted: 0,
    totalTradesExecuted: 0
  };

  private onTradeExecuted: (trade: Trade) => void;
  private onOrderBookUpdated: () => void;
  private onStatsUpdated: () => void;

  constructor(
    onTradeExecuted: (trade: Trade) => void,
    onOrderBookUpdated: () => void,
    onStatsUpdated: () => void
  ) {
    this.onTradeExecuted = onTradeExecuted;
    this.onOrderBookUpdated = onOrderBookUpdated;
    this.onStatsUpdated = onStatsUpdated;
  }
  
  public addOrder(order: Order) {
    if (order.side === 'BUY') {
      this.stats.totalBuyOrdersSubmitted++;
      this.matchBuyOrder(order);
    } else {
      this.stats.totalSellOrdersSubmitted++;
      this.matchSellOrder(order);
    }
    this.onStatsUpdated();
    this.onOrderBookUpdated();
  }
  
  public cancelOrder(id: string) {
      let cancelled = false;
      const initialBuyLength = this.buyOrders.length;
      this.buyOrders = this.buyOrders.filter(o => o.id !== id);
      if (this.buyOrders.length !== initialBuyLength) cancelled = true;
      
      const initialSellLength = this.sellOrders.length;
      this.sellOrders = this.sellOrders.filter(o => o.id !== id);
      if (this.sellOrders.length !== initialSellLength) cancelled = true;

      if (cancelled) {
          this.onOrderBookUpdated();
          this.onStatsUpdated();
      }
      return cancelled;
  }
  
  private matchBuyOrder(order: Order) {
    while (order.quantity > 0 && this.sellOrders.length > 0) {
      const bestSell = this.sellOrders[0];
      
      if (order.type === 'LIMIT' && order.price < bestSell.price) {
        break; // No match
      }
      
      const tradePrice = bestSell.price;
      const tradeQuantity = Math.min(order.quantity, bestSell.quantity);
      
      this.executeTrade(bestSell.id, order.id, tradePrice, tradeQuantity);
      
      order.quantity -= tradeQuantity;
      bestSell.quantity -= tradeQuantity;
      
      if (bestSell.quantity === 0) {
        this.sellOrders.shift();
      }
    }
    
    if (order.quantity > 0 && order.type === 'LIMIT') {
      this.insertBuyOrder(order);
    }
  }

  private matchSellOrder(order: Order) {
    while (order.quantity > 0 && this.buyOrders.length > 0) {
      const bestBuy = this.buyOrders[0];
      
      if (order.type === 'LIMIT' && order.price > bestBuy.price) {
        break; // No match
      }
      
      const tradePrice = bestBuy.price;
      const tradeQuantity = Math.min(order.quantity, bestBuy.quantity);
      
      this.executeTrade(bestBuy.id, order.id, tradePrice, tradeQuantity);
      
      order.quantity -= tradeQuantity;
      bestBuy.quantity -= tradeQuantity;
      
      if (bestBuy.quantity === 0) {
        this.buyOrders.shift();
      }
    }
    
    if (order.quantity > 0 && order.type === 'LIMIT') {
      this.insertSellOrder(order);
    }
  }

  private executeTrade(makerOrderId: string, takerOrderId: string, price: number, quantity: number) {
    const trade: Trade = {
      id: uuidv4(),
      makerOrderId,
      takerOrderId,
      price,
      quantity,
      timestamp: Date.now()
    };
    this.trades.push(trade);
    this.stats.totalTradesExecuted++;
    this.onTradeExecuted(trade);
  }

  private insertBuyOrder(order: Order) {
    this.buyOrders.push(order);
    this.buyOrders.sort((a, b) => {
      if (b.price !== a.price) return b.price - a.price; // Highest price first
      return a.timestamp - b.timestamp; // Oldest first
    });
  }

  private insertSellOrder(order: Order) {
    this.sellOrders.push(order);
    this.sellOrders.sort((a, b) => {
      if (a.price !== b.price) return a.price - b.price; // Lowest price first
      return a.timestamp - b.timestamp; // Oldest first
    });
  }

  public getOrderBook() {
    return {
      buyOrders: this.aggregateOrders(this.buyOrders, 'desc'),
      sellOrders: this.aggregateOrders(this.sellOrders, 'asc')
    };
  }

  private aggregateOrders(orders: Order[], sortDir: 'asc' | 'desc'): OrderBookLevel[] {
    const levels: Record<number, number> = {};
    for (const order of orders) {
      if (!levels[order.price]) {
        levels[order.price] = 0;
      }
      levels[order.price] += order.quantity;
    }
    const result = Object.entries(levels)
      .map(([price, quantity]) => ({ price: parseFloat(price), quantity }));
      
    result.sort((a, b) => sortDir === 'asc' ? a.price - b.price : b.price - a.price);
    return result;
  }

  public getTrades() {
    // Return last 100 trades, newest first
    return this.trades.slice(-100).reverse();
  }
  
  public getStats() {
      return {
          totalBuyOrders: this.stats.totalBuyOrdersSubmitted,
          totalSellOrders: this.stats.totalSellOrdersSubmitted,
          activeBuyOrders: this.buyOrders.length,
          activeSellOrders: this.sellOrders.length,
          totalTradesExecuted: this.stats.totalTradesExecuted
      };
  }
}
