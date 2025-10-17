# 💸 Shared Subscription Debt Manager

## 🎯 Project Summary / Objective
You manage a shared subscription with several friends (e.g., 5 people).  
You pay every month, and your friends reimburse you either:
1. by automatic transfer,  
2. or manually when you request payment.

The goal is to automate:
- the calculation of each friend’s share,
- the management of payments (creation, tracking, verification),
- and the visualization of current and future debts.

---

## 📜 Speckit Constitution

- Purpose: establish shared rules for scope, decisions, quality, and delivery.
- Scope: this spec covers MVP for shared subscription debt management.
- Non-Goals: external banking integrations; complex payment automation beyond manual/verified flows.
- Decision Principles: simplicity first, security by default, testability, infra-as-code, least privilege.
- Roles: product owner validates scope; tech lead owns architecture; contributors follow this constitution.
- Change Management: open PR with spec delta; record rationale; require 1 approval (PO or tech lead).
- Definition of Done: spec updated; code implemented; tests added/green; docs updated; CI passing.
- Quality Gates: lint/type-check; unit ≥ 80% coverage; integration paths for auth, charges, payments.
- Security & Privacy: hashed passwords; RBAC; HTTPS; rate limiting; audit logs for critical actions.
- Testing Policy: unit (services, utils), integration (API + DB), E2E (critical flows) on CI.
- Documentation & Traceability: changelog in PR; link tasks/issues; API docs updated.
- Communication Cadence: async via PRs; weekly sync review; immediate escalation for blockers/security.
- Approval: product owner signs off on scope; tech lead signs off on architecture & security.

---

## 🧭 Main User Stories

### **Administrator**
- **USP1**: Configure a recurring expense (title, amount, billing date, participants)
- **USP2**: Manage users (create, edit, deactivate)
- **USP3**: View who owes how much at a given date
- **USP4**: View unverified payments
- **USP5**: Mark a payment as verified after bank confirmation
- **USP6**: Create a payment on behalf of a user

### **User**
- **USS1**: Log in with username/password
- **USS2**: View their payments and their statuses
- **USS3**: Check the total amount owed on a given date
- **USS4**: Create, modify, or delete a non-verified payment

---

## ⚙️ Features (MVP + Future Enhancements)

### **MVP**
- User management (admin)
- Recurring expense management
- Debt calculation per date
- Payment management (create, verify)
- Admin dashboard

### **Future Enhancements**
- Full user portal
- Authentication (JWT/Cognito)
- Email notifications
- CSV/PDF exports
- Banking integration (future phase)

---

## 🧩 Technical Architecture

| Layer | Technology | Description |
|--------|-------------|-------------|
| Frontend | **Angular** | SPA with modular components |
| Backend | **Node.js + NestJS** | Structured, maintainable REST API |
| ORM | **Prisma** | Schema generation & migrations |
| Database | **PostgreSQL** | Relational, reliable, suited for monetary data |
| Auth | JWT or **AWS Cognito** | Authentication & user management |
| Hosting | **AWS Fargate** | Backend container hosting |
| Static Storage | **S3 + CloudFront** | Frontend hosting |
| CI/CD | **GitHub Actions** | Build, test, deployment pipeline |
| IaC | **Terraform** | AWS provisioning (RDS, ECS, CloudFront, Cognito, etc.) |

---

## 🧱 Recommended Stack / Technical Constraints

- One-shot development but maintainable codebase.
- Dev environment: Windows + PowerShell 7 + Cursor IDE + Speckit.
- Human + AI pair programming.
- Mandatory CI/CD pipeline (tests, build, deploy).
- AWS hosting (scalable via Terraform).

---

## 🧮 Data Model (Logical Schema)

### **User**
| Field | Type | Details |
|--------|------|----------|
| id | uuid | PK |
| email | string | unique |
| name | string |  |
| password_hash | string | bcrypt |
| role | enum(user, admin) |  |
| is_active | bool |  |
| created_at | datetime |  |

### **Subscription**
| Field | Type | Details |
|--------|------|----------|
| id | uuid | PK |
| title | string | expense name |
| total_amount | decimal | total amount |
| scheduled_day | int | day of month |
| frequency | string | (monthly, etc.) |
| owner_id | fk(User) |  |
| start_date | date |  |
| end_date | date | nullable |
| is_active | bool |  |

### **SubscriptionParticipant**
| Field | Type | Details |
|--------|------|----------|
| id | uuid | PK |
| subscription_id | fk(Subscription) |  |
| user_id | fk(User) |  |
| share_type | enum(equal, custom) |  |
| share_value | decimal |  |

### **Charge** (monthly instance)
| Field | Type | Details |
|--------|------|----------|
| id | uuid | PK |
| subscription_id | fk(Subscription) |  |
| period_start | date |  |
| period_end | date |  |
| amount_total | decimal |  |

### **ChargeShare**
| Field | Type | Details |
|--------|------|----------|
| id | uuid | PK |
| charge_id | fk(Charge) |  |
| user_id | fk(User) |  |
| amount_due | decimal |  |
| amount_paid | decimal |  |
| status | enum(open, settled) |  |

