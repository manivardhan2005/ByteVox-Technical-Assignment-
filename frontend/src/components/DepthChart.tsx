import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { OrderBook as OrderBookType } from '../hooks/useSocket';

interface DepthChartProps {
  orderBook: OrderBookType;
}

const DepthChart: React.FC<DepthChartProps> = ({ orderBook }) => {
  const data = useMemo(() => {
    // Generate cumulative depth data
    let cumulativeBuy = 0;
    const buyData = [...orderBook.buyOrders]
      .reverse() // from lowest price to highest
      .map(o => {
        cumulativeBuy += o.quantity;
        return { price: o.price, bid: cumulativeBuy, ask: 0 };
      });

    let cumulativeSell = 0;
    const sellData = [...orderBook.sellOrders].map(o => {
        cumulativeSell += o.quantity;
        return { price: o.price, ask: cumulativeSell, bid: 0 };
      });

    // Combine and sort
    const combined = [...buyData, ...sellData].sort((a, b) => a.price - b.price);
    return combined;
  }, [orderBook]);

  return (
    <div className="glass-panel" style={{ marginTop: '1.5rem', height: '300px' }}>
      <h2>Depth Chart</h2>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--buy-color)" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="var(--buy-color)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorAsk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--sell-color)" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="var(--sell-color)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="price" stroke="var(--text-secondary)" fontSize={12} tickFormatter={(val) => val.toFixed(2)} />
          <YAxis stroke="var(--text-secondary)" fontSize={12} orientation="right" />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)', borderRadius: '8px' }}
            itemStyle={{ color: 'var(--text-primary)' }}
          />
          <Area type="stepBefore" dataKey="bid" stroke="var(--buy-color)" fillOpacity={1} fill="url(#colorBid)" />
          <Area type="stepAfter" dataKey="ask" stroke="var(--sell-color)" fillOpacity={1} fill="url(#colorAsk)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DepthChart;
