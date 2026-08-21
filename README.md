# HomeHunt Foundation

You are the lead software architect and senior full-stack engineer responsible for building a production-grade Kenyan housing platform called HOMEHUNT.

PROJECT NAME:

HomeHunt

VISION:

HomeHunt is being built to solve the major problems people face when searching for rental houses in Kenya.

The long-term platform will allow users to:

1. Discover rental properties.

2. Search using location, price, property type and lifestyle requirements.

3. See properties on a map.

4. Determine whether a property is actually available.

5. Verify landlords, agents, properties and listings.

6. Receive intelligent property recommendations.

7. Book physical property viewings.

8. Communicate with landlords/agents.

9. Submit rental applications.

10. Manage leases and tenancies.

11. Manage rent and deposits.

12. Record inspections and maintenance.

13. Resolve rental disputes using structured claims and evidence.

14. Escalate unresolved disputes through appropriate external/legal channels.

15. Eventually use AI for property matching, fraud detection, recommendations, case organization and housing intelligence.

IMPORTANT:

We are NOT implementing the entire platform in this phase.

We are currently implementing:

PHASE 0 — FOUNDATION & PROJECT SETUP.

Do not implement future phases unless a future requirement is necessary to establish the foundation.

==================================================

1. CORE ENGINEERING PRINCIPLES

==================================================

Build this as a serious production application, not a demo, tutorial, toy project or landing page.

The architecture must support future expansion without requiring a major rewrite.

Follow:

- Clean Architecture principles.

- Separation of concerns.

- Domain-driven organization where practical.

- Strong typing.

- Secure-by-default development.

- RESTful API design.

- Database normalization.

- Proper validation.

- Proper error handling.

- Testability.

- Maintainability.

- Scalability.

- Accessibility.

- Mobile-first design.

- Kenyan context.

Do not create unnecessary abstractions simply for the sake of abstraction.

Prefer simple, explicit and maintainable code.

Do not use mock implementations where a real foundational implementation can be created.

Do not hardcode secrets.

Do not hardcode business-critical configuration.

Do not create fake property data at this stage unless seed data is specifically required for development testing.

==================================================

2. TECHNOLOGY STACK

==================================================

Use the following stack unless there is a compelling technical reason not to.

FRONTEND:

- Next.js

- TypeScript

- Tailwind CSS

- shadcn/ui

- TanStack Query

- React Hook Form where forms are needed

- Zod for frontend validation

- Lucide icons

BACKEND:

- Python

- FastAPI

- Pydantic

- SQLAlchemy 2.x

- Alembic

DATABASE:

- PostgreSQL

- PostGIS

INFRASTRUCTURE:

- Docker

- Docker Compose

- Redis

TESTING:

- Pytest for backend

- Playwright for end-to-end frontend testing

VERSION CONTROL:

- Git

- GitHub

Do not introduce microservices at this stage.

The initial backend should be a modular monolith.

==================================================

3. ARCHITECTURAL MODEL

==================================================

Use this high-level architecture:

                         HOMEHUNT

                            |

             +--------------+--------------+

             |                             |

          FRONTEND                       API

          Next.js                      FastAPI

             |                             |

             |                       Application Layer

             |                             |

             |                         Domain Logic

             |                             |

             |                         Repository

             |                             |

             +-----------------------------+

                                           |

                                      PostgreSQL

                                      + PostGIS

                                           |

                                        Redis

The frontend and backend must remain logically separated.

The frontend must not access PostgreSQL directly.

All database access must happen through the backend.

==================================================

4. REPOSITORY STRUCTURE

==================================================

Create a maintainable monorepo structure.

Use approximately:

homehunt/

│

├── apps/

│ │

│ ├── web/

│ │ ├── app/

│ │ ├── components/

│ │ ├── features/

│ │ ├── hooks/

│ │ ├── lib/

│ │ ├── providers/

│ │ ├── types/

│ │ └── ...

│ │

│ └── api/

│ ├── app/

│ │ ├── api/

│ │ ├── core/

│ │ ├── models/

│ │ ├── schemas/

│ │ ├── services/

│ │ ├── repositories/

│ │ ├── db/

│ │ ├── workers/

│ │ └── tests/

│ │

│ ├── alembic/

│ └── ...

│

├── packages/

│ └── shared-types/

│

├── infrastructure/

│ └── docker/

│

├── docs/

│ ├── architecture/

│ ├── database/

│ ├── api/

│ └── security/

│

├── .env.example

├── .gitignore

├── docker-compose.yml

├── README.md

└── package.json

You may adjust the exact structure where technically necessary, but preserve the separation between:

- frontend

- backend

- database

