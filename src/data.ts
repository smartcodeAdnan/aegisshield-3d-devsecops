import type { Vulnerability, ThreatEvent, ComplianceItem, ScanPreset } from './types';

export const vulnerabilities: Vulnerability[] = [
  {
    id: 'VULN-001',
    title: 'SQL Injection via String Concatenation',
    category: 'Injection',
    severity: 'critical',
    cwe: 'CWE-89',
    owasp: 'A03:2021 — Injection',
    description:
      'User-supplied input is concatenated directly into a SQL query string, allowing an attacker to manipulate the query structure and execute arbitrary SQL commands against the database.',
    impact:
      'Full database compromise including data exfiltration, modification, or deletion. Attackers can bypass authentication, access sensitive records, and potentially achieve remote code execution via stored procedures.',
    recommendation:
      'Use parameterized queries or prepared statements with bound parameters. Never concatenate user input into SQL strings. Apply input validation and least-privilege database permissions.',
    file: 'src/api/users.ts',
    line: 14,
    status: 'open',
    detectedAt: '2026-09-10T08:23:00Z',
    vulnerableCode: `app.get('/users', (req, res) => {
  const name = req.query.name;
  const query = "SELECT * FROM users WHERE name = '" + name + "'";
  db.execute(query, (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});`,
    secureCode: `app.get('/users', (req, res) => {
  const name = req.query.name;
  const query = "SELECT * FROM users WHERE name = ?";
  db.execute(query, [name], (err, rows) => {
    if (err) return res.status(500).send('Internal error');
    res.json(rows);
  });
});`,
  },
  {
    id: 'VULN-002',
    title: 'Hardcoded AWS Secret Access Key',
    category: 'Sensitive Data Exposure',
    severity: 'critical',
    cwe: 'CWE-798',
    owasp: 'A02:2021 — Cryptographic Failures',
    description:
      'An AWS secret access key is hardcoded directly in source code, exposing cloud infrastructure credentials to anyone with repository access.',
    impact:
      'Complete cloud infrastructure compromise. Attackers can spin up resources, access all S3 buckets, databases, and services. Financial abuse and data theft are almost certain.',
    recommendation:
      'Store secrets in environment variables or a secrets manager (AWS Secrets Manager, HashiCorp Vault). Never commit credentials to version control. Rotate the exposed key immediately.',
    file: 'config/cloud.ts',
    line: 8,
    status: 'open',
    detectedAt: '2026-09-10T07:45:00Z',
    vulnerableCode: `const awsConfig = {
  region: 'us-east-1',
  accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
  secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  apiVersion: '2012-10-17',
};

const s3 = new AWS.S3(awsConfig);`,
    secureCode: `import { SecretsManager } from 'aws-sdk';

const getSecrets = async () => {
  const sm = new SecretsManager({ region: process.env.AWS_REGION });
  const data = await sm.getSecretValue({
    SecretId: process.env.SECRET_ID
  }).promise();
  return JSON.parse(data.SecretString);
};

const secrets = await getSecrets();
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: secrets.accessKeyId,
  secretAccessKey: secrets.secretAccessKey,
});`,
  },
  {
    id: 'VULN-003',
    title: 'Cross-Site Scripting (XSS) via dangerouslySetInnerHTML',
    category: 'XSS',
    severity: 'high',
    cwe: 'CWE-79',
    owasp: 'A03:2021 — Injection',
    description:
      'Unsanitized user input is rendered directly into the DOM using dangerouslySetInnerHTML, allowing attackers to inject and execute malicious scripts in users\' browsers.',
    impact:
      'Session hijacking, credential theft via fake login forms, defacement, malware distribution, and cookie stealing. Stored XSS can affect every user who views the compromised page.',
    recommendation:
      'Avoid dangerouslySetInnerHTML entirely. If HTML rendering is required, sanitize input with DOMPurify before rendering. Use React\'s default text interpolation which auto-escapes content.',
    file: 'src/components/Comment.tsx',
    line: 22,
    status: 'open',
    detectedAt: '2026-09-10T09:01:00Z',
    vulnerableCode: `function Comment({ content }) {
  return (
    <div className="comment">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}`,
    secureCode: `import DOMPurify from 'dompurify';

function Comment({ content }) {
  const sanitized = DOMPurify.sanitize(content);
  return (
    <div className="comment">
      <div dangerouslySetInnerHTML={{ __html: sanitized }} />
    </div>
  );
}`,
  },
  {
    id: 'VULN-004',
    title: 'Insecure Deserialization in Python pickle',
    category: 'Deserialization',
    severity: 'high',
    cwe: 'CWE-502',
    owasp: 'A08:2021 — Software and Data Integrity Failures',
    description:
      'The application deserializes untrusted data using Python\'s pickle module, which can execute arbitrary code during the deserialization process.',
    impact:
      'Remote code execution with the privileges of the application process. Attackers can gain full server control, pivot to internal networks, and exfiltrate or encrypt data.',
    recommendation:
      'Use JSON or other safe, data-only serialization formats. If pickle is unavoidable, implement a custom Unpickler with strict class restrictions. Never unpickle data from untrusted sources.',
    file: 'app/handlers.py',
    line: 31,
    status: 'open',
    detectedAt: '2026-09-10T06:12:00Z',
    vulnerableCode: `import pickle
from flask import request

@app.route('/import', methods=['POST'])
def import_data():
    data = request.data
    obj = pickle.loads(data)
    return jsonify(obj.serialize())`,
    secureCode: `import json
from flask import request

@app.route('/import', methods=['POST'])
def import_data():
    data = request.data
    try:
        obj = json.loads(data)
        return jsonify(obj)
    except (json.JSONDecodeError, ValueError):
        return jsonify({'error': 'Invalid data'}), 400`,
  },
  {
    id: 'VULN-005',
    title: 'Buffer Overflow in Go CGO Call',
    category: 'Memory Safety',
    severity: 'high',
    cwe: 'CWE-120',
    owasp: 'A06:2021 — Vulnerable and Outdated Components',
    description:
      'A fixed-size buffer is used to copy user input without bounds checking, allowing a buffer overflow that can corrupt adjacent memory and overwrite control structures.',
    impact:
      'Denial of service through crash, or remote code execution if an attacker can control the overwritten memory. Can lead to full system compromise.',
    recommendation:
      'Use Go slices with length checks instead of fixed C buffers. If CGO is necessary, use C.memcpy with explicit size validation. Prefer pure Go implementations that are memory-safe.',
    file: 'cmd/server/main.go',
    line: 47,
    status: 'remediated',
    detectedAt: '2026-09-09T14:30:00Z',
    vulnerableCode: `/*
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
}`,
    secureCode: `func HandleInput(input string) error {
    if len(input) > 255 {
        return fmt.Errorf("input too long: %d > 255", len(input))
    }
    buf := make([]byte, 256)
    copy(buf, input)
    processBuffer(buf)
    return nil
}`,
  },
  {
    id: 'VULN-006',
    title: 'Missing Rate Limiting on Authentication Endpoint',
    category: 'Access Control',
    severity: 'medium',
    cwe: 'CWE-307',
    owasp: 'A07:2021 — Identification and Authentication Failures',
    description:
      'The login endpoint does not implement rate limiting or account lockout, allowing unlimited brute-force and credential stuffing attempts.',
    impact:
      'Successful brute-force attacks can compromise user accounts. Automated credential stuffing can test thousands of password combinations per second.',
    recommendation:
      'Implement rate limiting using a middleware like express-rate-limit. Add exponential backoff, CAPTCHA after failed attempts, and account lockout after N failures.',
    file: 'src/routes/auth.ts',
    line: 5,
    status: 'open',
    detectedAt: '2026-09-10T10:15:00Z',
    vulnerableCode: `app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await user.comparePassword(password)) {
    res.json({ token: generateToken(user) });
  } else {
    res.status(401).send('Invalid credentials');
  }
});`,
    secureCode: `import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many attempts. Try again later.',
  standardHeaders: true,
});

app.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await user.comparePassword(password)) {
    res.json({ token: generateToken(user) });
  } else {
    res.status(401).send('Invalid credentials');
  }
});`,
  },
  {
    id: 'VULN-007',
    title: 'Weak Password Hashing with MD5',
    category: 'Cryptographic Failures',
    severity: 'high',
    cwe: 'CWE-327',
    owasp: 'A02:2021 — Cryptographic Failures',
    description:
      'User passwords are hashed using MD5, which is cryptographically broken and vulnerable to collision and preimage attacks. Rainbow tables can reverse MD5 hashes in seconds.',
    impact:
      'Mass credential exposure if the database is compromised. Attackers can reverse password hashes, leading to account takeover across multiple services if users reuse passwords.',
    recommendation:
      'Use bcrypt, scrypt, or Argon2 for password hashing. These algorithms use adaptive work factors and salts to resist brute-force and rainbow table attacks.',
    file: 'src/models/user.ts',
    line: 18,
    status: 'open',
    detectedAt: '2026-09-10T05:50:00Z',
    vulnerableCode: `import crypto from 'crypto';

userSchema.methods.hashPassword = function(password) {
  return crypto.createHash('md5').update(password).digest('hex');
};

userSchema.methods.comparePassword = function(password) {
  return this.hashPassword(password) === this.password;
};`,
    secureCode: `import bcrypt from 'bcryptjs';

userSchema.methods.hashPassword = async function(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};`,
  },
  {
    id: 'VULN-008',
    title: 'Insecure Direct Object Reference (IDOR)',
    category: 'Access Control',
    severity: 'medium',
    cwe: 'CWE-639',
    owasp: 'A01:2021 — Broken Access Control',
    description:
      'The API endpoint returns user data based solely on a URL parameter without verifying the requesting user is authorized to access that resource.',
    impact:
      'Unauthorized access to other users\' private data, including personal information, financial records, and account settings. Horizontal privilege escalation.',
    recommendation:
      'Implement server-side authorization checks. Verify the requesting user owns or has explicit permission to access the requested resource. Use indirect references or UUIDs.',
    file: 'src/api/profile.ts',
    line: 9,
    status: 'open',
    detectedAt: '2026-09-10T11:20:00Z',
    vulnerableCode: `app.get('/profile/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send('Not found');
  res.json(user);
});`,
    secureCode: `app.get('/profile/:id', authMiddleware, async (req, res) => {
  if (req.user.id !== req.params.id && !req.user.isAdmin) {
    return res.status(403).send('Forbidden');
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send('Not found');
  res.json(user);
});`,
  },
];

