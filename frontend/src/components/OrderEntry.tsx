import React, { useState } from 'react';

interface OrderEntryProps {
  onPlaceOrder: (side: 'BUY' | 'SELL', type: 'LIMIT' | 'MARKET', price: number, quantity: number) => Promise<boolean>;
}

const OrderEntry: React.FC<OrderEntryProps> = ({ onPlaceOrder }) => {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [type, setType] = useState<'LIMIT' | 'MARKET'>('LIMIT');
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || (type === 'LIMIT' && !price)) return;
    
    setLoading(true);
    const success = await onPlaceOrder(
      side,
      type,
      parseFloat(price) || 0,
      parseFloat(quantity)
    );
    setLoading(false);
    
    if (success) {
      setQuantity('');
      if (type === 'LIMIT') {
        // optionally keep price
      }
    }
  };

  return (
    <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
      <h2>Place Order</h2>
      <div className="side-toggle">
        <button 
          className={side === 'BUY' ? 'active buy' : ''} 
          onClick={() => setSide('BUY')}
        >
          BUY
        </button>
        <button 
          className={side === 'SELL' ? 'active sell' : ''} 
          onClick={() => setSide('SELL')}
        >
          SELL
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', gap: '1rem', cursor: 'pointer' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <input 
                type="radio" 
                checked={type === 'LIMIT'} 
                onChange={() => setType('LIMIT')} 
              />
              Limit
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <input 
                type="radio" 
                checked={type === 'MARKET'} 
                onChange={() => setType('MARKET')} 
              />
              Market
            </span>
          </label>
        </div>

        <div className="form-group">
          <label>Price (BYTE)</label>
          <input 
            type="number" 
            step="0.01" 
            className="input-field" 
            value={price}
            onChange={e => setPrice(e.target.value)}
            disabled={type === 'MARKET'}
            placeholder={type === 'MARKET' ? 'Market Price' : '0.00'}
            required={type === 'LIMIT'}
          />
        </div>

        <div className="form-group">
          <label>Quantity</label>
          <input 
            type="number" 
            step="0.001" 
            className="input-field" 
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <button 
          type="submit" 
          className={`btn ${side === 'BUY' ? 'btn-buy' : 'btn-sell'}`}
          disabled={loading}
        >
          {side} BYTE
        </button>
      </form>
    </div>
  );
};

export default OrderEntry;
