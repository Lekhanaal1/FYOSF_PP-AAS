# PP-AAS (AgeTokens) Demo Guide

This guide will help you quickly set up and demonstrate the Privacy-Preserving Age Attestation System (PP-AAS) application for the MIT Policy Hackathon 2025.

## Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment
```bash
cp .env.example .env
```

Edit `.env` and ensure `NEXTAUTH_SECRET` is set. You can generate one with:
```bash
openssl rand -base64 32
```

### Step 3: Initialize Database
```bash
npm run db:generate
npm run db:push
```

### Step 4: Start Development Server
```bash
npm run dev
```

### Step 5: Open in Browser
Navigate to: http://localhost:3000

## Demo Flow

### 1. Homepage - Key Differentiators
- **URL**: http://localhost:3000
- **Features to highlight**:
  - **AgeTokens System**: Ephemeral, unlinkable, non-replayable cryptographic tokens
  - **Federal Duty-of-Care**: Mandatory safety defaults
  - **State Modules**: Interoperable state registration
  - **Privacy-Preserving**: Zero PII retention
  - **Anti-False-Security**: Mandatory defaults even without tokens
  - **Equity-Driven**: No ID requirement, anonymous attestation

### 2. Registration & Login
- **URL**: http://localhost:3000/auth/register
- Create an account to access the framework

### 3. Dashboard
- **URL**: http://localhost:3000/dashboard
- View and manage PP-AAS reports

### 4. Create PP-AAS Report
- **URL**: http://localhost:3000/dashboard/new
- **Four Sections**:
  1. **Basic Info**: Title, Executive Summary, Background, Evidence, Problem Statement
  2. **Core Components**: AgeTokens, Duty-of-Care, State Modules
  3. **Design & Security**: Privacy Implementation, Anti-False-Security, Equity Architecture, STRIDE Security Model
  4. **Governance & Metrics**: NIST+FTC+NTIA Governance, KPIs

## Sample PP-AAS Content

### Executive Summary
```
PP-AAS (Privacy-Preserving Age Attestation System) proposes a token-based attestation system where certified attestors (schools, libraries, telcos) issue short-lived, signed AgeTokens that prove age-range (e.g., <13, 13–15, 16–17, 18+) without sharing PII. This system combines:

1. AgeTokens: Ephemeral, unlinkable, non-replayable cryptographic tokens
2. Federal baseline duty-of-care: Platforms must apply safety defaults to token-flagged minors
3. Interoperable State Modules: Federal floor preempts biometric/ID mandates; states register additional modules via NTIA registry

This framework avoids common failure modes: privacy risks (explicitly bans ID/biometrics), false security (mandatory defaults without tokens), and equity issues (multiple attestation channels, no ID requirement).
```

### Problem Statement
```
Existing federal laws (COPPA, CIPA) are narrow and primarily protect children under 13 or school networks. Proposed bills (KOSA) are promising but incomplete. States have implemented divergent age verification (AV) mandates that often rely on ID/biometrics, creating privacy risks and unequal protections. Public metrics (e.g., COSI) show countries with AV laws tend to score higher on child safety — but causality is unclear and implementation quality varies.
```

### AgeTokens System
```
AgeTokens are token-based attestation where certified attestors (schools, libraries, telcos) issue short-lived, signed tokens that prove age-range without sharing PII. Key properties:

- Single-purpose: Each token serves one verification
- Audience-restricted: Bound to specific platform/service
- Non-linkable: Cannot be traced across platforms
- Short-lived: Expire after set duration
- Zero PII: Platforms never receive raw personal information
- Multiple attestors: Schools, libraries, telcos, community kiosks
- Cryptographic signing: Attestors sign with certified keys
- Nonce + audience binding: Prevents replay attacks
```

### Federal Baseline Duty-of-Care
```
Platforms must apply safety defaults to token-flagged minors:

- No algorithmic amplification of risky content
- Messaging limits (DM caps, contact restrictions)
- Default private accounts
- Conservative personalization for unverified/likely-minor accounts
- Abuse mitigations (reporting workflows, DM caps)
- Differentially-private KPIs published by platforms
- Independent audits required
- FTC enforcement + NTIA coordination
```

### Interoperable State Modules
```
Federal floor preempts biometric/ID mandates. States may register additional modules that interoperate with AgeTokens and the federal KPI system via NTIA registry. Examples:

- Digital wellness curricula
- Enhanced reporting requirements
- Additional safety features
- State-specific grant programs

Modeled after Clean Air Act, Medicaid waivers, and interstate compacts. States-as-labs approach allows innovation while maintaining federal baseline.
```

