import { motion } from 'framer-motion';
import { Shield, ShieldAlert, Activity, Zap, TrendingUp, Lock, Eye, Server, Wifi, Cpu, Loader2 } from 'lucide-react';
import { ParticleCanvas } from '@/components/ParticleCanvas';
import { Gauge } from '@/components/Gauge';
import type { Vulnerability } from '@/types';

interface SecurityHubProps {
  vulnerabilities: Vulnerability[];
  onVulnClick: (vuln: Vulnerability) => void;
  onRunAudit: () => void;
  loading?: boolean;
}

export function SecurityHub({ vulnerabilities, onVulnClick, onRunAudit, loading }: SecurityHubProps) {
  const openVulns = vulnerabilities.filter((v) => v.status === 'open');
  const criticalCount = openVulns.filter((v) => v.severity === 'critical').length;
  const highCount = openVulns.filter((v) => v.severity === 'high').length;
  const remediatedCount = vulnerabilities.filter((v) => v.status === 'remediated').length;
  const healthScore = Math.max(0, Math.round(100 - (criticalCount * 15 + highCount * 8 + (openVulns.length - criticalCount - highCount) * 3)));

  const stats = [
    { label: 'Threats Blocked', value: 12847, icon: Shield, color: '#10B981', change: '+12%' },
    { label: 'Active Vulnerabilities', value: openVulns.length, icon: ShieldAlert, color: '#FF2D55', change: '-3' },
    { label: 'Scans Today', value: 342, icon: Activity, color: '#00F2FE', change: '+24%' },
    { label: 'Remediated', value: remediatedCount, icon: Zap, color: '#A855F7', change: '+1' },
  ];

  const floatingCards = [
    { icon: Lock, label: 'Encryption', value: 'AES-256', color: '#10B981', delay: 0 },
    { icon: Server, label: 'WAF Status', value: 'Active', color: '#00F2FE', delay: 0.5 },
    { icon: Eye, label: 'Monitoring', value: '24/7', color: '#A855F7', delay: 1 },
    { icon: Wifi, label: 'Network Scan', value: 'Clean', color: '#10B981', delay: 1.5 },
  ];

  return (
    <div className="space-y-6">
      {/* Hero section with 3D visualizer */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-midnight-800/50 to-midnight-900/50">
        <div className="grid-bg absolute inset-0 opacity-30" />
        <div className="absolute inset-0">
          <ParticleCanvas />
        </div>

        <div className="relative grid lg:grid-cols-2 gap-8 p-8 lg:p-12 min-h-[420px]">
          {/* Left: Title and CTA */}
          <div className="flex flex-col justify-center z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/5 px-3 py-1">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse-glow" />
                <span className="text-xs font-mono text-cyan">REAL-TIME PROTECTION ACTIVE</span>
              </div>
              <h1 className="font-display text-4xl lg:text-5xl font-bold leading-tight text-white">
                Your Code is <span className="shimmer-text">Protected</span>
              </h1>
              <p className="mt-3 text-sm text-slate-400 max-w-md">
                AI-powered vulnerability detection across your entire codebase. Scan, analyze, and remediate security issues before they reach production.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={onRunAudit}
                  className="group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-emerald px-5 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-cyan/20"
                >
                  <Zap className="h-4 w-4" />
                  Run Security Audit
                  <div className="absolute inset-0 rounded-xl bg-cyan/20 blur-lg -z-10 group-hover:bg-cyan/30 transition-colors" />
                </button>
                <button className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.06] transition-colors">
                  <TrendingUp className="h-4 w-4 text-cyan" />
                  View Reports
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right: Floating metric cards */}
          <div className="relative flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              {floatingCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={i}
                    className="glass rounded-2xl p-4"
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.3 + card.delay * 0.1, type: 'spring', stiffness: 200 }}
                    whileHover={{ y: -4, scale: 1.03 }}
                    style={{ animation: `float 6s ease-in-out infinite ${card.delay}s` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${card.color}15`, border: `1px solid ${card.color}30` }}>
                        <Icon className="h-4 w-4" style={{ color: card.color }} />
                      </div>
                      <span className="text-[10px] font-mono" style={{ color: card.color }}>●</span>
                    </div>
                    <div className="font-display text-lg font-bold text-white">{card.value}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">{card.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              className="glass rounded-2xl p-5 hover:bg-white/[0.05] transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}20` }}>
                  <Icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
                <span className="text-xs font-mono" style={{ color: stat.change.startsWith('+') ? '#10B981' : '#FF2D55' }}>
                  {stat.change}
                </span>
              </div>
              <div className="font-display text-2xl font-bold text-white">
                {loading ? <Loader2 className="h-5 w-5 animate-spin text-slate-500" /> : stat.value.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Code Health Gauge + Vulnerability list */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Health gauge */}
        <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-slate-400 mb-4">Code Health Score</h3>
          <Gauge value={healthScore} size={180} label="out of 100" />
          <div className="mt-4 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan" />
            <span className="text-xs text-slate-400">
              {healthScore >= 80 ? 'Excellent security posture' : healthScore >= 50 ? 'Needs attention' : 'Critical issues detected'}
            </span>
          </div>
        </div>

        {/* Recent vulnerabilities */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Vulnerabilities</h3>
            <span className="text-xs text-slate-500">{openVulns.length} open</span>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-cyan" />
              </div>
            )}
            {!loading && vulnerabilities.slice(0, 6).map((vuln, i) => {
              const sevColor = vuln.severity === 'critical' ? '#FF2D55' : vuln.severity === 'high' ? '#FF8C42' : vuln.severity === 'medium' ? '#FFB800' : '#00F2FE';
              return (
                <motion.button
                  key={vuln.id}
                  onClick={() => onVulnClick(vuln)}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 text-left hover:bg-white/[0.05] hover:border-white/[0.08] transition-all"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: sevColor, boxShadow: `0 0 6px ${sevColor}` }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{vuln.title}</div>
                    <div className="text-xs text-slate-500 font-mono">{vuln.file}:{vuln.line}</div>
                  </div>
                  <span className="text-[10px] font-bold uppercase rounded-full px-2 py-0.5 flex-shrink-0" style={{ color: sevColor, background: `${sevColor}15` }}>
                    {vuln.severity}
                  </span>
                  {vuln.status === 'remediated' && (
                    <span className="text-[10px] font-bold uppercase rounded-full px-2 py-0.5 text-emerald bg-emerald/10 flex-shrink-0">
                      Fixed
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