export const threatEvents: ThreatEvent[] = [
  { id: 'THREAT-001', type: 'SQL Injection Attempt', source: '185.220.101.34', target: '/api/users', severity: 'critical', timestamp: '2026-09-10T11:45:00Z', blocked: true },
  { id: 'THREAT-002', type: 'Brute Force Login', source: '45.133.1.92', target: '/auth/login', severity: 'high', timestamp: '2026-09-10T11:30:00Z', blocked: true },
  { id: 'THREAT-003', type: 'XSS Payload Injection', source: '91.134.223.18', target: '/comments', severity: 'high', timestamp: '2026-09-10T11:15:00Z', blocked: true },
  { id: 'THREAT-004', type: 'Path Traversal', source: '193.32.162.44', target: '/files/../etc', severity: 'high', timestamp: '2026-09-10T10:58:00Z', blocked: true },
  { id: 'THREAT-005', type: 'DDoS Volumetric', source: 'Multiple (botnet)', target: '/api/v1/*', severity: 'critical', timestamp: '2026-09-10T10:30:00Z', blocked: true },
  { id: 'THREAT-006', type: 'CSRF Token Bypass', source: '212.193.44.7', target: '/settings', severity: 'medium', timestamp: '2026-09-10T09:45:00Z', blocked: true },
  { id: 'THREAT-007', type: 'API Key Enumeration', source: '88.218.55.12', target: '/api/v1/keys', severity: 'medium', timestamp: '2026-09-10T09:12:00Z', blocked: true },
  { id: 'THREAT-008', type: 'SSRF Attempt', source: '146.70.119.33', target: '/fetch?url=', severity: 'high', timestamp: '2026-09-10T08:50:00Z', blocked: true },
  { id: 'THREAT-009', type: 'Directory Listing', source: '51.158.144.221', target: '/.env', severity: 'low', timestamp: '2026-09-10T08:15:00Z', blocked: true },
  { id: 'THREAT-010', type: 'JWT Token Tampering', source: '178.128.94.221', target: '/auth/verify', severity: 'high', timestamp: '2026-09-10T07:40:00Z', blocked: true },
];