### **Payment**
| Field | Type | Details |
|--------|------|----------|
| id | uuid | PK |
| user_id | fk(User) |  |
| charge_id | fk(Charge) | nullable |
| amount | decimal |  |
| currency | string | default EUR |
| scheduled_date | date |  |
| created_by | fk(User) | admin or user |
| status | enum(pending, verified, cancelled) |  |
| verified_at | datetime | nullable |

---

## 🔌 REST Endpoints (MVP)

### Auth
- `POST /auth/login`
- `POST /auth/refresh`

### Users
- `GET /users`
- `POST /users`
- `PATCH /users/:id`
- `DELETE /users/:id`

### Subscriptions
- `POST /subscriptions`
- `GET /subscriptions`
- `PATCH /subscriptions/:id`

### Charges
- `POST /subscriptions/:id/generate-charges?until=YYYY-MM-DD`
- `GET /charges?date=YYYY-MM-DD`
- `GET /charges/:id/shares`

### Payments
- `POST /payments`
- `GET /payments?status=pending`
- `PATCH /payments/:id/verify`
- `PATCH /payments/:id`
- `DELETE /payments/:id`

### Reports
- `GET /reports/summary?date=YYYY-MM-DD`
- `GET /reports/user/:id/balance?date=YYYY-MM-DD`

---

## 🧠 Business Logic

### Calculate User Balance
```text
balance(userId, date):
  total_due = sum of charges <= date
  total_paid = verified payments (and pending if configured)
  return total_due - total_paid
```
### 🧠 Main Rules

- Equal share by default  
- Optionally include pending payments in balance forecast  
- Charges automatically generated every month (cron job or manual trigger)

---

## 🖥️ UI / UX (Angular Structure)

### **Admin Pages**
- **Dashboard** – Overview of total due, upcoming charges, pending payments  
- **Subscriptions** – List, create, edit, delete recurring expenses  
- **Subscription Details** – Calendar view, participant shares, charge history  
- **Payments** – View, verify, and manage payments  
- **Users** – Manage user accounts and invitations  
- **Reports** – View summary of who owes how much for a selected date  

### **User Pages**
- **Login** – Email + password authentication  
- **My Account** – Current and forecasted balance  
- **My Payments** – Create, edit, delete non-verified payments  
- **History** – List of all payments (verified & pending)  

### **Core Components**
- `SubscriptionForm`
- `UserForm`
- `PaymentForm`
- `BalanceCard`
- `PendingPaymentsTable`
- `AuditLogViewer`

---

## 🔐 Security

- Authentication: **JWT** or **AWS Cognito** (depending on hosting setup)  
- RBAC: simple roles (`admin`, `user`)  
- Enforce HTTPS via **CloudFront / ALB**  
- Store password hashes securely with **bcrypt**  
- Enable **CSRF protection** if using cookies  
- Input validation on both frontend and backend  
- **Audit logs** stored in DB for critical actions (payment verification, user creation, etc.)  
- **Rate limiting** on API endpoints  

---

## 🧪 Testing & Validation Plan

### **Unit Tests**
- Angular modules → **Jest/Karma**  
- NestJS services → **Jest**  
- Minimum coverage target: **80%**

### **Integration Tests**
- API endpoints → **Supertest**  
- Database consistency → Test fixtures / migrations  

### **End-to-End (E2E) Tests**
- Scenarios: login, subscription creation, payment creation, payment verification  
- Framework: **Cypress**  
- Environments: staging & production mirrors  

---

## 🚀 Roadmap (Incremental Deliverables)

| Sprint | Deliverable | Description |
|---------|--------------|-------------|
| **A** | Setup & Infrastructure | Repository setup, CI/CD pipeline, Terraform baseline, local RDS |
| **B** | Auth & Users | CRUD for users, admin login, role management |
| **C** | Subscriptions & Charges | Expense configuration, monthly charge generation, share calculations |
| **D** | Payments | Payment creation & verification workflow |
| **E** | User Frontend | User portal with payment management |
| **F** | Production Deployment | Complete IaC, AWS monitoring, E2E tests, release |

---

## 🧰 Observability

- **Logs**: AWS CloudWatch (structured JSON logs)  
- **Error tracking**: Sentry (frontend + backend)  
- **Healthcheck endpoint**: `/healthz`  
- **Backups**: Automated RDS snapshots with retention policy  
- **Alerts**: CloudWatch alarms for error rates, latency, and failed tasks  

---

## 📋 Speckit Summary Block

- **Project Name**: Shared Subscription Debt Manager  
- **Objective**: Automate debt tracking, calculations, and reimbursements for shared subscriptions  
- **Tech Stack**: Angular / NestJS / PostgreSQL / AWS / Terraform / GitHub Actions CI  
- **MVP Scope**:
  - CRUD for Subscriptions & Users  
  - Debt calculation engine  
  - Payment creation & manual verification  
  - Admin dashboard for monitoring balances  
- **Testing**: Unit, Integration, and E2E coverage ≥ 80%  
- **Deliverables**: 6 autonomous sprints  

---