- infrastructure

- documentation

==================================================

5. FRONTEND FOUNDATION

==================================================

Initialize a clean Next.js application using TypeScript.

The frontend must support:

- Responsive design.

- Mobile-first layouts.

- Dark/light mode architecture if appropriate.

- Accessible components.

- Reusable UI components.

- Consistent spacing and typography.

- Loading states.

- Error states.

- Empty states.

Create the basic application shell.

The visual identity should feel:

- trustworthy

- modern

- professional

- Kenyan

- housing-focused

- clean

- simple

- premium without being unnecessarily flashy

Do NOT build the complete HomeHunt dashboard yet.

Create only the foundational shell required for later phases.

==================================================

6. FRONTEND ROUTING FOUNDATION

==================================================

Prepare routing for future modules without implementing all functionality.

At minimum establish conceptual routes for:

/

/login

/register

/dashboard

/properties

/properties/[id]

/map

/saved

/viewings

/applications

/messages

/profile

/settings

/admin

Do not build full pages for future functionality.

For routes that are not yet implemented, create appropriate placeholder pages indicating that the feature belongs to a future implementation phase.

Do not fake functionality.

==================================================

7. BACKEND FOUNDATION

==================================================

Initialize FastAPI properly.

Create:

- Application entry point.

- Configuration management.

- Environment loading.

- Database configuration.

- Redis configuration.

- API router structure.

- Exception handling.

- Logging.

- Health checks.

- Versioned API routing.

Use:

/api/v1/

as the initial API version.

Example:

GET /api/v1/health

Return a structured response.

Example concept:

{

"status": "ok",

"service": "homehunt-api"

}

Also create:

GET /api/v1/health/database

which verifies database connectivity.

Do not expose sensitive connection details.

==================================================

8. CONFIGURATION MANAGEMENT

==================================================

Create environment-based configuration.

Expected variables should include concepts such as:

DATABASE_URL

REDIS_URL

APP_ENV

APP_NAME

API_VERSION

SECRET_KEY

CORS_ORIGINS

Do not commit actual secrets.

Create:

.env.example

with safe placeholder values.

Use typed configuration in the backend.

Never access environment variables randomly throughout the application.

Centralize configuration.

==================================================

9. DATABASE FOUNDATION

==================================================

Configure PostgreSQL with PostGIS.

PostGIS must be enabled through the database initialization process.

The database must support:

- normal relational data

- geographic points

- geographic boundaries

- geographic distance calculations

- future spatial search

Do not create the entire HomeHunt schema in this phase.

Only create foundational tables required by Phase 0 and Phase 1 preparation.

At minimum prepare the architecture for:

users

roles

user_roles

locations will be implemented more fully in the property/location phase.

==================================================

10. DATABASE CONVENTIONS

==================================================

Establish consistent database conventions.

Use:

- UUID primary keys.

- created_at.

- updated_at where appropriate.

- soft deletion only where justified.

- foreign keys.

- unique constraints.

- indexes.

- check constraints where appropriate.

Do not blindly add indexes to every column.

Use indexes where they support expected queries.

Use UTC timestamps at the database/application layer.

The frontend can convert timestamps into the user's local timezone.

==================================================

11. ALEMBIC

==================================================

Configure Alembic correctly.

The project must support:

migration creation

migration application

migration rollback

The initial migration should create the foundational schema.

Do not manually alter database tables outside migrations.

Document:

How to create a migration.

How to run migrations.

How to rollback migrations.

==================================================

12. REDIS

==================================================

Add Redis to Docker Compose.

At this phase Redis only needs to be:

- available

- configured

- health-checkable

Do not build advanced caching or queues yet.

Prepare the architecture for future:

- caching

- rate limiting

- background jobs

- notifications

- session-related functionality

==================================================

13. DOCKER

==================================================

Create a Docker Compose development environment.

At minimum include:

postgres/postgis

redis

backend

The frontend may run independently during development, unless there is a strong reason to containerize it.

Ensure services can communicate through Docker networking.

Use health checks.

The project should be able to start with a documented command such as:

docker compose up

Do not assume developers already have PostgreSQL or Redis installed locally.

==================================================

14. DATABASE HEALTH CHECK

==================================================

Create a proper health-check system.

The backend should expose:

GET /api/v1/health

and database health.

Health checks should distinguish between:

Application healthy

Database unavailable

Redis unavailable

Do not leak credentials or infrastructure secrets in error responses.

==================================================

15. LOGGING

==================================================

Implement structured application logging.

Logs should contain useful context such as:

timestamp

log level

service

request ID

event

error information where applicable

Do not log:

passwords

authentication tokens

secret keys

