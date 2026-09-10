import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X, Radar, ShieldCheck, AlertTriangle, FileText } from 'lucide-react';

interface AuditModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const scanSteps = [
  'Initializing security engine...',
  'Scanning source code repositories...',
  'Analyzing dependency tree for CVEs...',
  'Checking OWASP Top 10 patterns...',
  'Validating ISO 27001 controls...',
  'Inspecting authentication flows...',
  'Auditing cryptographic implementations...',
  'Reviewing access control matrices...',
  'Cross-referencing threat intelligence feeds...',
  'Generating compliance report...',
];

export function AuditModal({ open, onClose, onComplete }: AuditModalProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [threatsFound, setThreatsFound] = useState(0);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setCurrentStep(0);
      setThreatsFound(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        const next = prev + 1.5;
        const stepIndex = Math.min(Math.floor((next / 100) * scanSteps.length), scanSteps.length - 1);
        setCurrentStep(stepIndex);
        if (Math.random() > 0.7) {
          setThreatsFound((t) => t + 1);
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [open, onComplete]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-midnight-950/90 backdrop-blur-xl" onClick={onClose} />

          <motion.div
            className="relative w-full max-w-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="glass-strong rounded-3xl border border-cyan/20 p-8 neon-border-cyan">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute right-6 top-6 rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Radar */}
              <div className="relative mx-auto mb-8 h-64 w-64">
                {/* Radar rings */}
                {[0.3, 0.55, 0.8, 1].map((scale, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 rounded-full border border-cyan/20"
                    style={{ transform: `scale(${scale})` }}
                  />
                ))}

                {/* Cross lines */}
                <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-cyan/10" />
                <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-cyan/10" />

                {/* Sweep */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0,242,254,0.25) 40deg, transparent 80deg)',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />

                {/* Center icon */}
                <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cyan/10 neon-border-cyan">
                  <Radar className="h-8 w-8 text-cyan animate-pulse-glow" />
                </div>

                {/* Blips */}
                {Array.from({ length: 6 }).map((_, i) => {
                  const angle = (i / 6) * Math.PI * 2;
                  const r = 60 + (i % 3) * 25;
                  const x = Math.cos(angle) * r;
                  const y = Math.sin(angle) * r;
                  return (
                    <motion.div
                      key={i}
                      className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
                      style={{
                        x,
                        y,
                        background: i % 3 === 0 ? '#FF2D55' : i % 3 === 1 ? '#FFB800' : '#10B981',
                        boxShadow: `0 0 8px currentColor`,
                      }}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    />
                  );
                })}

                {/* Progress ring */}
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 256 256">
                  <circle cx="128" cy="128" r="120" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <motion.circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke="#00F2FE"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={754}
                    animate={{ strokeDashoffset: 754 - (754 * progress) / 100 }}
                    transition={{ ease: 'linear' }}
                    style={{ filter: 'drop-shadow(0 0 6px #00F2FE)' }}
                  />
                </svg>
              </div>

              {/* Progress text */}
              <div className="text-center">
                <motion.div
                  className="font-display text-5xl font-bold text-cyan neon-text-cyan"
                  animate={{ opacity: progress >= 100 ? 1 : [0.7, 1, 0.7] }}
                  transition={{ duration: 1, repeat: progress >= 100 ? 0 : Infinity }}
                >
                  {Math.round(progress)}%
                </motion.div>
                <div className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-400">
                  {progress >= 100 ? (
                    <>
                      <ShieldCheck className="h-4 w-4 text-emerald" />
                      <span className="text-emerald">Audit Complete</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <span>{scanSteps[currentStep]}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="glass rounded-xl p-3 text-center">
                  <div className="font-display text-2xl font-bold text-danger">{threatsFound}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Threats Found</div>
                </div>
                <div className="glass rounded-xl p-3 text-center">
                  <div className="font-display text-2xl font-bold text-cyan">{Math.round(progress * 0.47)}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Files Scanned</div>
                </div>
                <div className="glass rounded-xl p-3 text-center">
                  <div className="font-display text-2xl font-bold text-emerald">{Math.round(progress * 0.12)}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Controls Checked</div>
                </div>
              </div>

              {/* Step log */}
              <div className="mt-4 max-h-24 overflow-y-auto rounded-xl border border-white/[0.06] bg-[#060912]/60 p-3 font-mono text-xs">
                {scanSteps.slice(0, currentStep + 1).map((step, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2 py-0.5"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <span className={i < currentStep ? 'text-emerald' : 'text-cyan'}>
                      {i < currentStep ? '✓' : '▸'}
                    </span>
                    <span className={i < currentStep ? 'text-slate-500' : 'text-slate-300'}>{step}</span>
                  </motion.div>
                ))}
              </div>

              {progress >= 100 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={onClose}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald to-cyan px-4 py-3 text-sm font-semibold text-white"
                >
                  <FileText className="h-4 w-4" />
                  View Full Report
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
