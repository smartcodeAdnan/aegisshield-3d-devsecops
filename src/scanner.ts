import type { CodeFinding, Language } from './types';

interface ScanRule {
  patterns: RegExp[];
  rule: string;
  message: string;
  severity: CodeFinding['severity'];
  fix: string;
  languages: Language[];
}

const scanRules: ScanRule[] = [
  {
    patterns: [/["'`].*\+.*\+.*["'`]/, /SELECT.*\+|INSERT.*\+|UPDATE.*\+|DELETE.*\+/i],
    rule: 'SQL-INJECTION',
    message: 'String concatenation detected in SQL query. Use parameterized queries.',
    severity: 'critical',
    fix: 'Replace string concatenation with parameterized queries using bound parameters (?).',
    languages: ['javascript', 'python', 'go'],
  },
  {
    patterns: [/dangerouslySetInnerHTML/, /\.innerHTML\s*[+]?=/],
    rule: 'XSS-INJECTION',
    message: 'Unsanitized HTML injection. Sanitize with DOMPurify before rendering.',
    severity: 'high',
    fix: 'Use DOMPurify.sanitize() before rendering, or use React text interpolation which auto-escapes.',
    languages: ['javascript'],
  },
  {
    patterns: [/sk_live_[a-zA-Z0-9]{16,}/, /sk_test_[a-zA-Z0-9]{16,}/, /AKIA[0-9A-Z]{16}/, /ghp_[a-zA-Z0-9]{36}/, /api[_-]?key\s*[:=]\s*["'`][a-zA-Z0-9]{20,}["'`]/i],
    rule: 'HARDCODED-SECRET',
    message: 'Hardcoded API key or secret detected. Move to environment variables or secrets manager.',
    severity: 'critical',
    fix: 'Store secrets in environment variables or a secrets manager. Never commit credentials to source.',
    languages: ['javascript', 'python', 'go'],
  },
  {
    patterns: [/pickle\.loads?\s*\(/, /yaml\.load\s*\(/],
    rule: 'INSECURE-DESERIALIZATION',
    message: 'Insecure deserialization of untrusted data. Use JSON or implement strict deserialization.',
    severity: 'high',
    fix: 'Use json.loads() instead of pickle.loads(). If pickle is required, implement a custom Unpickler with class restrictions.',
    languages: ['python'],
  },
  {
    patterns: [/strcpy\s*\(/, /strcat\s*\(/, /gets\s*\(/, /sprintf\s*\(/],
    rule: 'BUFFER-OVERFLOW',
    message: 'Unsafe C function without bounds checking. Use bounded alternatives.',
    severity: 'high',
    fix: 'Use strncpy/snprintf with explicit size limits, or prefer Go-native slices with length validation.',
    languages: ['go', 'python', 'javascript'],
  },
  {
    patterns: [/eval\s*\(/, /new\s+Function\s*\(/, /exec\s*\(/],
    rule: 'CODE-INJECTION',
    message: 'Dynamic code execution detected. Avoid eval() and use safe alternatives.',
    severity: 'critical',
    fix: 'Avoid eval() entirely. Use JSON.parse() for data, or Function constructors with strict sandboxing.',
    languages: ['javascript', 'python'],
  },
  {
    patterns: [/createHash\s*\(\s*['"]md5['"]\s*\)/, /createHash\s*\(\s*['"]sha1['"]\s*\)/, /hashlib\.md5\s*\(/, /hashlib\.sha1\s*\(/],
    rule: 'WEAK-HASH',
    message: 'Weak hash algorithm detected. Use bcrypt, scrypt, or Argon2 for passwords.',
    severity: 'high',
    fix: 'Replace MD5/SHA1 with bcrypt, scrypt, or Argon2 for password hashing. Use SHA-256+ for data integrity.',
    languages: ['javascript', 'python', 'go'],
  },
  {
    patterns: [/http:\/\/(?!localhost|127\.0\.0\.1)/],
    rule: 'INSECURE-TRANSPORT',
    message: 'Insecure HTTP URL detected. Use HTTPS for all external communications.',
    severity: 'medium',
    fix: 'Replace http:// with https:// for all external URLs. Enforce TLS in production.',
    languages: ['javascript', 'python', 'go'],
  },
  {
    patterns: [/cors\s*\(.*origin.*\*/, /Access-Control-Allow-Origin.*\*/, /allowHeaders.*\*/],
    rule: 'CORS-MISCONFIG',
    message: 'Wildcard CORS detected. Restrict to specific trusted origins.',
    severity: 'medium',
    fix: 'Replace wildcard (*) with explicit origin allowlist. Validate against trusted domains.',
    languages: ['javascript', 'python', 'go'],
  },
  {
    patterns: [/\.exec\s*\(/, /child_process/, /os\.system\s*\(/, /subprocess\.call\s*\(/],
    rule: 'COMMAND-INJECTION',
    message: 'Potential command injection via shell execution. Validate and sanitize all inputs.',
    severity: 'high',
    fix: 'Use execFile/spawn with argument arrays instead of shell strings. Validate all inputs against allowlists.',
    languages: ['javascript', 'python', 'go'],
  },
];

export function scanCode(code: string, language: Language): CodeFinding[] {
  const findings: CodeFinding[] = [];
  const lines = code.split('\n');

  for (const rule of scanRules) {
    if (!rule.languages.includes(language)) continue;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of rule.patterns) {
        if (pattern.test(line)) {
          findings.push({
            line: i + 1,
            severity: rule.severity,
            rule: rule.rule,
            message: rule.message,
            snippet: line.trim(),
            fix: rule.fix,
          });
          break;
        }
      }
    }
  }

  return findings;
}

const keywordMap: Record<string, string> = {
  'const': 'tok-key', 'let': 'tok-key', 'var': 'tok-key', 'function': 'tok-key',
  'return': 'tok-key', 'if': 'tok-key', 'else': 'tok-key', 'for': 'tok-key',
  'while': 'tok-key', 'import': 'tok-key', 'from': 'tok-key', 'export': 'tok-key',
  'default': 'tok-key', 'async': 'tok-key', 'await': 'tok-key', 'new': 'tok-key',
  'class': 'tok-key', 'extends': 'tok-key', 'try': 'tok-key', 'catch': 'tok-key',
  'def': 'tok-key', 'elif': 'tok-key', 'package': 'tok-key', 'func': 'tok-key',
  'struct': 'tok-key', 'interface': 'tok-key', 'type': 'tok-key', 'nil': 'tok-key',
  'None': 'tok-key', 'True': 'tok-key', 'False': 'tok-key', 'null': 'tok-key',
  'true': 'tok-key', 'false': 'tok-key', 'this': 'tok-key', 'self': 'tok-key',
  'unsafe': 'tok-key', 'cgo': 'tok-key', 'C': 'tok-key',
};

export function highlightCode(code: string): string {
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Comments
  html = html.replace(/(\/\/[^\n]*)/g, '<span class="tok-com">$1</span>');
  html = html.replace(/(#[^\n]*)/g, '<span class="tok-com">$1</span>');
  html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="tok-com">$1</span>');

  // Strings
  html = html.replace(/(`[^`]*`|"[^"]*"|'[^']*')/g, '<span class="tok-str">$1</span>');

  // Numbers
  html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="tok-num">$1</span>');

  // Keywords
  for (const [kw, cls] of Object.entries(keywordMap)) {
    const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    html = html.replace(re, `<span class="${cls}">${kw}</span>`);
  }

  // Function calls
  html = html.replace(/\b([a-zA-Z_]\w*)(\s*\()/g, '<span class="tok-fn">$1</span>$2');

  return html;
}
