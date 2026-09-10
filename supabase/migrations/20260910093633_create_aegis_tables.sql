/*
# Create AegisShield vulnerability and threat tracking tables

1. New Tables
- `vulnerabilities`: Stores detected code vulnerabilities with full metadata including
  severity, CWE/OWASP references, vulnerable/secure code snippets, and remediation status.
  Columns: id (text PK), title, category, severity, cwe, owasp, description, impact,
  recommendation, file, line, status, detected_at, vulnerable_code, secure_code, created_at.
- `threat_events`: Stores security threat events (blocked attacks, intrusion attempts).
  Columns: id (text PK), type, source, target, severity, timestamp, blocked, created_at.

2. Security
- Enable RLS on both tables.
- This is a single-tenant app with no sign-in screen, so allow anon + authenticated
  full CRUD on both tables (data is intentionally shared/public).

3. Notes
- Uses text primary keys (e.g. 'VULN-001') to match the existing app data model.
- Seed data is inserted matching the existing hardcoded mock data so the app
  has data on first load.
*/

CREATE TABLE IF NOT EXISTS vulnerabilities (
  id text PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'medium',
  cwe text NOT NULL DEFAULT '',
  owasp text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  impact text NOT NULL DEFAULT '',
  recommendation text NOT NULL DEFAULT '',
  file text NOT NULL DEFAULT '',
  line integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open',
  detected_at timestamptz NOT NULL DEFAULT now(),
  vulnerable_code text NOT NULL DEFAULT '',
  secure_code text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vulnerabilities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_vulnerabilities" ON vulnerabilities;
CREATE POLICY "anon_select_vulnerabilities" ON vulnerabilities FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_vulnerabilities" ON vulnerabilities;
CREATE POLICY "anon_insert_vulnerabilities" ON vulnerabilities FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_vulnerabilities" ON vulnerabilities;
CREATE POLICY "anon_update_vulnerabilities" ON vulnerabilities FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_vulnerabilities" ON vulnerabilities;
CREATE POLICY "anon_delete_vulnerabilities" ON vulnerabilities FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_vulnerabilities_status ON vulnerabilities (status);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities (severity);

CREATE TABLE IF NOT EXISTS threat_events (
  id text PRIMARY KEY,
  type text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT '',
  target text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'medium',
  timestamp timestamptz NOT NULL DEFAULT now(),
  blocked boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE threat_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_threats" ON threat_events;
CREATE POLICY "anon_select_threats" ON threat_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_threats" ON threat_events;
CREATE POLICY "anon_insert_threats" ON threat_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_threats" ON threat_events;
CREATE POLICY "anon_update_threats" ON threat_events FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_threats" ON threat_events;
CREATE POLICY "anon_delete_threats" ON threat_events FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_threat_events_severity ON threat_events (severity);
CREATE INDEX IF NOT EXISTS idx_threat_events_timestamp ON threat_events (timestamp);

-- Seed vulnerability data
INSERT INTO vulnerabilities (id, title, category, severity, cwe, owasp, description, impact, recommendation, file, line, status, detected_at, vulnerable_code, secure_code) VALUES
('VULN-001', 'SQL Injection via String Concatenation', 'Injection', 'critical', 'CWE-89', 'A03:2021 — Injection', 'User-supplied input is concatenated directly into a SQL query string, allowing an attacker to manipulate the query structure and execute arbitrary SQL commands against the database.', 'Full database compromise including data exfiltration, modification, or deletion. Attackers can bypass authentication, access sensitive records, and potentially achieve remote code execution via stored procedures.', 'Use parameterized queries or prepared statements with bound parameters. Never concatenate user input into SQL strings. Apply input validation and least-privilege database permissions.', 'src/api/users.ts', 14, 'open', '2026-09-10T08:23:00Z', 'app.get(''/users'', (req, res) => {
  const name = req.query.name;
  const query = "SELECT * FROM users WHERE name = ''" + name + "''";
  db.execute(query, (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});', 'app.get(''/users'', (req, res) => {
  const name = req.query.name;
  const query = "SELECT * FROM users WHERE name = ?";
  db.execute(query, [name], (err, rows) => {
    if (err) return res.status(500).send(''Internal error'');
    res.json(rows);
  });
});') ON CONFLICT (id) DO NOTHING;

INSERT INTO vulnerabilities (id, title, category, severity, cwe, owasp, description, impact, recommendation, file, line, status, detected_at, vulnerable_code, secure_code) VALUES
('VULN-002', 'Hardcoded AWS Secret Access Key', 'Sensitive Data Exposure', 'critical', 'CWE-798', 'A02:2021 — Cryptographic Failures', 'An AWS secret access key is hardcoded directly in source code, exposing cloud infrastructure credentials to anyone with repository access.', 'Complete cloud infrastructure compromise. Attackers can spin up resources, access all S3 buckets, databases, and services. Financial abuse and data theft are almost certain.', 'Store secrets in environment variables or a secrets manager (AWS Secrets Manager, HashiCorp Vault). Never commit credentials to version control. Rotate the exposed key immediately.', 'config/cloud.ts', 8, 'open', '2026-09-10T07:45:00Z', 'const awsConfig = {
  region: ''us-east-1'',
  accessKeyId: ''AKIAIOSFODNN7EXAMPLE'',
  secretAccessKey: ''wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'',
  apiVersion: ''2012-10-17'',
};', 'import { SecretsManager } from ''aws-sdk'';

const getSecrets = async () => {
  const sm = new SecretsManager({ region: process.env.AWS_REGION });
  const data = await sm.getSecretValue({
    SecretId: process.env.SECRET_ID
  }).promise();
  return JSON.parse(data.SecretString);
};') ON CONFLICT (id) DO NOTHING;

INSERT INTO vulnerabilities (id, title, category, severity, cwe, owasp, description, impact, recommendation, file, line, status, detected_at, vulnerable_code, secure_code) VALUES
('VULN-003', 'Cross-Site Scripting (XSS) via dangerouslySetInnerHTML', 'XSS', 'high', 'CWE-79', 'A03:2021 — Injection', 'Unsanitized user input is rendered directly into the DOM using dangerouslySetInnerHTML, allowing attackers to inject and execute malicious scripts in users'' browsers.', 'Session hijacking, credential theft via fake login forms, defacement, malware distribution, and cookie stealing. Stored XSS can affect every user who views the compromised page.', 'Avoid dangerouslySetInnerHTML entirely. If HTML rendering is required, sanitize input with DOMPurify before rendering. Use React''s default text interpolation which auto-escapes content.', 'src/components/Comment.tsx', 22, 'open', '2026-09-10T09:01:00Z', 'function Comment({ content }) {
  return (
    <div className="comment">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}', 'import DOMPurify from ''dompurify'';

function Comment({ content }) {
  const sanitized = DOMPurify.sanitize(content);
  return (
    <div className="comment">
      <div dangerouslySetInnerHTML={{ __html: sanitized }} />
    </div>
  );
}') ON CONFLICT (id) DO NOTHING;

INSERT INTO vulnerabilities (id, title, category, severity, cwe, owasp, description, impact, recommendation, file, line, status, detected_at, vulnerable_code, secure_code) VALUES
('VULN-004', 'Insecure Deserialization in Python pickle', 'Deserialization', 'high', 'CWE-502', 'A08:2021 — Software and Data Integrity Failures', 'The application deserializes untrusted data using Python''s pickle module, which can execute arbitrary code during the deserialization process.', 'Remote code execution with the privileges of the application process. Attackers can gain full server control, pivot to internal networks, and exfiltrate or encrypt data.', 'Use JSON or other safe, data-only serialization formats. If pickle is unavoidable, implement a custom Unpickler with strict class restrictions. Never unpickle data from untrusted sources.', 'app/handlers.py', 31, 'open', '2026-09-10T06:12:00Z', 'import pickle
from flask import request

@app.route(''/import'', methods=[''POST''])
def import_data():
    data = request.data
    obj = pickle.loads(data)
    return jsonify(obj.serialize())', 'import json
from flask import request

@app.route(''/import'', methods=[''POST''])
def import_data():
    data = request.data
    try:
        obj = json.loads(data)
        return jsonify(obj)
    except (json.JSONDecodeError, ValueError):
        return jsonify({''error'': ''Invalid data''}), 400') ON CONFLICT (id) DO NOTHING;

INSERT INTO vulnerabilities (id, title, category, severity, cwe, owasp, description, impact, recommendation, file, line, status, detected_at, vulnerable_code, secure_code) VALUES
('VULN-005', 'Buffer Overflow in Go CGO Call', 'Memory Safety', 'high', 'CWE-120', 'A06:2021 — Vulnerable and Outdated Components', 'A fixed-size buffer is used to copy user input without bounds checking, allowing a buffer overflow that can corrupt adjacent memory and overwrite control structures.', 'Denial of service through crash, or remote code execution if an attacker can control the overwritten memory. Can lead to full system compromise.', 'Use Go slices with length checks instead of fixed C buffers. If CGO is necessary, use C.memcpy with explicit size validation. Prefer pure Go implementations that are memory-safe.', 'cmd/server/main.go', 47, 'remediated', '2026-09-09T14:30:00Z', '/*
#include <string.h>
char buf[256];
void copy_input(const char *input) {
    strcpy(buf, input);
}
*/
import "C"

func HandleInput(input string) {
    cstr := C.CString(input)
    C.copy_input(cstr)
    C.free(unsafe.Pointer(cstr))
}', 'func HandleInput(input string) error {
    if len(input) > 255 {
        return fmt.Errorf("input too long: %d > 255", len(input))
    }
    buf := make([]byte, 256)
    copy(buf, input)
    processBuffer(buf)
    return nil
}') ON CONFLICT (id) DO NOTHING;

INSERT INTO vulnerabilities (id, title, category, severity, cwe, owasp, description, impact, recommendation, file, line, status, detected_at, vulnerable_code, secure_code) VALUES
('VULN-006', 'Missing Rate Limiting on Authentication Endpoint', 'Access Control', 'medium', 'CWE-307', 'A07:2021 — Identification and Authentication Failures', 'The login endpoint does not implement rate limiting or account lockout, allowing unlimited brute-force and credential stuffing attempts.', 'Successful brute-force attacks can compromise user accounts. Automated credential stuffing can test thousands of password combinations per second.', 'Implement rate limiting using a middleware like express-rate-limit. Add exponential backoff, CAPTCHA after failed attempts, and account lockout after N failures.', 'src/routes/auth.ts', 5, 'open', '2026-09-10T10:15:00Z', 'app.post(''/login'', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await user.comparePassword(password)) {
    res.json({ token: generateToken(user) });
  } else {
    res.status(401).send(''Invalid credentials'');
  }
});', 'import rateLimit from ''express-rate-limit'';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: ''Too many attempts. Try again later.'',
  standardHeaders: true,
});

app.post(''/login'', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await user.comparePassword(password)) {
    res.json({ token: generateToken(user) });
  } else {
    res.status(401).send(''Invalid credentials'');
  }
});') ON CONFLICT (id) DO NOTHING;

