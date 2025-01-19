# TriggerMeNot Server

## Tech Stack

Only Open Source and Free Software technologies are used in this project.

### API

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

- Advantages of modern JavaScript features
- Static type checking
- Most used language for web development

[![Deno](https://img.shields.io/badge/Deno-white?style=for-the-badge&logo=deno&logoColor=464647)](https://deno.com/)

- Good performance [Benchmarks](https://deno.com/benchmarks)
- Secure by default
- Built-in TypeScript support
- Format / linting and testing tools
- Built with web standards

Comparison with Node.js and Bun:

| Deno                        | Node.js                      | Bun                          |
| --------------------------- | ---------------------------- | ---------------------------- |
| Secure by default           | Insecure by default          | Secure by default            |
| Built-in TypeScript support | Requires TypeScript compiler | Requires TypeScript compiler |
| Built-in formatting         | Requires external tools      | Requires external tools      |
| Built-in linting            | Requires external tools      | Requires external tools      |
| Built-in testing            | Requires external tools      | Requires external tools      |
| Built with web standards    | Not built with web standards | Not built with web standards |

[![Hono](https://img.shields.io/badge/hono-E36002?style=for-the-badge&logo=hono&logoColor=white)](https://hono.dev/)

- Fast and lightweight web framework
  [Benchmarks](https://hono.dev/docs/concepts/benchmarks)
- Easy to use
- Middleware support
- Build with web standards

Comparison with FastAPI and NestJS:

| Hono                     | FastAPI                      | NestJS                       |
| ------------------------ | ---------------------------- | ---------------------------- |
| TypeScript (any Runtime) | Python                       | TypeScript (Node.js Runtime) |
| Fast and lightweight     | Fast and lightweight         | Fast and lightweight         |
| Easy to use              | Easy to use                  | Not easy but not hard to use |
| Advanced Middleware      | Limited Middleware           | Advanced Middleware          |
| Own library              | Own library                  | Express or Fastify           |
| Built with web standards | Not built with web standards | Not built with web standards |

[![Drizzle](https://img.shields.io/badge/drizzle-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)

- Fast and lightweight ORM [Benchmarks](https://orm.drizzle.team/benchmarks)
- Easy to use
- Built for SQL databases

Comparison with Prisma:

| Drizzle          | Prisma                  |
| ---------------- | ----------------------- |
| Best performance | Good performance        |
| Easy to use      | Easy to use             |
| Built for SQL    | Built for SQL and NoSQL |

### Database

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

- Powerful and open-source relational database
- Supports JSON and JSONB data types

Comparison with MySQL, SQLite, and MongoDB:

| PostgreSQL | MySQL      | SQLite      | MongoDB  |
| ---------- | ---------- | ----------- | -------- |
| Powerful   | Popular    | Lightweight | Flexible |
| SQL        | SQL        | SQL         | NoSQL    |
| Relational | Relational | Relational  | Document |

### Deployment

[![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

- Containerization
- Easy to deploy
- Works on any platform

## Development

```bash
cp .env.dev.example .env.dev
```

Set the environment variables in the `.env.dev` file.

```bash
docker compose -f compose.yml up -d
```

```bash
deno install --allow-scripts=npm:bcrypt@5.1.1
```

```bash
deno -A --env-file=.env.dev npm:drizzle-kit push
```

```bash
deno task dev
```

## Production

```bash
cp .env.prod.example .env.prod
```

Set the environment variables in the `.env.prod` file.

```bash
docker compose -f compose.prod.yml up -d
```

## Routes Documentation

Go on running server and open the `/doc` or `/reference` route to see Routes
Documentation.

## Database

```mermaid
erDiagram

oauths {
    serial id PK
    integer user_id
    integer service_id
    text service_user_id
    text token
    integer token_expires_at
    text refresh_token
    integer refresh_token_expires_at
}

playgrounds {
    serial id PK
    text name
    integer user_id
}

reactionLinks {
    serial id PK
    integer trigger_id
    integer reaction_id
}

actions {
    serial id PK
    integer service_id
    text name
    text description
    jsonb settings
    jsonb params
}

reactionsPlayground {
    serial id PK
    integer playground_id
    integer reaction_id
    jsonb settings
    integer x
    integer y
}

oidcs {
    serial id PK
    integer user_id
    integer service_id
    text service_user_id
    text token
    integer token_expires_at
    text refresh_token
    integer refresh_token_expires_at
}

users {
    serial id PK
    text email
    text username
    text password
}

services {
    serial id PK
    text name
    text description
}

actionsPlayground {
    serial id PK
    integer playground_id
    integer action_id
    jsonb settings
    jsonb params
    integer x
    integer y
}

actionLinks {
    serial id PK
    integer trigger_id
    integer reaction_id
}

crons {
    serial id PK
    integer action_playground_id
    text cron
}

reactions {
    serial id PK
    integer service_id
    text name
    text description
    jsonb settings
}

oauths ||--o{ users : "user_id"
oauths ||--o{ services : "service_id"
playgrounds ||--o{ users : "user_id"
reactionLinks ||--o{ reactionsPlayground : "trigger_id"
reactionLinks ||--o{ reactionsPlayground : "reaction_id"
actions ||--o{ services : "service_id"
reactionsPlayground ||--o{ playgrounds : "playground_id"
reactionsPlayground ||--o{ reactions : "reaction_id"
oidcs ||--o{ users : "user_id"
oidcs ||--o{ services : "service_id"
actionsPlayground ||--o{ playgrounds : "playground_id"
actionsPlayground ||--o{ actions : "action_id"
actionLinks ||--o{ actionsPlayground : "trigger_id"
actionLinks ||--o{ reactionsPlayground : "reaction_id"
crons ||--o{ actionsPlayground : "action_playground_id"
reactions ||--o{ services : "service_id"
```
