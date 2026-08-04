import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { MatchingEngine } from './engine/MatchingEngine';
import { Order, OrderType, Side } from './models/types';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const engine = new MatchingEngine(
  (trade) => {
    io.emit('trade', trade);
  },
  () => {
    io.emit('orderBook', engine.getOrderBook());
  },
  () => {
    io.emit('stats', engine.getStats());
  }
);

// REST API
app.post('/orders', (req, res) => {
  const { side, type = 'LIMIT', price, quantity } = req.body;
  
  if (!side || !['BUY', 'SELL'].includes(side)) {
    return res.status(400).json({ error: 'Invalid side' });
  }
  
  if (!['LIMIT', 'MARKET'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type' });
  }
  
  if (type === 'LIMIT' && (typeof price !== 'number' || price <= 0)) {
    return res.status(400).json({ error: 'Invalid price for limit order' });
  }
  
  if (typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }
  
  const order: Order = {
    id: uuidv4(),
    side: side as Side,
    type: type as OrderType,
    price: type === 'MARKET' ? (side === 'BUY' ? Infinity : 0) : price,
    quantity,
    timestamp: Date.now()
  };
  
  engine.addOrder(order);
  res.status(201).json(order);
});

app.delete('/orders/:id', (req, res) => {
  const { id } = req.params;
  const cancelled = engine.cancelOrder(id);
  if (cancelled) {
    res.status(200).json({ message: 'Order cancelled' });
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

app.get('/orderbook', (req, res) => {
  res.json(engine.getOrderBook());
});

app.get('/trades', (req, res) => {
  res.json(engine.getTrades());
});

app.get('/stats', (req, res) => {
  res.json(engine.getStats());
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send initial state
  socket.emit('orderBook', engine.getOrderBook());
  socket.emit('stats', engine.getStats());
  socket.emit('trades', engine.getTrades()); // Send history
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
