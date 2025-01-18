FROM denoland/deno:2.1.1

ENV PORT=80

WORKDIR /app

COPY deno.json .
COPY deno.lock .
COPY app ./app
COPY drizzle.config.ts .
COPY static ./static

RUN deno install --allow-scripts=npm:bcrypt@5.1.1

ENTRYPOINT deno -A npm:drizzle-kit push && \
           deno task start
