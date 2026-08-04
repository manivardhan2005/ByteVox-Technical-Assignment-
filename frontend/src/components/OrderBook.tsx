import React, { useMemo } from 'react';
import type { OrderBook as OrderBookType } from '../hooks/useSocket';

interface OrderBookProps {
  orderBook: OrderBookType;
}

const OrderBook: React.FC<OrderBookProps> = ({ orderBook }) => {
  // Max quantity for depth bar visualization
  const maxVolume = useMemo(() => {
    let max = 0;
    orderBook.buyOrders.forEach(o => max = Math.max(max, o.quantity));
    orderBook.sellOrders.forEach(o => max = Math.max(max, o.quantity));
    return max || 1;
  }, [orderBook]);

  return (
    <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2>Order Book</h2>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem', borderBottom: '1px solid var(--panel-border)' }}>
        <span>Price</span>
        <span>Quantity</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        {/* Sell Orders (Lowest price first, but we want highest sell at top? 
            Wait, order book usually shows highest sell at top, lowest sell near the middle. 
            So we should reverse the sell orders to display highest to lowest. 
            Let's keep it simple: display sell orders, but reverse them if they are ascending. 
            Backend sends sell orders ascending (lowest price first). We reverse to show highest at top. */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: '200px' }}>
          <ul className="data-list" style={{ display: 'flex', flexDirection: 'column-reverse' }}>
            {orderBook.sellOrders.slice(0, 15).map((order) => (
              <li key={`sell-${order.price}`} className="data-row sell">
                <span className="price">{order.price.toFixed(2)}</span>
                <span className="quantity">{order.quantity.toFixed(3)}</span>
                <div 
                  className="depth-bar sell" 
                  style={{ width: `${(order.quantity / maxVolume) * 100}%` }}
                />
              </li>
            ))}
          </ul>
        </div>
        
        {/* Spread indicator */}
        <div style={{ padding: '0.75rem 0', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600, borderTop: '1px solid rgba(48, 54, 61, 0.3)', borderBottom: '1px solid rgba(48, 54, 61, 0.3)', margin: '0.5rem 0' }}>
          Spread: {
            orderBook.sellOrders.length > 0 && orderBook.buyOrders.length > 0
              ? (orderBook.sellOrders[0].price - orderBook.buyOrders[0].price).toFixed(2)
              : '--'
          }
        </div>
        
        {/* Buy Orders (Highest price first) */}
        <div style={{ flex: 1, minHeight: '200px' }}>
          <ul className="data-list">
            {orderBook.buyOrders.slice(0, 15).map((order) => (
              <li key={`buy-${order.price}`} className="data-row buy">
                <span className="price">{order.price.toFixed(2)}</span>
                <span className="quantity">{order.quantity.toFixed(3)}</span>
                <div 
                  className="depth-bar buy" 
                  style={{ width: `${(order.quantity / maxVolume) * 100}%` }}
                />
              </li>
            ))}
          </ul>
        </div>
        
      </div>
    </div>
  );
};

export default OrderBook;
