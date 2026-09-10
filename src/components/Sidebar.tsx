import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Code2, Activity, FileCheck, ChevronLeft, Zap } from 'lucide-react';
import type { ViewId } from '@/types';

interface SidebarProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems: { id: ViewId; label: string; icon: typeof Shield; description: string }[] = [
  { id: 'security-hub', label: 'Security Hub', icon: Shield, description: 'Threat radar & overview' },
  { id: 'code-scanner', label: 'Code Scanner', icon: Code2, description: 'Interactive vulnerability scan' },
  { id: 'threat-analytics', label: 'Threat Analytics', icon: Activity, description: 'Live threat intelligence' },
  { id: 'compliance-audit', label: 'Compliance Audit', icon: FileCheck, description: 'ISO 27001 & OWASP' },
];

export function Sidebar({ activeView, onNavigate, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {mobileOpen && (
          <motion.aside
            className="fixed left-0 top-0 z-50 h-full lg:hidden"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <SidebarContent
              activeView={activeView}
              onNavigate={(v) => { onNavigate(v); onCloseMobile(); }}
              collapsed={false}
              onToggleCollapse={() => {}}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        className="sticky top-0 hidden lg:flex h-screen flex-col z-30"
        animate={{ width: collapsed ? 72 : 264 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <SidebarContent
          activeView={activeView}
          onNavigate={onNavigate}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
        />
      </motion.aside>
    </>
  );
}

function SidebarContent({ activeView, onNavigate, collapsed, onToggleCollapse }: Omit<SidebarProps, 'mobileOpen' | 'onCloseMobile'>) {
  return (
    <div className="glass-panel flex h-full flex-col border-r border-white/[0.06]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-xl bg-cyan/30 blur-lg" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan to-purple-electric">
            <Shield className="h-5 w-5 text-white" />
          </div>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-display text-sm font-bold tracking-wide text-white whitespace-nowrap">AegisShield</h1>
            <p className="text-[10px] text-cyan/70 font-mono whitespace-nowrap">3D SECURITY PLATFORM</p>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            className="ml-auto rounded-lg p-1.5 text-slate-400 hover:text-cyan hover:bg-white/[0.05] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Collapse expand button */}
      {collapsed && (
        <button
          onClick={onToggleCollapse}
          className="mx-auto mt-3 rounded-lg p-1.5 text-slate-400 hover:text-cyan hover:bg-white/[0.05] transition-colors"
        >
          <ChevronLeft className="h-4 w-4 rotate-180" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan/10 to-transparent text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-cyan"
                  style={{ boxShadow: '0 0 10px #00F2FE' }}
                />
              )}
              <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-cyan' : ''}`} />
              {!collapsed && (
                <div className="text-left overflow-hidden">
                  <div className="text-sm font-medium whitespace-nowrap">{item.label}</div>
                  <div className="text-[10px] text-slate-500 whitespace-nowrap">{item.description}</div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* System status */}
      {!collapsed && (
        <div className="p-3 border-t border-white/[0.06]">
          <div className="glass rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative">
                <div className="h-2 w-2 rounded-full bg-emerald animate-pulse-glow" />
                <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald blur-sm" />
              </div>
              <span className="text-xs font-medium text-slate-300">System Status</span>
              <Zap className="ml-auto h-3.5 w-3.5 text-emerald" />
            </div>
            <div className="text-[10px] text-slate-500 font-mono">All scanners operational</div>
            <div className="mt-2 flex items-center gap-1">
              <div className="h-1 flex-1 rounded-full bg-emerald/30 overflow-hidden">
                <div className="h-full w-[98%] rounded-full bg-emerald" style={{ boxShadow: '0 0 6px #10B981' }} />
              </div>
              <span className="text-[10px] text-emerald font-mono">98%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function MobileNavButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-xl glass lg:hidden"
    >
      <ChevronLeft className="h-5 w-5 text-cyan" />
    </button>
  );
}
