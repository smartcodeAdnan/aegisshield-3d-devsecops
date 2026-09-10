export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type ViewId = 'security-hub' | 'code-scanner' | 'threat-analytics' | 'compliance-audit';

export type Language = 'javascript' | 'python' | 'sql' | 'go';

export interface Vulnerability {
  id: string;
  title: string;
  category: string;
  severity: Severity;
  cwe: string;
  owasp: string;
  description: string;
  impact: string;
  recommendation: string;
  file: string;
  line: number;
  status: 'open' | 'remediated' | 'ignored';
  detectedAt: string;
  vulnerableCode: string;
  secureCode: string;
}

export interface ThreatEvent {
  id: string;
  type: string;
  source: string;
  target: string;
  severity: Severity;
  timestamp: string;
  blocked: boolean;
}

export interface ComplianceItem {
  id: string;
  standard: string;
  control: string;
  description: string;
  status: 'compliant' | 'warning' | 'non-compliant';
  category: string;
}

export interface ScanPreset {
  id: string;
  label: string;
  language: Language;
  code: string;
}

export interface CodeFinding {
  line: number;
  severity: Severity;
  rule: string;
  message: string;
  snippet: string;
  fix: string;
}
