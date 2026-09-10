import { highlightCode } from '@/scanner';

interface CodeBlockProps {
  code: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  variant?: 'vulnerable' | 'secure' | 'neutral';
}

export function CodeBlock({ code, showLineNumbers = true, highlightLines = [], variant = 'neutral' }: CodeBlockProps) {
  const lines = code.split('\n');
  const variantColor =
    variant === 'vulnerable' ? 'rgba(255,45,85,0.03)' : variant === 'secure' ? 'rgba(16,185,129,0.03)' : 'transparent';
  const variantBorder =
    variant === 'vulnerable' ? 'border-danger/20' : variant === 'secure' ? 'border-emerald/20' : 'border-white/[0.06]';

  return (
    <div className={`rounded-lg border ${variantBorder} bg-[#060912]/80 overflow-hidden`}>
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="h-2.5 w-2.5 rounded-full bg-danger/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-emerald/60" />
        {variant !== 'neutral' && (
          <span className={`ml-2 text-xs font-mono ${variant === 'vulnerable' ? 'text-danger' : 'text-emerald'}`}>
            {variant === 'vulnerable' ? 'VULNERABLE' : 'SECURE'}
          </span>
        )}
      </div>
      <div className="overflow-x-auto p-4" style={{ background: variantColor }}>
        <pre className="font-mono text-sm leading-relaxed">
          {lines.map((line, i) => {
            const lineNum = i + 1;
            const isHighlighted = highlightLines.includes(lineNum);
            return (
              <div
                key={i}
                className={`flex ${isHighlighted ? (variant === 'secure' ? 'tok-add' : variant === 'vulnerable' ? 'tok-del' : 'bg-cyan/10') : ''} -mx-4 px-4`}
              >
                {showLineNumbers && (
                  <span className="select-none text-slate-600 text-right pr-4 min-w-[2.5rem]">{lineNum}</span>
                )}
                <code
                  className="flex-1"
                  dangerouslySetInnerHTML={{ __html: highlightCode(line) || '&nbsp;' }}
                />
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