export const complianceItems: ComplianceItem[] = [
  { id: 'C-001', standard: 'ISO 27001', control: 'A.5.1', description: 'Information security policies documented and approved', status: 'compliant', category: 'Governance' },
  { id: 'C-002', standard: 'ISO 27001', control: 'A.8.2', description: 'Privileged access rights are restricted and logged', status: 'warning', category: 'Access Control' },
  { id: 'C-003', standard: 'ISO 27001', control: 'A.8.24', description: 'Cryptographic key management and rotation', status: 'non-compliant', category: 'Cryptography' },
  { id: 'C-004', standard: 'ISO 27001', control: 'A.8.28', description: 'Secure coding practices enforced in CI/CD', status: 'compliant', category: 'Development' },
  { id: 'C-005', standard: 'OWASP Top 10', control: 'A01:2021', description: 'Broken Access Control — authorization on all endpoints', status: 'warning', category: 'Access Control' },
  { id: 'C-006', standard: 'OWASP Top 10', control: 'A02:2021', description: 'Cryptographic Failures — strong hashing and TLS', status: 'non-compliant', category: 'Cryptography' },
  { id: 'C-007', standard: 'OWASP Top 10', control: 'A03:2021', description: 'Injection — parameterized queries and input validation', status: 'warning', category: 'Input Validation' },
  { id: 'C-008', standard: 'OWASP Top 10', control: 'A04:2021', description: 'Insecure Design — threat modeling for new features', status: 'compliant', category: 'Design' },
  { id: 'C-009', standard: 'OWASP Top 10', control: 'A05:2021', description: 'Security Misconfiguration — hardened defaults', status: 'compliant', category: 'Configuration' },
  { id: 'C-010', standard: 'OWASP Top 10', control: 'A07:2021', description: 'Identification & Auth Failures — MFA and rate limiting', status: 'warning', category: 'Authentication' },
  { id: 'C-011', standard: 'OWASP Top 10', control: 'A08:2021', description: 'Software & Data Integrity — dependency scanning', status: 'compliant', category: 'Supply Chain' },
  { id: 'C-012', standard: 'OWASP Top 10', control: 'A09:2021', description: 'Security Logging & Monitoring — audit trail coverage', status: 'compliant', category: 'Monitoring' },
];

