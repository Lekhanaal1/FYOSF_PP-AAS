# FYOSF Architecture Documentation

## System Overview

The Federal Youth Online Safety Framework (FYOSF) is a full-stack web application built with Next.js 14, implementing production-grade standards, security best practices, and design patterns from "Head First Design Patterns."

## Architecture Layers

### 1. Presentation Layer (Frontend)
- **Framework**: Next.js 14 App Router
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context + Hooks

**Key Components**:
- Homepage (`app/page.tsx`)
- Authentication Pages (`app/auth/`)
- Dashboard (`app/dashboard/`)
- Report Management (`app/dashboard/reports/`)

### 2. API Layer (Backend)
- **Framework**: Next.js API Routes
- **Authentication**: NextAuth.js
- **Validation**: Zod schemas
- **Security**: Rate limiting, input sanitization

**Endpoints**:
- `/api/auth/[...nextauth]` - Authentication
- `/api/auth/register` - User registration
- `/api/reports` - Report CRUD operations
- `/api/reports/[id]` - Individual report operations

### 3. Data Layer
- **ORM**: Prisma
- **Database**: SQLite (development), PostgreSQL (production-ready)
- **Migrations**: Prisma Migrate

**Models**:
- User (authentication, roles)
- Report (FYOSF reports)
- Session (authentication sessions)
- Notification (user notifications)
- ReportVersion (version history)

### 4. Business Logic Layer
- **Design Patterns**: Located in `lib/patterns/`
- **Security**: Located in `lib/security/`
- **Utilities**: Located in `lib/utils.ts`

## Design Patterns Implementation

### Observer Pattern
**File**: `lib/patterns/observer.ts`
**Purpose**: Real-time notifications and state updates
**Usage**: 
```typescript
const subject = new NotificationSubject();
const observer = new NotificationObserver('User', (data) => {
  // Handle notification
});
subject.subscribe(observer);
subject.notify({ message: 'Report updated' });
```

### Strategy Pattern
**File**: `lib/patterns/strategy.ts`
**Purpose**: Interchangeable content filtering algorithms
**Usage**:
```typescript
const filter = new ContentFilter(new BasicFilterStrategy());
const clean = filter.filterContent(userInput);
// Switch strategies
filter.setStrategy(new StrictFilterStrategy());
```

### Factory Pattern
**File**: `lib/patterns/factory.ts`
**Purpose**: Create different types of reports
**Usage**:
```typescript
const report = ReportFactory.createReport(
  ReportType.FULL_REPORT,
  id,
  title,
  content,
  { executiveSummary, background, evidence }
);
```

### Singleton Pattern
**File**: `lib/patterns/singleton.ts`
**Purpose**: Global configuration management
**Usage**:
```typescript
const config = ConfigurationManager.getInstance();
const appName = config.get('appName');
config.set('maxReportLength', 15000);
```

### Decorator Pattern
**File**: `lib/patterns/decorator.ts`
**Purpose**: Dynamically add features to reports
**Usage**:
```typescript
let report = new BaseReport(content);
report = new EncryptionDecorator(report);
report = new FormattingDecorator(report);
const final = report.generate();
```

### Template Method Pattern
**File**: `lib/patterns/template.ts`
**Purpose**: Define algorithm structure
**Usage**:
```typescript
const generator = new ExecutiveSummaryGenerator();
const report = generator.generateReport(data);
```

## Security Architecture

### Input Validation
- **Library**: Zod
- **Location**: `lib/security/validation.ts`
- **Schemas**: `reportSchema`, `userSchema`, `loginSchema`
- **Functions**: `sanitizeInput()`, `validateEmail()`, `validatePassword()`

### Content Filtering
- **Strategy Pattern**: Basic and Strict filtering
- **XSS Protection**: Removes script tags, event handlers
- **Applied**: All user-generated content before storage

### Rate Limiting
- **Implementation**: `lib/security/rateLimit.ts`
- **Default**: 100 requests per minute per IP
- **Applied**: Registration and API endpoints

### Authentication
- **Provider**: NextAuth.js
- **Strategy**: JWT-based sessions
- **Password Hashing**: bcryptjs (12 salt rounds)
- **Session Duration**: 30 days

### Security Headers
- **HSTS**: Strict Transport Security
- **X-Frame-Options**: SAMEORIGIN
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: Enabled
- **Referrer-Policy**: origin-when-cross-origin

## Data Flow

### User Registration Flow
1. User submits registration form
2. Client validates input (Zod schema)
3. API route validates server-side
4. Rate limiter checks request frequency
5. Password hashed with bcrypt
6. User created in database
7. Response sent to client

### Report Creation Flow
1. User fills report form
2. Client-side validation
3. API route receives data
4. Content filtering applied (Strategy Pattern)
5. Report created using Factory Pattern
6. Data saved to database
7. Response with report ID
8. Redirect to report view

### Authentication Flow
1. User submits credentials
2. NextAuth validates with database
3. Password compared (bcrypt)
4. JWT token generated
5. Session created
6. User redirected to dashboard

## Database Schema

```
User
├── id (String, Primary Key)
├── email (String, Unique)
├── name (String, Optional)
├── password (String, Hashed)
├── role (Enum: ADMIN, EDITOR, VIEWER)
└── Relations: reports, sessions, notifications

Report
├── id (String, Primary Key)
├── title (String)
├── executiveSummary (Text)
├── background (Text)
├── evidence (Text)
├── status (Enum: DRAFT, PUBLISHED, ARCHIVED)
├── authorId (Foreign Key → User)
└── Relations: author, versions

Session
├── id (String, Primary Key)
├── sessionToken (String, Unique)
├── userId (Foreign Key → User)
└── expires (DateTime)
```

## File Structure

```
/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Homepage
│   └── globals.css       # Global styles
├── lib/                   # Core libraries
│   ├── patterns/         # Design patterns
│   ├── security/         # Security utilities
│   ├── db.ts            # Database connection
│   └── utils.ts         # Helper functions
├── prisma/               # Database schema
├── types/                # TypeScript definitions
├── scripts/              # Setup scripts
└── public/               # Static assets
```

## Technology Choices

### Why Next.js?
- Server-side rendering for SEO
- API routes for full-stack development
- Built-in optimizations
- TypeScript support
- Production-ready

### Why Prisma?
- Type-safe database access
- Migration management
- Excellent developer experience
- Supports multiple databases

### Why NextAuth.js?
- Industry-standard authentication
- Multiple provider support
- Secure session management
- Easy integration

### Why Tailwind CSS?
- Utility-first approach
- Rapid development
- Consistent design system
- Small bundle size

## Performance Optimizations

1. **Code Splitting**: Automatic with Next.js
2. **Image Optimization**: Next.js Image component ready
3. **Static Generation**: Possible for public pages
4. **API Caching**: Can be added with Redis
5. **Database Indexing**: Prisma handles automatically

## Scalability Considerations

### Horizontal Scaling
- Stateless API routes
- JWT-based sessions
- Database connection pooling ready

### Vertical Scaling
- Efficient database queries
- Optimized React components
- Minimal dependencies

### Future Enhancements
- Redis for caching
- PostgreSQL for production
- CDN for static assets
- Monitoring and logging
- CI/CD pipeline

## Testing Strategy (Future)

1. **Unit Tests**: Jest for utilities and patterns
2. **Integration Tests**: API route testing
3. **E2E Tests**: Playwright or Cypress
4. **Security Tests**: OWASP ZAP scanning

## Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set secure `NEXTAUTH_SECRET`
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Set up error tracking
- [ ] Performance testing
- [ ] Security audit

---

**Architecture designed for production, scalability, and maintainability.**

