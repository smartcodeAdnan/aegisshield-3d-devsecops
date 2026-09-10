import { createClient } from '@supabase/supabase-js';
import type { Vulnerability, ThreatEvent } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface VulnerabilityRow {
  id: string;
  title: string;
  category: string;
  severity: string;
  cwe: string;
  owasp: string;
  description: string;
  impact: string;
  recommendation: string;
  file: string;
  line: number;
  status: string;
  detected_at: string;
  vulnerable_code: string;
  secure_code: string;
}

interface ThreatEventRow {
  id: string;
  type: string;
  source: string;
  target: string;
  severity: string;
  timestamp: string;
  blocked: boolean;
}

function rowToVulnerability(row: VulnerabilityRow): Vulnerability {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    severity: row.severity as Vulnerability['severity'],
    cwe: row.cwe,
    owasp: row.owasp,
    description: row.description,
    impact: row.impact,
    recommendation: row.recommendation,
    file: row.file,
    line: row.line,
    status: row.status as Vulnerability['status'],
    detectedAt: row.detected_at,
    vulnerableCode: row.vulnerable_code,
    secureCode: row.secure_code,
  };
}

function rowToThreatEvent(row: ThreatEventRow): ThreatEvent {
  return {
    id: row.id,
    type: row.type,
    source: row.source,
    target: row.target,
    severity: row.severity as ThreatEvent['severity'],
    timestamp: row.timestamp,
    blocked: row.blocked,
  };
}

export async function fetchVulnerabilities(): Promise<Vulnerability[]> {
  const { data, error } = await supabase
    .from('vulnerabilities')
    .select('*')
    .order('detected_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch vulnerabilities:', error.message);
    return [];
  }

  return (data as VulnerabilityRow[]).map(rowToVulnerability);
}

export async function fetchThreatEvents(): Promise<ThreatEvent[]> {
  const { data, error } = await supabase
    .from('threat_events')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Failed to fetch threat events:', error.message);
    return [];
  }

  return (data as ThreatEventRow[]).map(rowToThreatEvent);
}

export async function updateVulnerabilityStatus(
  id: string,
  status: Vulnerability['status']
): Promise<boolean> {
  const { error } = await supabase
    .from('vulnerabilities')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Failed to update vulnerability status:', error.message);
    return false;
  }

  return true;
}

export function subscribeToVulnerabilities(
  callback: (vulns: Vulnerability[]) => void
) {
  const channel = supabase
    .channel('vulnerabilities-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'vulnerabilities' }, async () => {
      const vulns = await fetchVulnerabilities();
      callback(vulns);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToThreatEvents(
  callback: (threats: ThreatEvent[]) => void
) {
  const channel = supabase
    .channel('threat-events-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'threat_events' }, async () => {
      const threats = await fetchThreatEvents();
      callback(threats);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