### Privacy-Preserving Implementation
```
Technical specifications:

- Ephemeral tokens: Short-lived, automatically expire
- Unlinkable: Cryptographic properties prevent cross-platform tracking
- Non-replayable: Nonce + audience binding prevents token reuse
- Zero PII retention: Platforms never store raw personal information
- Attestor deletion: PII deleted within 24 hours of attestation
- Key rotation: Regular attestor key updates
- Differential privacy: Applied to all audit data
- Multiple access points: Schools, libraries, telcos, clinics, kiosks
- Grant funds: For underserved areas to ensure equitable access
```

### Anti-False-Security Design
```
Explicitly targets the harm that "age verification ≠ safety":

- Mandatory safety defaults even without tokens
- Conservative personalization for unverified/likely-minor accounts
- Cross-platform Safety Report Cards
- Public dashboards showing risk reduction, not just compliance
- Engagement harm index tracking
- Real safety metrics vs. compliance checkboxes

This turns AV from a checkbox into an actual safety mechanism.
```

### Equity-Driven Architecture
```
Addresses harm to vulnerable populations:

- No ID requirement: Works for immigrant kids, foster youth, kids without IDs
- Anonymous attestation: Protects kids with abusive parents
- Safe-harbor pathways: Special protections for vulnerable youth
- Zero-cost access: Through public institutions (schools, libraries)
- Multiple channels: Schools, libraries, telcos, clinics, community kiosks
- Grant programs: Fund underserved areas
- No parental control requirement: Opt-in only, protects kids from abusive parents
```

### Security Model (STRIDE)
```
Threat model and mitigations:

**Spoofing**: Attestors sign tokens with certified keys; key rotation prevents compromise
**Tampering**: Cryptographic signatures prevent token modification
**Repudiation**: Audit logs track attestor behavior; anomalous patterns trigger revocation
**Information Disclosure**: Zero PII in tokens; attestors delete PII within 24 hours
**Denial of Service**: Multiple attestation channels prevent single point of failure
**Elevation of Privilege**: Tokens are single-purpose and audience-restricted

Anomalous attestor behavior triggers audits and revocation.
```

### Governance (NIST + FTC + NTIA)
```
Clear division of roles:

**NIST**: Technical standards for AgeTokens, cryptographic specifications, attestor certification
**FTC**: Enforcement of duty-of-care requirements, platform compliance, penalties
**NTIA**: Interstate coordination, state module registry, grant program administration

Grant programs ensure equitable access. Independent audits verify compliance.
```

### Key Metrics & Evaluation (KPIs)
```
Primary KPIs (platform-reported, differentially private + audited):

- Exposure reduction: Decrease in harmful content exposure
- Unsolicited adult contact rate: Reduction in unwanted contacts
- Grooming incident reports: Tracking and reduction
- Engagement harm index: Measure of harmful engagement patterns
- Equitable token access rates: Ensuring equal access across demographics

Pilot target: Measurable improvement in local COSI proxy metrics.
```

## Key Talking Points for Judges

1. **Integration**: Only federated, privacy-preserving ecosystem combining all components
2. **Privacy Implementation**: Technical precision with ephemeral, unlinkable tokens
3. **Anti-False-Security**: Major innovation addressing "AV ≠ safety" problem
4. **Equity Architecture**: Only system requiring no ID, supporting vulnerable youth
5. **Federalism-Aware**: States-as-labs approach with federal floor
6. **Security Maturity**: Full STRIDE threat model with mitigations
7. **Governance Clarity**: NIST + FTC + NTIA division of roles
8. **Misuse-Resistant**: Addresses social abuse cases (bullying, abusive parents)

## Troubleshooting

### Database Issues
```bash
# Reset database
rm prisma/dev.db
npm run db:push
```

### Port Already in Use
```bash
# Use different port
PORT=3001 npm run dev
```

### Authentication Errors
- Check `.env` file has `NEXTAUTH_SECRET` set
- Ensure database is initialized
- Clear browser cookies and try again

## Production Demo Checklist

- [ ] Application starts without errors
- [ ] User can register new account
- [ ] User can login with credentials
- [ ] Dashboard displays correctly
- [ ] Can create new PP-AAS report
- [ ] All four sections work (Basic, Core, Design, Governance)
- [ ] Can view report with all sections displayed
- [ ] Can edit existing report
- [ ] Homepage showcases key differentiators
- [ ] Security features are active
- [ ] Design patterns are implemented
- [ ] UI is responsive and modern

---

**Ready to demo the PP-AAS framework!** 🚀
