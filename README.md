# CampusLoop Opportunities 🎓🚀

> **Official Discovery & Curation Engine for Internships, Hackathons, Scholarships, Fellowships, and Student Programs.**  
> Part of the **CampusLoop Labs** product family (`https://campusloop.space`).

- **Production URL**: [https://opportunities.campusloop.space](https://opportunities.campusloop.space)
- **Parent Platform**: [https://campusloop.space](https://campusloop.space)
- **OIDC Callback**: `https://opportunities.campusloop.space/auth/callback/campusloop`
- **MCP Server Endpoint**: `https://opportunities.campusloop.space/api/mcp`
- **Health Check**: `https://opportunities.campusloop.space/api/health`

---

## 1. Product Overview

CampusLoop Opportunities is a high-speed, SEO-first platform engineered specifically for Indian and global university students. It solves the fragmentation problem in student discovery by curating verified opportunities across 7 distinct verticals:

1. **Internships**: Summer, winter, off-campus, and industry roles.
2. **Hackathons**: National, global, and collegiate product sprints and hackathons.
3. **Scholarships**: Corporate, governmental, and merit-based tuition grants.
4. **Fellowships**: Open source (e.g. GSoC, LFX), policy, research, and leadership fellowships.
5. **Research Programs**: Undergraduate research internships and laboratory positions (e.g. SURGE, SRIP).
6. **Competitions**: Coding contests, ICPC regionals, data science and case challenges.
7. **Student Programs**: Campus ambassador programs, developer clubs (MLSA, GDG), and student packs.

All listings are strictly verified, include direct links to organizer portals, and feature native WhatsApp sharing for student groups and batch communities.

---

## 2. Architecture & Tech Stack

```mermaid
flowchart TD
    User["Student Browser"] -->|"HTTPS / CDN"| CF["Cloudflare Edge Anycast"]
    Agent["AI Agent / Crawler"] -->|"JSON-RPC 2.0 (Bearer Auth)"| MCP["/api/mcp (Streamable HTTP)"]
    
    subgraph Cloudflare["Cloudflare Workers Runtime (OpenNext)"]
        CF --> NextSSR["Next.js 16 App Router (SSR)"]
        MCP --> Tools["15 MCP Tool Handlers"]
        NextSSR --> Drizzle["Drizzle ORM Engine"]
        Tools --> Drizzle
        NextSSR --> OIDC["CampusLoop OIDC Auth (jose)"]
    end
    
    subgraph External["Cloud Infrastructure"]
        Drizzle -->|"HTTP Serverless Protocol (TLS)"| Neon[("Neon PostgreSQL")]
        OIDC -->|"ES256 JWKS & Token Exchange"| CampusLoop["CampusLoop Identity (campusloop.space)"]
    end
```

### Core Technologies
- **Framework**: Next.js 16.2 (App Router with Webpack runtime for Cloudflare compatibility).
- **Deployment Adapter**: `@opennextjs/cloudflare` + Cloudflare Workers.
- **Database & ORM**: Neon Serverless PostgreSQL with Drizzle ORM (`@neondatabase/serverless` HTTP driver).
- **Styling**: Tailwind CSS v4 with custom terracotta/cream design system (`DESIGN.md`).
- **Authentication**: CampusLoop OIDC (PKCE S256, signed state tokens, ES256 JWKS verification via `jose`).
- **AI Agent Protocol**: Model Context Protocol (MCP) Streamable HTTP transport (JSON-RPC 2.0).
- **Package Manager**: `pnpm` v12 (Node 20 LTS).

---

## 3. Model Context Protocol (MCP) & AI Agent Publishing

AI ingestion agents publish, deduplicate, and manage opportunities directly through the Streamable HTTP MCP server at `/api/mcp`.

### Authentication
Machine-to-machine requests require a shared secret passed as a Bearer token:
```http
POST /api/mcp HTTP/1.1
Host: opportunities.campusloop.space
Authorization: Bearer <YOUR_MCP_API_SECRET>
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}
```

### MCP Tools Reference (15 Tools)

| Tool Name | Description | Key Parameters |
| :--- | :--- | :--- |
| `create_opportunity` | Inserts a new draft or published opportunity. Automatically calculates content hash and canonical slug. | `title`, `organization`, `category`, `description`, `external_url`, `deadline`, `status` |
| `upsert_opportunity` | Inserts or updates an existing opportunity matched by content hash or external URL. | Same as create + `force_update` |
| `bulk_upsert_opportunities` | Batch upsert up to 50 opportunities in an atomic or sequential pipeline. | `opportunities: Array<OpportunityInput>` |
| `update_opportunity` | Modifies fields of an existing opportunity by ID. | `id`, `patch: Partial<OpportunityInput>` |
| `get_opportunity` | Fetches full opportunity record by UUID or slug. | `id` or `slug` |
| `search_opportunities` | Full-text and faceted search across active listings. | `query`, `category`, `status`, `limit`, `offset` |
| `list_opportunities` | Filtered list with pagination and ordering. | `category`, `location_type`, `status`, `sort_by`, `limit` |
| `publish_opportunity` | Transitions a draft listing to published status. | `id`, `notes` |
| `close_opportunity` | Explicitly closes an opportunity. | `id`, `reason` |
| `mark_opportunity_expired` | Marks opportunities whose deadline has passed as expired. | `id` |
| `check_duplicate_opportunities`| Pre-flight check returning existing matches based on URL, title, and organizer. | `external_url`, `title`, `organization` |
| `report_source_status` | Updates source verification status (`official`, `curated`, `community`). | `id`, `source_status`, `verified` |
| `delete_opportunity` | Hard-deletes an invalid listing and logs the audit event. | `id`, `reason` |
| `get_ingestion_stats` | Aggregated metrics on opportunities by category and status. | None |
| `get_categories` | Lists all 7 active taxonomy categories with descriptions. | None |

### Sample Client Configuration

#### Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "campusloop-opportunities": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-fetch",
        "https://opportunities.campusloop.space/api/mcp",
        "--header",
        "Authorization: Bearer YOUR_MCP_API_SECRET"
      ]
    }
  }
}
```

#### Antigravity / Cursor Custom MCP
```json
{
  "name": "campusloop-opportunities",
  "url": "https://opportunities.campusloop.space/api/mcp",
  "headers": {
    "Authorization": "Bearer YOUR_MCP_API_SECRET"
  }
}
```

---

## 4. Ingestion & Deduplication Engine

To eliminate duplicate listings across web scrapers and external feeds:
1. **Deterministic Content Hash**: Every listing computes an SHA-256 hash across `normalized_title + normalized_organizer + normalized_external_url`.
2. **URL Normalization**: Strips tracking parameters (`utm_*`, `ref`, `fbclid`), trailing slashes, and lowercases hostnames.
3. **Canonical Slugs**: Generated hierarchically (`organization-title-year`) with collision avoidance via incremental numerical suffixing.
4. **Audit Logging**: Every create, update, publish, or status change creates an immutable audit trail in `opportunity_audit_logs`.

---

## 5. CampusLoop OIDC Integration

CampusLoop Opportunities integrates seamlessly with CampusLoop Single Sign-On:
- **Authorization Endpoint**: `https://campusloop.space/oauth/authorize`
- **Token Endpoint**: `https://campusloop.space/oauth/token`
- **JWKS Endpoint**: `https://campusloop.space/.well-known/jwks.json`
- **Requested Scopes**: `openid profile email student college academic`
- **Security**: PKCE S256 code challenge with signed state tokens, ES256 asymmetric signature verification, and open-redirect sanitization.

