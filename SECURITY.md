# Security Architecture & Policies — CampusLoop Opportunities

CampusLoop Opportunities (`https://opportunities.campusloop.space/`) enforces strict security boundaries designed for student safety, automated AI ingestion integrity, and zero-trust Cloudflare Workers deployment.

---

## 1. Threat Model & Boundaries

| Component | Trust Level | Security Controls |
| :--- | :--- | :--- |
| **Public Browser Users** | Untrusted | Read-only access to published opportunities and SEO pages. No write capability. |
| **Authenticated Students** | Authenticated (CampusLoop OIDC) | Can view and toggle personal bookmarks (`/api/opportunities/[id]/save`), submit fraud reports (`/api/reports`). Cannot publish or modify listings. |
| **AI Publishing Agents (MCP / REST)** | Authenticated Machine-to-Machine | Requires static shared secret (`MCP_API_SECRET`) passed via `Authorization: Bearer <token>`. Rate-limited to 60 req/min. |
| **Database (Neon PostgreSQL)** | Trusted internal | Serverless HTTP queries via TLS (`sslmode=require`). No raw SQL execution from user inputs. |
| **External URLs (Application Links)** | Untrusted third-party | Strictly validated through SSRF and URI scheme filters (`isSafeExternalUrl`). |

---

## 2. Secrets Management & Environment Boundary

- **No Secrets in Code or History**: All production credentials (`DATABASE_URL`, `CAMPUSLOOP_CLIENT_ID`, `CAMPUSLOOP_CLIENT_SECRET`, `AUTH_SECRET`, `MCP_API_SECRET`) are strictly prohibited from Git tracking.
- **Gitignore Protection**: `.env`, `.env.*`, `.dev.vars`, `.dev.vars.*`, `.open-next`, and `.next` are ignored. `.env.example` contains empty placeholder values only.
- **Cloudflare Secrets**: Production secrets are injected into Cloudflare Workers runtime exclusively via encrypted Worker secrets (`wrangler secret put`).
- **Client Bundle Isolation**: None of the database connection strings, client secrets, auth keys, or MCP tokens are ever exposed to the client-side JavaScript bundle.

---

## 3. Machine-to-Machine (MCP) Authentication

The Model Context Protocol (MCP) Streamable HTTP endpoint at `/api/mcp` and REST management routes (`/api/v1/opportunities/*`) require a Bearer token:

1. **Constant-Time Verification**: All secret comparisons utilize `timingSafeEqual` in `lib/security/index.ts` to prevent timing attacks:
   ```typescript
   export function constantTimeCompare(a: string, b: string): boolean {
     const bufA = Buffer.from(a);
     const bufB = Buffer.from(b);
     if (bufA.length !== bufB.length) return false;
     return crypto.timingSafeEqual(bufA, bufB);
   }
   ```
2. **Missing Token Rejection**: Any missing or malformed token returns `401 Unauthorized` with `WWW-Authenticate: Bearer realm="CampusLoop Opportunities MCP"` and standard JSON-RPC 2.0 error code `-32001`.
3. **Dedicated In-Memory Rate Limiting**: All ingestion requests are constrained by a sliding window rate limiter (60 requests per minute per IP).

---

## 4. CampusLoop OIDC Security Architecture

Interactive student authentication adheres strictly to the official CampusLoop OIDC specification (`https://campusloop.space/developers/SKILL.md`):

1. **PKCE (Proof Key for Code Exchange)**: S256 code challenge generated dynamically using Web Crypto API. The `code_verifier` is held in an encrypted, `HttpOnly`, `SameSite=Lax`, `Secure` short-lived cookie (`cl_code_verifier`).
2. **Signed State Tokens**: The `state` parameter is an HMAC-SHA256 signed JWT containing a unique nonce, issued timestamp (max 10-minute validity), and an optional post-login redirect path.
3. **Open-Redirect Protection**: Return URLs are strictly verified via `sanitizeRedirectUrl`: only relative paths starting with `/` (and not `//`) are accepted. External URLs default to `/`.
4. **Asymmetric ES256 Token Validation**: ID tokens received from `https://campusloop.space/oauth/token` are verified against CampusLoop's public JWKS endpoint (`https://campusloop.space/.well-known/jwks.json`) using `jose` with explicit `algorithms: ["ES256"]`, expected `issuer: "https://campusloop.space"`, and verified `audience`.
5. **Session Cookies**: Logged-in session tokens are stored in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie (`cl_session`) with 7-day expiration.

---

## 5. SSRF & Ingestion URL Safety

To protect against Server-Side Request Forgery and malicious link injection, every incoming URL (`external_url`, `source_url`, `logo_url`) is sanitized with `isSafeExternalUrl` (`lib/security/index.ts`):

- **Allowed Protocols**: Only `https:` and `http:` are accepted. Schemes like `javascript:`, `data:`, `file:`, `blob:`, and `vbscript:` are unconditionally rejected.
- **Loopback & Localhost Rejection**: Hostnames matching `localhost`, `127.0.0.1`, `0.0.0.0`, `::1`, or `.local` are blocked.
- **Private RFC 1918 Address Prevention**: IPv4 ranges `10.0.0.0/8`, `172.16.0.0/12`, and `192.168.0.0/16` are rejected.
- **Cloud Metadata Rejection**: AWS/GCP/Azure link-local metadata endpoints (`169.254.169.254` and `fe80::/10`) are rejected.
- **Domain Whitelisting & Normalization**: Tracking query params (`utm_*`, `ref`, `fbclid`) are stripped, domains are lowercased, and default ports are removed.

---

## 6. XSS & Content Sanitization

- All text fields (`title`, `organization`, `description`, `eligibility`, `stipend`) are rendered as plain text within React JSX, benefiting from automatic HTML entity escaping.
- Outbound opportunity application links use `target="_blank" rel="noopener noreferrer"` to prevent tab-nabbing.
- Student fraud reports are bounded to 2,000 characters and rate-limited to 5 submissions per hour per user/IP.

---

## 7. Vulnerability Disclosure & Rotation Runbook

If any credential is leaked or compromised:
1. **Rotate Neon Database Password**: Generate a new password in the Neon Console, then update Cloudflare via `wrangler secret put DATABASE_URL`.
2. **Rotate CampusLoop OAuth Secret**: Generate a new client secret in CampusLoop Developer Settings, then update `CAMPUSLOOP_CLIENT_SECRET`.
3. **Rotate MCP Secret**: Generate a new high-entropy string (`openssl rand -hex 32`) and update `MCP_API_SECRET`.
4. **Invalidate User Sessions**: Change `AUTH_SECRET` to instantly invalidate all active JWT user sessions.