private documents

sensitive personal information

Prepare the application for centralized monitoring later.

==================================================

16. REQUEST ID / CORRELATION ID

==================================================

Implement request identification.

Every API request should have a request/correlation ID.

If the client provides a safe request ID, validate it appropriately.

Otherwise generate one.

Return it in the response headers.

This will later make debugging property verification, disputes, payments and other workflows significantly easier.

==================================================

17. GLOBAL ERROR HANDLING

==================================================

Create consistent API error responses.

Do not return random error formats from different endpoints.

Use a consistent structure similar to:

{

"error": {

    "code": "SOME_ERROR_CODE",

    "message": "Human-readable message",

    "request_id": "..."

}

}

Do not expose Python stack traces to production users.

Development environments may log detailed exceptions internally.

==================================================

18. SECURITY FOUNDATION

==================================================

Security is a first-class requirement.

Implement foundational protections including:

- CORS configuration.

- Trusted host configuration where appropriate.

- Secure environment handling.

- Input validation.

- Request size considerations.

- Rate limiting architecture.

- Secure password hashing preparation.

- Authentication architecture.

- Authorization architecture.

- Audit logging architecture.

Never store plain-text passwords.

Use a modern password hashing algorithm such as Argon2id.

Do not create insecure custom encryption or authentication mechanisms.

==================================================

19. ROLE-BASED ACCESS CONTROL

==================================================

Establish RBAC architecture.

Initial roles:

TENANT

LANDLORD

AGENT

PROPERTY_MANAGER

VERIFIER

ADMIN

SUPER_ADMIN

Do not implement all role-specific business logic yet.

Create the foundational models and authorization utilities.

Authorization must eventually distinguish between:

Role permission

AND

resource ownership.

Example:

A landlord having the LANDLORD role does NOT automatically mean they can edit every property.

They should only be allowed to modify properties they are authorized to manage.

==================================================

20. AUDIT LOG FOUNDATION

==================================================

Create an audit logging model.

It should eventually support:

actor_id

action

resource_type

resource_id

before_data

after_data

ip_address

user_agent

created_at

Do not log sensitive data unnecessarily.

The audit system will later become critical for:

property verification

listing moderation

applications

leases

payments

disputes

administrative actions

==================================================

21. API DOCUMENTATION

==================================================

Use FastAPI's OpenAPI documentation.

Ensure API documentation is properly grouped.

Create tags for future modules:

Authentication

Users

Properties

Search

Verification

Viewings

Applications

Messaging

Tenancy

Disputes

Payments

Administration

Only implement the endpoints relevant to Phase 0.

==================================================

22. TESTING FOUNDATION

==================================================

Do not wait until the end of the project to introduce tests.

Configure:

Pytest

HTTP/API test client

Database testing strategy

Create tests for:

- API starts.

- Health endpoint works.

- Database connectivity works.

- Invalid configuration fails safely.

- Error responses follow the expected structure.

Frontend:

Configure the project so Playwright can later test:

- application loads

- navigation works

- authentication flows

Do not create hundreds of meaningless tests.

==================================================

23. CI/CD FOUNDATION

==================================================

Create a GitHub Actions workflow.

At minimum run:

Frontend lint

Frontend type checking

Backend lint

Backend tests

Backend type checking if configured

Build validation

The workflow should fail if critical checks fail.

Do not deploy automatically to production yet.

==================================================

24. CODE QUALITY

==================================================

Use:

ESLint

Prettier

Python formatter/linter such as Ruff

Type checking

Establish consistent formatting.

Avoid:

- giant files

- duplicated business logic

- deeply nested components

- magic numbers

- hardcoded secrets

- circular imports

- unnecessary global state

==================================================

25. DOCUMENTATION

==================================================

Create documentation for:

docs/architecture/

Explain:

Frontend architecture

Backend architecture

Database architecture

Request flow

Authentication strategy

Authorization strategy

docs/database/

Explain:

Database conventions

UUID strategy

Timestamp strategy

Migration strategy

PostGIS strategy

docs/security/

Explain:

Authentication

Authorization

Secrets

Logging

Sensitive data

Future security considerations

README.md must explain:

What HomeHunt is.

Current implementation phase.

Technology stack.

Prerequisites.

Installation.

Environment configuration.

How to run backend.

How to run frontend.

How to run Docker.

How to run migrations.

How to run tests.

How to run linting.

==================================================

26. GIT STRATEGY

==================================================

Create an initial Git repository structure suitable for collaborative development.

Use meaningful commits.

Example:

feat: initialize homehunt monorepo

feat: add fastapi foundation

feat: configure postgres postgis

feat: configure redis