export const scanPresets: ScanPreset[] = [
  {
    id: 'sqli',
    label: 'SQL Injection',
    language: 'javascript',
    code: `app.get('/search', (req, res) => {
  const q = req.query.q;
  const sql = "SELECT * FROM products WHERE name LIKE '%" + q + "%'";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});`,
  },
  {
    id: 'apikey',
    label: 'Exposed API Key',
    language: 'python',
    code: `import requests

STRIPE_SECRET = "sk_live_51H8xYk2eZvKYloBBcJ7Mm3N9Qw2pXz"

def create_payment(amount, currency="usd"):
    headers = {"Authorization": f"Bearer {STRIPE_SECRET}"}
    resp = requests.post(
        "https://api.stripe.com/v1/payment_intents",
        headers=headers,
        data={"amount": amount, "currency": currency}
    )
    return resp.json()`,
  },
  {
    id: 'buffer',
    label: 'Buffer Overflow',
    language: 'go',
    code: `package main

/*
#cgo CFLAGS: -O2
#include <string.h>
char buf[256];
void copy_input(const char *input) {
    strcpy(buf, input);
}
*/
import "C"
import "unsafe"

func ProcessInput(input string) {
    cstr := C.CString(input)
    C.copy_input(cstr)
    C.free(unsafe.Pointer(cstr))
}`,
  },
  {
    id: 'xss',
    label: 'XSS via innerHTML',
    language: 'javascript',
    code: `function renderComment(userInput) {
  const container = document.getElementById('comments');
  container.innerHTML += '<div class="comment">' + userInput + '</div>';
}

function loadComments() {
  fetch('/api/comments')
    .then(r => r.json())
    .then(comments => {
      comments.forEach(c => renderComment(c.body));
    });
}`,
  },
];
