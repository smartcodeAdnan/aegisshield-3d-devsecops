import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldX, ShieldCheck, ArrowRight, Copy, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { Vulnerability } from '@/types';
import { CodeBlock } from './CodeBlock';

interface RemediationModalProps {
  vulnerability: Vulnerability | null;
  onClose: () => void;
  onApplyFix: (vuln: Vulnerability) => Promise<void>;
}

export function RemediationModal({ vulnerability, onClose, onApplyFix }: RemediationModalProps) {
  const [copied, setCopied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleCopy = () => {
    if (!vulnerability) return;
    navigator.clipboard.writeText(vulnerability.secureCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyFix = async () => {
    if (!vulnerability || applying || applied) return;
    setApplying(true);
    await onApplyFix(vulnerability);
    setApplying(false);
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {vulnerability && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-midnight-950/90 backdrop-blur-xl" onClick={onClose} />

          <motion.div
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="glass-strong rounded-3xl border border-white/[0.08] p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/10 border border-emerald/20">
                    <ShieldCheck className="h-5 w-5 text-emerald" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-white">Automated Remediation</h2>
                    <p className="text-xs text-slate-400">{vulnerability.title}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Diff header */}
              <div className="mb-4 flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <ShieldX className="h-5 w-5 text-danger" />
                  <span className="font-display text-sm font-semibold text-danger">Vulnerable Code</span>
                </div>
                <ArrowRight className="h-5 w-5 text-cyan animate-pulse" />
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald" />
                  <span className="font-display text-sm font-semibold text-emerald">Refactored Secure Code</span>
                </div>
              </div>

              {/* Side-by-side diff */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono">{vulnerability.file}:{vulnerability.line}</span>
                  </div>
                  <CodeBlock code={vulnerability.vulnerableCode} variant="vulnerable" highlightLines={[vulnerability.line]} />
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono">Refactored version</span>
                  </div>
                  <CodeBlock code={vulnerability.secureCode} variant="secure" />
                </div>
              </div>

              {/* Fix description */}
              <div className="mt-4 glass rounded-xl p-4 border-l-2 border-emerald">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-emerald mb-1">Fix Summary</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{vulnerability.recommendation}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.06] transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy Secure Code'}
                </button>
                <button
                  onClick={handleApplyFix}
                  disabled={applying || applied}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald to-cyan px-4 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-emerald/20 disabled:opacity-70"
                >
                  {applying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Applying fix...
                    </>
                  ) : applied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Remediated successfully
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Apply Fix & Mark as Remediated
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
