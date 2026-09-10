import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Play, AlertTriangle, ShieldCheck, X, Zap, ChevronRight, FileCode2 } from 'lucide-react';
import { CodeBlock } from '@/components/CodeBlock';
import { scanCode, highlightCode } from '@/scanner';
import { scanPresets } from '@/data';
import type { CodeFinding, Language } from '@/types';

const severityColors: Record<string, string> = {
  critical: '#FF2D55',
  high: '#FF8C42',
  medium: '#FFB800',
  low: '#00F2FE',
  info: '#A855F7',
};

export function CodeScanner() {
  const [code, setCode] = useState(scanPresets[0].code);
  const [language, setLanguage] = useState<Language>(scanPresets[0].language);
  const [findings, setFindings] = useState<CodeFinding[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const languages: { id: Language; label: string }[] = [
    { id: 'javascript', label: 'JavaScript' },
    { id: 'python', label: 'Python' },
    { id: 'sql', label: 'SQL' },
    { id: 'go', label: 'Go' },
  ];

  const handleScan = () => {
    setScanning(true);
    setScanProgress(0);
    setFindings([]);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setFindings(scanCode(code, language));
          setScanning(false);
          return 100;
        }
        return prev + 5;
      });
    }, 30);
  };

  const handlePreset = (presetId: string) => {
    const preset = scanPresets.find((p) => p.id === presetId);
    if (preset) {
      setCode(preset.code);
      setLanguage(preset.language);
      setFindings([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Interactive Code Scanner</h1>
          <p className="text-sm text-slate-400 mt-1">Paste your code or select a demo preset to scan for vulnerabilities</p>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-emerald px-5 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-cyan/20 disabled:opacity-50"
        >
          {scanning ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Scanning... {scanProgress}%
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Scan Code
            </>
          )}
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-slate-500 self-center mr-1">Demo presets:</span>
        {scanPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePreset(preset.id)}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-cyan/10 hover:border-cyan/20 hover:text-cyan transition-all"
          >
            <Zap className="h-3 w-3" />
            {preset.label}
          </button>
        ))}
      </div>

      {/* Language selector */}
      <div className="flex flex-wrap gap-2">
        {languages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => setLanguage(lang.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              language === lang.id
                ? 'bg-cyan/15 text-cyan border border-cyan/30'
                : 'border border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Code input */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Code2 className="h-4 w-4 text-cyan" />
            <h3 className="text-sm font-semibold text-white">Code Input</h3>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-[#060912]/80 overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="h-2.5 w-2.5 rounded-full bg-danger/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald/60" />
              <span className="ml-2 text-xs font-mono text-slate-500">{language}</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-96 resize-none bg-transparent p-4 font-mono text-sm text-slate-200 outline-none placeholder:text-slate-600"
              placeholder="Paste your code here..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* Results */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <FileCode2 className="h-4 w-4 text-emerald" />
            <h3 className="text-sm font-semibold text-white">Scan Results</h3>
            {findings.length > 0 && (
              <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-bold text-danger">{findings.length} issues</span>
            )}
          </div>

          {scanning && (
            <div className="rounded-xl border border-white/[0.06] bg-[#060912]/80 p-4">
              <div className="h-2 w-full rounded-full bg-white/[0.05] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan to-emerald"
                  animate={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-slate-400 font-mono">Analyzing patterns... {scanProgress}%</p>
            </div>
          )}

          {!scanning && findings.length === 0 && (
            <div className="flex h-96 flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-[#060912]/80">
              <ShieldCheck className="h-12 w-12 text-emerald/30 mb-3" />
              <p className="text-sm text-slate-500">Run a scan to detect vulnerabilities</p>
            </div>
          )}

          {!scanning && findings.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {findings.map((finding, i) => (
                <motion.div
                  key={i}
                  className="rounded-xl border border-white/[0.06] bg-[#060912]/80 p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" style={{ color: severityColors[finding.severity] }} />
                      <span className="text-xs font-mono font-bold" style={{ color: severityColors[finding.severity] }}>
                        {finding.rule}
                      </span>
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                      style={{ color: severityColors[finding.severity], background: `${severityColors[finding.severity]}15` }}
                    >
                      {finding.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mb-2">{finding.message}</p>
                  <div className="rounded-lg bg-danger/5 border border-danger/10 p-2 mb-2">
                    <div className="text-[10px] text-slate-500 mb-1">Line {finding.line}</div>
                    <code className="text-xs text-slate-300 font-mono" dangerouslySetInnerHTML={{ __html: highlightCode(finding.snippet) }} />
                  </div>
                  <div className="flex items-start gap-2 rounded-lg bg-emerald/5 border border-emerald/10 p-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-300">{finding.fix}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Highlighted code preview */}
      {findings.length > 0 && !scanning && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-purple-electric" />
            <h3 className="text-sm font-semibold text-white">Highlighted Code with Findings</h3>
          </div>
          <CodeBlock
            code={code}
            highlightLines={findings.map((f) => f.line)}
            variant="vulnerable"
          />
        </div>
      )}
    </div>
  );
}
