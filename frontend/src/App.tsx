import OrderEntry from './components/OrderEntry';
import OrderBook from './components/OrderBook';
import TradeHistory from './components/TradeHistory';
import SystemStats from './components/SystemStats';
import DepthChart from './components/DepthChart';
import { useSocket } from './hooks/useSocket';
import './index.css';

function App() {
  const { orderBook, trades, stats, placeOrder } = useSocket();

  return (
    <div>
      <header>
        <h1><span>Byte</span>Vox</h1>
      </header>

      <div className="layout-grid">
        <div className="left-panel">
          <OrderEntry onPlaceOrder={placeOrder} />
          <SystemStats stats={stats} />
          <DepthChart orderBook={orderBook} />
        </div>
        
        <div className="center-panel">
          <OrderBook orderBook={orderBook} />
        </div>
        
        <div className="right-panel">
          <TradeHistory trades={trades} />
        </div>
      </div>
    </div>
  );
}

export default App;
