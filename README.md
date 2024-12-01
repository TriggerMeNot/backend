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
deno -A npm:drizzle-kit generate
```

```bash
deno -A --env-file=.env.dev npm:drizzle-kit migrate
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

Users {
    int id
    string name
    string email
    string password
    string role
    string createdAt
    string updatedAt
}

Services {
    int id
    string name
}

OAuths {
    int id
    int userId
    int serviceId
    string accessToken
    string refreshToken
}
OAuths |o--|| Users : owner
OAuths |o--|| Services : provider

Actions {
    int id
    int serviceId
    string name
}
Actions |o--|| Services : use

Reactions {
    int id
    int serviceId
    string name
}
Reactions |o--|| Services : use

Playgrounds {
    int id
    int userId
    string createdAt
    string updatedAt
}
Playgrounds |o--|| Users : owner

PlaygroundsActions {
    int id
    int playgroundId
    int actionId
    string settings
}
PlaygroundsActions |o--|| Playgrounds : actions
PlaygroundsActions |o--|| Actions : use

PlaygroundsReactions {
    int id
    int playgroundId
    int reactionId
    string settings
}
PlaygroundsReactions |o--|| Playgrounds : reactions
PlaygroundsReactions |o--|| Reactions : use
```
