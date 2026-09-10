import { motion } from 'framer-motion';
import { Activity, Shield, Globe, Clock, TrendingUp, AlertTriangle, Ban, Eye, Loader2 } from 'lucide-react';
import type { ThreatEvent } from '@/types';

const severityColors: Record<string, string> = {
  critical: '#FF2D55',
  high: '#FF8C42',
  medium: '#FFB800',
  low: '#00F2FE',
  info: '#A855F7',
};

interface ThreatAnalyticsProps {
  threats: ThreatEvent[];
  loading?: boolean;
}

export function ThreatAnalytics({ threats, loading }: ThreatAnalyticsProps) {
  const blockedCount = threats.filter((t) => t.blocked).length;
  const criticalCount = threats.filter((t) => t.severity === 'critical').length;

  // Threat type distribution
  const typeCounts = threats.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Hourly distribution (mock)
  const hourlyData = [8, 12, 6, 15, 22, 18, 10, 14, 25, 30, 20, 16];
  const maxHourly = Math.max(...hourlyData);

  const topThreatTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const summaryCards = [
    { label: 'Total Threats', value: threats.length, icon: Activity, color: '#00F2FE' },
    { label: 'Blocked', value: blockedCount, icon: Ban, color: '#10B981' },
    { label: 'Critical', value: criticalCount, icon: AlertTriangle, color: '#FF2D55' },
    { label: 'Avg Response', value: '0.3s', icon: Clock, color: '#A855F7' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Threat Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time threat intelligence and attack monitoring</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              className="glass rounded-2xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${card.color}10`, border: `1px solid ${card.color}20` }}>
                  <Icon className="h-5 w-5" style={{ color: card.color }} />
                </div>
              </div>
              <div className="font-display text-2xl font-bold text-white">
                {loading ? <Loader2 className="h-5 w-5 animate-spin text-slate-500" /> : card.value}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{card.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Threat chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan" />
              <h3 className="text-sm font-semibold text-white">Threat Activity (Last 12 Hours)</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="h-2 w-2 rounded-full bg-cyan" /> Blocked
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 h-48">
            {hourlyData.map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  className="w-full rounded-t-lg bg-gradient-to-t from-cyan/20 to-cyan/60"
                  initial={{ height: 0 }}
                  animate={{ height: `${(value / maxHourly) * 100}%` }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 100 }}
                  style={{ minHeight: '4px', boxShadow: '0 0 10px rgba(0,242,254,0.2)' }}
                />
                <span className="text-[10px] text-slate-600 font-mono">{i}h</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top threat types */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-emerald" />
            <h3 className="text-sm font-semibold text-white">Top Threat Types</h3>
          </div>
          <div className="space-y-3">
            {topThreatTypes.map(([type, count], i) => {
              const maxCount = topThreatTypes[0][1];
              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-300 truncate">{type}</span>
                    <span className="text-xs font-mono text-cyan">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-cyan to-emerald"
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxCount) * 100}%` }}
                      transition={{ delay: i * 0.05, duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live threat feed */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-emerald animate-pulse-glow" />
              <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald blur-sm" />
            </div>
            <h3 className="text-sm font-semibold text-white">Live Threat Feed</h3>
          </div>
          <span className="text-xs text-slate-500">Real-time</span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-cyan" />
            </div>
          )}
          {!loading && threats.map((threat, i) => {
            const color = severityColors[threat.severity];
            return (
              <motion.div
                key={threat.id}
                className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 hover:bg-white/[0.04] transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  {threat.blocked ? <Ban className="h-4 w-4" style={{ color }} /> : <Eye className="h-4 w-4" style={{ color }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{threat.type}</span>
                    <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase" style={{ color, background: `${color}15` }}>
                      {threat.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                    <Globe className="h-3 w-3" />
                    {threat.source}
                    <span className="text-slate-700">→</span>
                    {threat.target}
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-xs text-slate-400">{new Date(threat.timestamp).toLocaleTimeString()}</span>
                  {threat.blocked && <span className="text-[10px] text-emerald font-mono">BLOCKED</span>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
