import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Order {
  id: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET';
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

export interface OrderBook {
  buyOrders: OrderBookLevel[];
  sellOrders: OrderBookLevel[];
}

export interface SystemStats {
  totalBuyOrders: number;
  totalSellOrders: number;
  activeBuyOrders: number;
  activeSellOrders: number;
  totalTradesExecuted: number;
}

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [orderBook, setOrderBook] = useState<OrderBook>({ buyOrders: [], sellOrders: [] });
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalBuyOrders: 0,
    totalSellOrders: 0,
    activeBuyOrders: 0,
    activeSellOrders: 0,
    totalTradesExecuted: 0
  });

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('orderBook', (ob: OrderBook) => {
      setOrderBook(ob);
    });

    newSocket.on('trades', (history: Trade[]) => {
      setTrades(history);
    });

    newSocket.on('trade', (trade: Trade) => {
      setTrades(prev => [trade, ...prev].slice(0, 100)); // Keep newest 100
    });

    newSocket.on('stats', (st: SystemStats) => {
      setStats(st);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const placeOrder = useCallback(async (side: 'BUY' | 'SELL', type: 'LIMIT' | 'MARKET', price: number, quantity: number) => {
    try {
      const res = await fetch('http://localhost:3001/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ side, type, price, quantity })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to place order');
      }
      return true;
    } catch (e: any) {
      console.error('Order error:', e);
      return false;
    }
  }, []);

  return { socket, orderBook, trades, stats, placeOrder };
}