INSERT INTO vulnerabilities (id, title, category, severity, cwe, owasp, description, impact, recommendation, file, line, status, detected_at, vulnerable_code, secure_code) VALUES
('VULN-007', 'Weak Password Hashing with MD5', 'Cryptographic Failures', 'high', 'CWE-327', 'A02:2021 — Cryptographic Failures', 'User passwords are hashed using MD5, which is cryptographically broken and vulnerable to collision and preimage attacks. Rainbow tables can reverse MD5 hashes in seconds.', 'Mass credential exposure if the database is compromised. Attackers can reverse password hashes, leading to account takeover across multiple services if users reuse passwords.', 'Use bcrypt, scrypt, or Argon2 for password hashing. These algorithms use adaptive work factors and salts to resist brute-force and rainbow table attacks.', 'src/models/user.ts', 18, 'open', '2026-09-10T05:50:00Z', 'import crypto from ''crypto'';

userSchema.methods.hashPassword = function(password) {
  return crypto.createHash(''md5'').update(password).digest(''hex'');
};', 'import bcrypt from ''bcryptjs'';

userSchema.methods.hashPassword = async function(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};') ON CONFLICT (id) DO NOTHING;

INSERT INTO vulnerabilities (id, title, category, severity, cwe, owasp, description, impact, recommendation, file, line, status, detected_at, vulnerable_code, secure_code) VALUES
('VULN-008', 'Insecure Direct Object Reference (IDOR)', 'Access Control', 'medium', 'CWE-639', 'A01:2021 — Broken Access Control', 'The API endpoint returns user data based solely on a URL parameter without verifying the requesting user is authorized to access that resource.', 'Unauthorized access to other users'' private data, including personal information, financial records, and account settings. Horizontal privilege escalation.', 'Implement server-side authorization checks. Verify the requesting user owns or has explicit permission to access the requested resource. Use indirect references or UUIDs.', 'src/api/profile.ts', 9, 'open', '2026-09-10T11:20:00Z', 'app.get(''/profile/:id'', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send(''Not found'');
  res.json(user);
});', 'app.get(''/profile/:id'', authMiddleware, async (req, res) => {
  if (req.user.id !== req.params.id && !req.user.isAdmin) {
    return res.status(403).send(''Forbidden'');
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send(''Not found'');
  res.json(user);
});') ON CONFLICT (id) DO NOTHING;

-- Seed threat events
INSERT INTO threat_events (id, type, source, target, severity, timestamp, blocked) VALUES
('THREAT-001', 'SQL Injection Attempt', '185.220.101.34', '/api/users', 'critical', '2026-09-10T11:45:00Z', true),
('THREAT-002', 'Brute Force Login', '45.133.1.92', '/auth/login', 'high', '2026-09-10T11:30:00Z', true),
('THREAT-003', 'XSS Payload Injection', '91.134.223.18', '/comments', 'high', '2026-09-10T11:15:00Z', true),
('THREAT-004', 'Path Traversal', '193.32.162.44', '/files/../etc', 'high', '2026-09-10T10:58:00Z', true),
('THREAT-005', 'DDoS Volumetric', 'Multiple (botnet)', '/api/v1/*', 'critical', '2026-09-10T10:30:00Z', true),
('THREAT-006', 'CSRF Token Bypass', '212.193.44.7', '/settings', 'medium', '2026-09-10T09:45:00Z', true),
('THREAT-007', 'API Key Enumeration', '88.218.55.12', '/api/v1/keys', 'medium', '2026-09-10T09:12:00Z', true),
('THREAT-008', 'SSRF Attempt', '146.70.119.33', '/fetch?url=', 'high', '2026-09-10T08:50:00Z', true),
('THREAT-009', 'Directory Listing', '51.158.144.221', '/.env', 'low', '2026-09-10T08:15:00Z', true),
('THREAT-010', 'JWT Token Tampering', '178.128.94.221', '/auth/verify', 'high', '2026-09-10T07:40:00Z', true)
ON CONFLICT (id) DO NOTHING;
