<<<<<<< HEAD
# Federal Youth Online Safety Framework (FYOSF)

**PP-AAS: Privacy-Preserving Age Attestation System**

PP-AAS implementation with AgeTokens, duty-of-care, state modules. Includes STRIDE threat model, OpenAPI spec, and PoC code.
=======
Federal Youth Online Safety Framework (FYOSF):

PP-AAS implementation with AgeTokens, duty-of-care, state modules. Includes STRIDE threat model, OpenAPI spec, and PoC code.

# PP-AAS: Privacy-Preserving Age Attestation System
>>>>>>> e115b23f8ae8299e7de35affe87ef78339d0a7eb

A production-ready web application for managing and presenting the Privacy-Preserving Age Attestation System (PP-AAS) proposal for the MIT Policy Hackathon 2025. This framework combines AgeTokens, federal baseline duty-of-care, and interoperable state modules to protect youth online without compromising privacy or equity.

## Features

- **User Authentication**: Secure login and registration with password hashing
- **PP-AAS Report Management**: Create, view, edit, and manage comprehensive policy proposals
- **Comprehensive Sections**: 
  - Basic Info (Executive Summary, Background, Evidence, Problem Statement)
  - Core Components (AgeTokens, Duty-of-Care, State Modules)
  - Design & Security (Privacy Implementation, Anti-False-Security, Equity Architecture, STRIDE Model)
  - Governance & Metrics (NIST+FTC+NTIA Governance, KPIs)
- **Design Patterns**: Implementation of Head First Design Patterns
  - Observer Pattern (real-time notifications)
  - Strategy Pattern (content filtering)
  - Factory Pattern (report generation)
  - Singleton Pattern (configuration management)
  - Decorator Pattern (report enhancement)
  - Template Method Pattern (report generation workflow)
- **Security**: 
  - Input validation and sanitization
  - Rate limiting
  - XSS protection
  - CSRF protection
  - Secure password hashing
- **Modern UI**: Responsive design with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Security**: bcryptjs for password hashing

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn

## 🔧 Installation

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   - `DATABASE_URL`: Database connection string (default: `file:./dev.db`)
   - `NEXTAUTH_URL`: Your application URL (default: `http://localhost:3000`)
   - `NEXTAUTH_SECRET`: A random secret string (generate with: `openssl rand -base64 32`)

4. **Set up the database**:
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── reports/       # Report endpoints
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── page.tsx           # Home page
├── lib/                   # Utility libraries
│   ├── patterns/          # Design pattern implementations
│   ├── security/          # Security utilities
│   ├── db.ts             # Database connection
│   └── utils.ts          # Helper functions
├── docs/                  # Technical documentation
│   ├── STRIDE_THREAT_MODEL.md    # Complete STRIDE threat analysis
│   ├── TECHNICAL_APPENDIX.md     # AgeToken spec & implementation
│   ├── openapi.yaml              # OpenAPI 3.0.3 specification
│   └── APPENDIX_INDEX.md         # Appendix navigation guide
├── samples/               # Proof-of-concept code
│   ├── attestor-node/     # Node.js/Express attestor
│   └── validator-python/ # Python/Flask validator
├── prisma/               # Prisma schema
└── types/                # TypeScript type definitions
```

## 🎨 Design Patterns Implemented

### Observer Pattern
- Used for real-time notifications and state updates
- Located in `lib/patterns/observer.ts`

### Strategy Pattern
- Content filtering strategies (Basic, Strict)
- Located in `lib/patterns/strategy.ts`

### Factory Pattern
- Report generation with different types
- Located in `lib/patterns/factory.ts`

### Singleton Pattern
- Configuration management
- Located in `lib/patterns/singleton.ts`

### Decorator Pattern
- Report enhancement (encryption, compression, formatting)
- Located in `lib/patterns/decorator.ts`

### Template Method Pattern
- Report generation workflow
- Located in `lib/patterns/template.ts`

## 🔒 Security Features

### Application Security
- **Input Validation**: Zod schemas for all user inputs
- **Content Filtering**: XSS protection through content sanitization
- **Rate Limiting**: API endpoints protected from abuse
- **Password Hashing**: bcrypt with salt rounds (12 rounds)
- **Session Management**: Secure JWT-based sessions
- **Security Headers**: HSTS, X-Frame-Options, CSP, etc.

### AgeToken Security (PP-AAS)
- **STRIDE Threat Model**: Complete threat analysis with mitigations (see `docs/STRIDE_THREAT_MODEL.md`)
- **Cryptographic Signing**: Ed25519 or ECDSA P-256 signatures
- **HSM/KMS Integration**: Hardware-backed key management
- **PKI Infrastructure**: Certificate-based attestor authentication
- **Privacy-Preserving**: Zero PII in tokens, differential privacy for audits
- **Replay Prevention**: Nonce-based with short-term caching
- **Audience Binding**: Prevents cross-platform token reuse

## 📝 Usage

### Web Application
1. **Register an account**: Navigate to `/auth/register`
2. **Login**: Use your credentials at `/auth/login`
3. **Create a PP-AAS report**: Click "New Report" in the dashboard
4. **Fill in sections**: 
   - Basic Info (Executive Summary, Background, Evidence, Problem Statement)
   - Core Components (AgeTokens, Duty-of-Care, State Modules)
   - Design & Security (Privacy, Anti-False-Security, Equity, STRIDE)
   - Governance & Metrics (NIST+FTC+NTIA, KPIs)
5. **Save and view**: Reports are saved and can be viewed from the dashboard

### Technical Appendix & Sample Code
- **STRIDE Threat Model**: See `docs/STRIDE_THREAT_MODEL.md`
- **Technical Specification**: See `docs/TECHNICAL_APPENDIX.md`
- **OpenAPI Spec**: See `docs/openapi.yaml`
- **Sample Code**: See `samples/README.md` for PoC implementations

## 🧪 Development

- **Database Studio**: `npm run db:studio` - Visual database editor
- **Linting**: `npm run lint` - Check code quality
- **Build**: `npm run build` - Production build
- **Start**: `npm start` - Start production server

## 🚢 Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Generate a strong `NEXTAUTH_SECRET`
3. Use a production database (PostgreSQL recommended)
4. Update `DATABASE_URL` to your production database
5. Build the application: `npm run build`
6. Start the server: `npm start`

## 📄 License

This project is part of the MIT Policy Hackathon 2025.

## 👥 Contributing

This is a hackathon project. For production use, consider:
- Adding comprehensive tests
- Implementing audit logging
- Adding more robust error handling
- Setting up CI/CD pipelines
- Adding monitoring and analytics

## 🐛 Troubleshooting

- **Database errors**: Run `npm run db:push` to sync schema
- **Auth errors**: Check `NEXTAUTH_SECRET` is set correctly
- **Build errors**: Clear `.next` folder and rebuild

---

Built with ❤️ for the MIT Policy Hackathon 2025

