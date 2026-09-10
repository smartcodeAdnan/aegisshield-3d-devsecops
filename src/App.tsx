import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { VulnerabilitySlideOver } from '@/components/VulnerabilitySlideOver';
import { AuditModal } from '@/components/AuditModal';
import { RemediationModal } from '@/components/RemediationModal';
import { SecurityHub } from '@/views/SecurityHub';
import { CodeScanner } from '@/views/CodeScanner';
import { ThreatAnalytics } from '@/views/ThreatAnalytics';
import { ComplianceAudit } from '@/views/ComplianceAudit';
import { fetchVulnerabilities, fetchThreatEvents, subscribeToVulnerabilities, subscribeToThreatEvents, updateVulnerabilityStatus } from '@/lib/supabase';
import { vulnerabilities as fallbackVulns, threatEvents as fallbackThreats } from '@/data';
import type { ViewId, Vulnerability, ThreatEvent } from '@/types';

function App() {
  const [activeView, setActiveView] = useState<ViewId>('security-hub');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
  const [remediationVuln, setRemediationVuln] = useState<Vulnerability | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>(fallbackVulns);
  const [threatEvents, setThreatEvents] = useState<ThreatEvent[]>(fallbackThreats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubVulns: (() => void) | undefined;
    let unsubThreats: (() => void) | undefined;

    (async () => {
      const [vulns, threats] = await Promise.all([
        fetchVulnerabilities(),
        fetchThreatEvents(),
      ]);
      if (vulns.length > 0) setVulnerabilities(vulns);
      if (threats.length > 0) setThreatEvents(threats);
      setLoading(false);

      unsubVulns = subscribeToVulnerabilities((updated) => {
        if (updated.length > 0) setVulnerabilities(updated);
      });
      unsubThreats = subscribeToThreatEvents((updated) => {
        if (updated.length > 0) setThreatEvents(updated);
      });
    })();

    return () => {
      unsubVulns?.();
      unsubThreats?.();
    };
  }, []);

  const handleRemediate = (vuln: Vulnerability) => {
    setSelectedVuln(null);
    setRemediationVuln(vuln);
  };

  const handleApplyFix = useCallback(async (vuln: Vulnerability) => {
    const success = await updateVulnerabilityStatus(vuln.id, 'remediated');
    if (success) {
      setVulnerabilities((prev) =>
        prev.map((v) => (v.id === vuln.id ? { ...v, status: 'remediated' as const } : v))
      );
    }
    setRemediationVuln(null);
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'security-hub':
        return <SecurityHub vulnerabilities={vulnerabilities} onVulnClick={setSelectedVuln} onRunAudit={() => setAuditOpen(true)} loading={loading} />;
      case 'code-scanner':
        return <CodeScanner />;
      case 'threat-analytics':
        return <ThreatAnalytics threats={threatEvents} loading={loading} />;
      case 'compliance-audit':
        return <ComplianceAudit vulnerabilities={vulnerabilities} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-midnight-900 text-slate-200">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/[0.06] bg-midnight-900/80 backdrop-blur-xl px-4 py-3 lg:hidden">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-400 hover:text-cyan hover:bg-white/[0.05] transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan to-purple-electric">
              <span className="font-display text-xs font-bold text-white">A</span>
            </div>
            <span className="font-display text-sm font-bold text-white">AegisShield 3D</span>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="p-4 lg:p-8 max-w-7xl mx-auto"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Slide-over, modals */}
      <VulnerabilitySlideOver
        vulnerability={selectedVuln}
        onClose={() => setSelectedVuln(null)}
        onRemediate={handleRemediate}
      />
      <AuditModal open={auditOpen} onClose={() => setAuditOpen(false)} onComplete={() => {}} />
      <RemediationModal vulnerability={remediationVuln} onClose={() => setRemediationVuln(null)} onApplyFix={handleApplyFix} />
    </div>
  );
}

export default App;