Unauthenticated users can freely browse, search, and share all listings; signing in enables persistent personal bookmarks and community fraud reports.

---

## 6. Environment Variables

| Variable | Required | Description | Example / Note |
| :--- | :--- | :--- | :--- |
| `APP_URL` | Yes | Public canonical base URL | `https://opportunities.campusloop.space` |
| `DATABASE_URL` | Yes | Neon Serverless PostgreSQL connection string | `postgresql://user:pass@ep-xyz.aws.neon.tech/neondb?sslmode=require` |
| `CAMPUSLOOP_ISSUER` | Yes | CampusLoop OIDC Issuer | `https://campusloop.space` |
| `CAMPUSLOOP_CLIENT_ID` | Yes | CampusLoop OAuth Client ID | `cl_app_...` |
| `CAMPUSLOOP_CLIENT_SECRET`| Yes | CampusLoop OAuth Client Secret | Stored in Worker secrets |
| `AUTH_SECRET` | Yes | 32+ char secret for JWT session encryption | Random high-entropy string |
| `MCP_API_SECRET` | Yes | Bearer token for AI agent MCP publishing API | Random high-entropy string |

---

## 7. Local Development & Deployment

### Prerequisites
- Node.js 20 LTS or higher
- `pnpm` v12 (`npm i -g pnpm`)

### Setup
```bash
# Clone the repository
git clone https://github.com/campusloop-space/opportunities.git
cd opportunities

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local
# Fill in your local credentials in .env.local and .dev.vars

# Run database migrations
pnpm run db:migrate

# Seed sample verified data
pnpm run db:seed

# Start Next.js development server
pnpm run dev
```

### Testing
```bash
# Run unit & integration test suite (Vitest)
pnpm test

# Run strict TypeScript verification
pnpm run typecheck
```

### Production Deployment (Cloudflare Workers)
```bash
# 1. Build Next.js application with Webpack runtime
pnpm run build

# 2. Bundle Cloudflare Worker via OpenNext
pnpm run build:worker

# 3. Deploy Worker using Wrangler
node node_modules/wrangler/wrangler-dist/cli.js deploy --no-autoconfig
```

> **Engineering Note on Tooling**:
> - `pnpm` is the canonical package manager for this repository because `bun` encounters kernel-level syscall restrictions (`getrandom failed: errno 38`) on Linux hosts running kernel < 3.17.
> - `next build --webpack` is used because `@opennextjs/cloudflare` requires Webpack-generated route runtime bundles for full Cloudflare Workers compatibility.
> - `--no-autoconfig` is supplied to Wrangler to directly deploy `.open-next/worker.js` with assets `.open-next/assets`.

---

## 8. License

CampusLoop Opportunities is an official product of **CampusLoop Labs**. All rights reserved.