feat: add database migrations

feat: add health checks

Do not make one giant commit containing everything if the environment supports incremental commits.

==================================================

27. DO NOT IMPLEMENT YET

==================================================

The following belong to future phases.

DO NOT implement them now unless needed for foundational architecture:

- Property CRUD

- Property search

- Map search

- Property verification workflows

- AI matching

- AI chatbot

- Viewing booking

- Messaging

- Applications

- Lease management

- Rent payments

- M-Pesa

- Maintenance

- Dispute resolution

- Legal escalation

- Reputation

- Advanced analytics

- Fraud detection

- Marketplace services

Prepare the architecture for them, but do not prematurely build them.

==================================================

28. FUTURE MODULE BOUNDARIES

==================================================

The application must be architected so future modules can be added as:

1. Identity

2. Locations

3. Properties

4. Search

5. Verification

6. Matching

7. Viewings

8. Applications

9. Messaging

10. Tenancy

11. Maintenance

12. Payments

13. Disputes

14. AI

15. Administration

16. Analytics

Do not tightly couple these modules.

==================================================

29. DEFINITION OF DONE

==================================================

Phase 0 is complete only when ALL of the following are true:

[ ] Repository is structured correctly.

[ ] Next.js frontend starts successfully.

[ ] FastAPI backend starts successfully.

[ ] PostgreSQL/PostGIS starts successfully.

[ ] Redis starts successfully.

[ ] Docker Compose works.

[ ] Environment configuration works.

[ ] Alembic works.

[ ] Initial migration works.

[ ] Database connection works.

[ ] API health endpoint works.

[ ] Database health endpoint works.

[ ] Structured logging works.

[ ] Request IDs work.

[ ] Global API error handling works.

[ ] Security foundation exists.

[ ] RBAC foundation exists.

[ ] Audit log foundation exists.

[ ] Backend tests run successfully.

[ ] Frontend lint/type checks pass.

[ ] CI pipeline passes.

[ ] README contains complete setup instructions.

[ ] Architecture documentation exists.

[ ] No secrets are committed.

[ ] No broken placeholder code exists.

==================================================

30. DEVELOPMENT PROCESS

==================================================

Before writing code:

1. Inspect the existing repository.

2. Determine whether a project already exists.

3. Do not overwrite existing working code without understanding it.

4. Identify existing dependencies.

5. Identify existing architecture.

6. Identify what has already been implemented.

7. Reuse good existing work where appropriate.

8. Only then begin modifications.

If the repository is empty, initialize it according to this specification.

If the repository already contains partial HomeHunt implementation, DO NOT rebuild everything from scratch.

Instead:

- audit the existing implementation

- identify what Phase 0 requirements already exist

- identify missing requirements

- implement only what is missing

- fix architectural problems that would block future phases

==================================================

31. IMPLEMENTATION REPORT

==================================================

At the end of implementation, provide a concise report containing:

1. What was already present.

2. What you implemented.

3. Files created.

4. Files modified.

5. Database changes.

6. New dependencies.

7. Commands to run the project.

8. Commands to run tests.

9. Commands to run migrations.

10. Remaining Phase 0 tasks, if any.

11. Any architectural decisions made.

12. Any assumptions made.

Do not claim something is implemented if it is not.

==================================================

32. IMPORTANT PRODUCT CONTEXT

==================================================

HomeHunt is not intended to be another generic property listing website.

The central problem is:

PEOPLE STRUGGLE TO FIND RELIABLE, AVAILABLE, SUITABLE AND TRUSTWORTHY HOMES IN KENYA.

The platform must eventually solve:

- fake listings

- stale listings

- inaccurate prices

- unavailable houses

- misleading property descriptions

- poor location information

- difficult comparison

- wasted transport costs

- wasted time contacting agents

- lack of trustworthy verification

- fragmented communication

- difficult application processes

- tenancy management problems

- rental disputes

The long-term platform therefore follows:

DISCOVER

    ↓

COMPARE

    ↓

VERIFY

    ↓

VIEW

    ↓

APPLY

    ↓

LEASE

    ↓

LIVE

    ↓

MANAGE

    ↓

RESOLVE

The current phase is only the FOUNDATION required to build this system correctly.

==================================================

FINAL INSTRUCTION

==================================================

START NOW.

First inspect the repository and existing implementation.

Then produce a short implementation audit.

After the audit, implement Phase 0 completely.

Do not stop after explaining what should be done.

Actually create and modify the required project files.

Do not move to Phase 1 until Phase 0's Definition of Done has been satisfied.

At the end, run the available tests, linting and build checks.

Fix errors you encounter.

Then provide the implementation report.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
