import React from 'react';
import type { Trade } from '../hooks/useSocket';

interface TradeHistoryProps {
  trades: Trade[];
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ trades }) => {
  return (
    <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2>Trade History</h2>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem', borderBottom: '1px solid var(--panel-border)' }}>
        <span>Price</span>
        <span>Qty</span>
        <span>Time</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <ul className="data-list">
          {trades.length === 0 ? (
            <li style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>No trades yet</li>
          ) : (
            trades.map((trade) => {
              const date = new Date(trade.timestamp);
              const timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
              
              return (
                <li key={trade.id} className="data-row" style={{ animation: 'flash 1s ease-out' }}>
                  <span className="price" style={{ color: 'var(--text-primary)' }}>{trade.price.toFixed(2)}</span>
                  <span className="quantity">{trade.quantity.toFixed(3)}</span>
                  <span className="time">{timeString}</span>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
};

export default TradeHistory;
