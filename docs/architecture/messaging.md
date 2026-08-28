# Architecture Documentation - Messaging

The HomeHunt messaging system is built on TanStack Start server functions and a Postgres relational database schema.

## Database Schema

```mermaid
erDiagram
  conversations {
    uuid id PK
    uuid property_id FK
    uuid listing_id FK
    uuid seeker_id FK
    uuid provider_id FK
    varchar status
    timestamptz created_at
  }
  messages {
    uuid id PK
    uuid conversation_id FK
    uuid sender_id FK
    varchar message_type
    text content
    varchar status
    timestamptz created_at
  }
  conversations ||--o{ messages : "contains"
```

## Security

1. **Row Level Security (RLS)**:
   - Access to conversations and messages is restricted at the DB layer using RLS rules checking `auth.uid() = seeker_id OR auth.uid() = provider_id`.
   
2. **Server-Side Authorization**:
   - Every function validates caller token context before querying data or executing database operations.
