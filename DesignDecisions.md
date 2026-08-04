# Design Decisions

## Matching Logic
- **How orders are matched:** The matching engine maintains two arrays: `buyOrders` (sorted descending by price, then ascending by time) and `sellOrders` (sorted ascending by price, then ascending by time). When a new BUY order arrives, the engine compares its price against the best (lowest) SELL order. If `Buy Price >= Sell Price`, a trade executes at the maker's price (the resting order's price). The process loops until the new order is completely filled or there are no more matching sell orders. The same logic applies inversely for SELL orders.
- **Partial Fills:** If an incoming order has a larger quantity than the best resting order, it fully consumes the resting order and generates a trade for that quantity. The resting order is removed from the book, and the remaining quantity of the incoming order continues to match against the next best resting order. If the incoming order isn't fully filled after all matches, its remaining quantity rests in the order book.

## Data Structures
- **Order Storage Strategy:** For this simulation, an in-memory array strategy is used for both buy and sell order books. Sorting is enforced on insertion. Because Node.js is single-threaded, race conditions (which are common in multi-threaded matching engines) are inherently avoided during the synchronous matching loop.
- **Trade Storage Strategy:** Trades are stored in a simple array. To prevent unbound memory growth, the WebSocket broadcast pushes the most recent trades, and the API endpoints only return a slice of the latest 100 trades.

## Scaling Considerations
*Assume: 100,000 active orders, 10,000 trades per minute*
If this system were to be scaled to a production level, the current in-memory array implementation would suffer from performance degradation on insertions, as array `sort()` or `splice()` is $O(N)$ or $O(N \log N)$. 

**How to improve performance:**
1. **Red-Black Trees / Skip Lists:** Transition the order book from simple arrays to a more performant data structure like an AVL/Red-Black tree or a Skip List. This guarantees $O(\log N)$ insertions and deletions, handling 100,000 active orders easily.
2. **In-Memory Datastores (Redis):** While the matching engine needs to operate entirely in RAM for speed, persisting state to an in-memory datastore like Redis (using Sorted Sets) would allow horizontal scalability of API read nodes (e.g., streaming order book state to WebSocket nodes) while keeping a single writer (the Matching Engine).
3. **Event Sourcing:** Trades and order lifecycle events (placed, matched, cancelled) should be asynchronously published to a message broker (e.g., Kafka) to decouple the heavy IO tasks (database persistence, analytical engines) from the low-latency matching engine loop.
