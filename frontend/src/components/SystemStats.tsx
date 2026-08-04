import React from 'react';
import type { SystemStats as StatsType } from '../hooks/useSocket';

interface SystemStatsProps {
  stats: StatsType;
}

const SystemStats: React.FC<SystemStatsProps> = ({ stats }) => {
  return (
    <div className="glass-panel">
      <h2>System Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="label">Total Buy Orders</span>
          <span className="value">{stats.totalBuyOrders}</span>
        </div>
        <div className="stat-card">
          <span className="label">Total Sell Orders</span>
          <span className="value">{stats.totalSellOrders}</span>
        </div>
        <div className="stat-card">
          <span className="label">Active Buys</span>
          <span className="value">{stats.activeBuyOrders}</span>
        </div>
        <div className="stat-card">
          <span className="label">Active Sells</span>
          <span className="value">{stats.activeSellOrders}</span>
        </div>
        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
          <span className="label">Total Trades Executed</span>
          <span className="value" style={{ color: 'var(--text-primary)' }}>{stats.totalTradesExecuted}</span>
        </div>
      </div>
    </div>
  );
};

export default SystemStats;
