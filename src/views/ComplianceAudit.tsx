import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCheck, Download, Check, AlertTriangle, XCircle, FileJson, FileText, X, Printer } from 'lucide-react';
import { complianceItems } from '@/data';
import type { ComplianceItem, Vulnerability } from '@/types';

const statusConfig = {
  compliant: { color: '#10B981', bg: 'bg-emerald/10', border: 'border-emerald/20', icon: Check, label: 'Compliant' },
  warning: { color: '#FFB800', bg: 'bg-warning/10', border: 'border-warning/20', icon: AlertTriangle, label: 'Warning' },
  'non-compliant': { color: '#FF2D55', bg: 'bg-danger/10', border: 'border-danger/20', icon: XCircle, label: 'Non-Compliant' },
};

interface ComplianceAuditProps {
  vulnerabilities: Vulnerability[];
}

export function ComplianceAudit({ vulnerabilities }: ComplianceAuditProps) {
  const [filter, setFilter] = useState<string>('all');
  const [exportPreview, setExportPreview] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'pdf'>('json');
  const printRef = useRef<HTMLDivElement>(null);

  const filteredItems = filter === 'all' ? complianceItems : complianceItems.filter((item) => item.standard === filter);

  const compliantCount = complianceItems.filter((i) => i.status === 'compliant').length;
  const warningCount = complianceItems.filter((i) => i.status === 'warning').length;
  const nonCompliantCount = complianceItems.filter((i) => i.status === 'non-compliant').length;
  const complianceScore = Math.round((compliantCount / complianceItems.length) * 100);

  const standards = ['all', 'ISO 27001', 'OWASP Top 10'];

  const generateReport = (format: 'json' | 'pdf') => {
    setExportFormat(format);
    if (format === 'json') {
      const report = buildReportObject();
      setExportPreview(JSON.stringify(report, null, 2));
    } else {
      setExportPreview('pdf');
    }
  };

  const buildReportObject = () => ({
    metadata: {
      platform: 'AegisShield 3D',
      generatedAt: new Date().toISOString(),
      version: '3.0.0',
    },
    summary: {
      totalControls: complianceItems.length,
      compliant: compliantCount,
      warnings: warningCount,
      nonCompliant: nonCompliantCount,
      complianceScore,
    },
    vulnerabilities: {
      total: vulnerabilities.length,
      open: vulnerabilities.filter((v) => v.status === 'open').length,
      remediated: vulnerabilities.filter((v) => v.status === 'remediated').length,
      critical: vulnerabilities.filter((v) => v.severity === 'critical').length,
    },
    compliance: complianceItems,
    standards: ['ISO 27001', 'OWASP Top 10'],
  });

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    if (!exportPreview) return;
    downloadFile(exportPreview, 'aegisshield-audit-report.json', 'application/json');
  };

  const handlePrintPdf = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>AegisShield 3D — Audit Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; background: #090D16; color: #E2E8F0; padding: 40px; }
            .header { text-align: center; border-bottom: 2px solid #00F2FE; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { font-size: 24px; color: #00F2FE; letter-spacing: 2px; }
            .header p { color: #94A3B8; font-size: 12px; margin-top: 5px; }
            .section { margin-bottom: 25px; }
            .section-title { color: #10B981; font-size: 14px; font-weight: bold; border-bottom: 1px solid #1E293B; padding-bottom: 5px; margin-bottom: 10px; }
            .stat-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
            .stat-label { color: #94A3B8; }
            .stat-value { color: #00F2FE; font-weight: bold; }
            .control-item { padding: 8px 0; border-bottom: 1px solid #1E293B; font-size: 11px; }
            .control-status { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-right: 8px; }
            .status-compliant { background: rgba(16,185,129,0.2); color: #10B981; }
            .status-warning { background: rgba(255,184,0,0.2); color: #FFB800; }
            .status-non-compliant { background: rgba(255,45,85,0.2); color: #FF2D55; }
            .control-name { color: #E2E8F0; font-weight: bold; }
            .control-desc { color: #94A3B8; margin-top: 3px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 2px solid #00F2FE; color: #64748B; font-size: 10px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>AEGISSHIELD 3D — AUDIT REPORT</h1>
            <p>Generated: ${new Date().toLocaleString()} | Platform: AegisShield 3D v3.0.0</p>
          </div>
          <div class="section">
            <div class="section-title">COMPLIANCE SUMMARY</div>
            <div class="stat-row"><span class="stat-label">Total Controls</span><span class="stat-value">${complianceItems.length}</span></div>
            <div class="stat-row"><span class="stat-label">Compliant</span><span class="stat-value" style="color:#10B981">${compliantCount}</span></div>
            <div class="stat-row"><span class="stat-label">Warnings</span><span class="stat-value" style="color:#FFB800">${warningCount}</span></div>
            <div class="stat-row"><span class="stat-label">Non-Compliant</span><span class="stat-value" style="color:#FF2D55">${nonCompliantCount}</span></div>
            <div class="stat-row"><span class="stat-label">Compliance Score</span><span class="stat-value">${complianceScore}%</span></div>
          </div>
          <div class="section">
            <div class="section-title">VULNERABILITY SUMMARY</div>
            <div class="stat-row"><span class="stat-label">Total</span><span class="stat-value">${vulnerabilities.length}</span></div>
            <div class="stat-row"><span class="stat-label">Open</span><span class="stat-value" style="color:#FF2D55">${vulnerabilities.filter(v=>v.status==='open').length}</span></div>
            <div class="stat-row"><span class="stat-label">Remediated</span><span class="stat-value" style="color:#10B981">${vulnerabilities.filter(v=>v.status==='remediated').length}</span></div>
            <div class="stat-row"><span class="stat-label">Critical</span><span class="stat-value" style="color:#FF2D55">${vulnerabilities.filter(v=>v.severity==='critical').length}</span></div>
          </div>
          <div class="section">
            <div class="section-title">DETAILED CONTROLS</div>
            ${complianceItems.map(item => `
              <div class="control-item">
                <span class="control-status status-${item.status}">${item.status.toUpperCase()}</span>
                <span class="control-name">${item.standard} / ${item.control}</span>
                <div class="control-desc">${item.description}</div>
              </div>
            `).join('')}
          </div>
          <div class="footer">
            This report covers ISO 27001 &amp; OWASP Top 10 compliance standards<br/>
            AegisShield 3D — DevSecOps &amp; AI Vulnerability Audit Platform
          </div>
        </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => {
      win.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Compliance Audit</h1>
          <p className="text-sm text-slate-400 mt-1">ISO 27001 & OWASP Top 10 compliance monitoring</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => generateReport('json')}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/[0.06] transition-colors"
          >
            <FileJson className="h-4 w-4 text-cyan" />
            Export JSON
          </button>
          <button
            onClick={() => generateReport('pdf')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-emerald px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-cyan/20"
          >
            <FileText className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Compliance score */}
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="glass rounded-2xl p-5 flex flex-col items-center justify-center">
          <div className="relative h-24 w-24">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none" stroke="#10B981" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={264}
                initial={{ strokeDashoffset: 264 }}
                animate={{ strokeDashoffset: 264 - (264 * complianceScore) / 100 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                style={{ filter: 'drop-shadow(0 0 4px #10B981)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-bold text-emerald">{complianceScore}%</span>
              <span className="text-[10px] text-slate-500">Score</span>
            </div>
          </div>
          <span className="text-xs text-slate-400 mt-2">Overall Compliance</span>
        </div>

        {[
          { label: 'Compliant', value: compliantCount, color: '#10B981', icon: Check },
          { label: 'Warnings', value: warningCount, color: '#FFB800', icon: AlertTriangle },
          { label: 'Non-Compliant', value: nonCompliantCount, color: '#FF2D55', icon: XCircle },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              className="glass rounded-2xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}20` }}>
                  <Icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
              </div>
              <div className="font-display text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {standards.map((std) => (
          <button
            key={std}
            onClick={() => setFilter(std)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              filter === std
                ? 'bg-cyan/15 text-cyan border border-cyan/30'
                : 'border border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {std === 'all' ? 'All Standards' : std}
          </button>
        ))}
      </div>

      {/* Compliance items */}
      <div className="space-y-3">
        {filteredItems.map((item, i) => {
          const config = statusConfig[item.status];
          const Icon = config.icon;
          return (
            <motion.div
              key={item.id}
              className="glass rounded-xl p-4 hover:bg-white/[0.05] transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0" style={{ background: `${config.color}10`, border: `1px solid ${config.color}20` }}>
                  <Icon className="h-5 w-5" style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">{item.control}</span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-mono text-cyan bg-cyan/10">{item.standard}</span>
                    <span className="text-[10px] text-slate-500">{item.category}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase whitespace-nowrap flex-shrink-0"
                  style={{ color: config.color, background: `${config.color}15` }}
                >
                  {config.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Hidden printable PDF container */}
      <div ref={printRef} className="hidden" />

      {/* Export preview modal */}
      <AnimatePresence>
        {exportPreview && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-midnight-950/90 backdrop-blur-xl" onClick={() => setExportPreview(null)} />
            <motion.div
              className="relative w-full max-w-3xl max-h-[80vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="glass-strong rounded-3xl border border-white/[0.08] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/10 border border-cyan/20">
                      <FileCheck className="h-5 w-5 text-cyan" />
                    </div>
                    <div>
                      <h2 className="font-display text-base font-bold text-white">Audit Report Preview</h2>
                      <p className="text-xs text-slate-400">ISO 27001 & OWASP Top 10</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setExportPreview(null)}
                    className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Preview content */}
                <div className="p-5 max-h-[50vh] overflow-y-auto">
                  {exportFormat === 'json' ? (
                    <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{exportPreview}</pre>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center pb-4 border-b border-white/[0.06]">
                        <h3 className="font-display text-xl font-bold text-cyan">AEGISSHIELD 3D — AUDIT REPORT</h3>
                        <p className="text-xs text-slate-500 mt-1">Generated: {new Date().toLocaleString()}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-emerald mb-2">Compliance Summary</h4>
                        <div className="space-y-1 text-xs text-slate-300 font-mono">
                          <div className="flex justify-between"><span>Total Controls</span><span className="text-cyan">{complianceItems.length}</span></div>
                          <div className="flex justify-between"><span>Compliant</span><span className="text-emerald">{compliantCount}</span></div>
                          <div className="flex justify-between"><span>Warnings</span><span className="text-warning">{warningCount}</span></div>
                          <div className="flex justify-between"><span>Non-Compliant</span><span className="text-danger">{nonCompliantCount}</span></div>
                          <div className="flex justify-between"><span>Compliance Score</span><span className="text-cyan">{complianceScore}%</span></div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-emerald mb-2">Vulnerability Summary</h4>
                        <div className="space-y-1 text-xs text-slate-300 font-mono">
                          <div className="flex justify-between"><span>Total</span><span className="text-cyan">{vulnerabilities.length}</span></div>
                          <div className="flex justify-between"><span>Open</span><span className="text-danger">{vulnerabilities.filter(v=>v.status==='open').length}</span></div>
                          <div className="flex justify-between"><span>Remediated</span><span className="text-emerald">{vulnerabilities.filter(v=>v.status==='remediated').length}</span></div>
                          <div className="flex justify-between"><span>Critical</span><span className="text-danger">{vulnerabilities.filter(v=>v.severity==='critical').length}</span></div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-emerald mb-2">Detailed Controls</h4>
                        <div className="space-y-2">
                          {complianceItems.map((item: ComplianceItem) => (
                            <div key={item.id} className="text-xs border-l-2 pl-3 py-1" style={{ borderColor: statusConfig[item.status].color }}>
                              <span className="font-mono text-slate-400">[{item.status.toUpperCase()}]</span>
                              <span className="text-slate-200 ml-2">{item.standard} / {item.control}</span>
                              <p className="text-slate-500 mt-0.5">{item.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-5 border-t border-white/[0.06]">
                  {exportFormat === 'json' ? (
                    <button
                      onClick={handleDownloadJson}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-emerald px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-cyan/20"
                    >
                      <Download className="h-4 w-4" />
                      Download JSON
                    </button>
                  ) : (
                    <button
                      onClick={handlePrintPdf}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-emerald px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-cyan/20"
                    >
                      <Printer className="h-4 w-4" />
                      Print / Save as PDF
                    </button>
                  )}
                  <button
                    onClick={() => setExportPreview(null)}
                    className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/[0.06] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
