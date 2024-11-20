FROM denoland/deno:2.0.2

ENV PORT=80

WORKDIR /app

COPY deno.json .
COPY deno.lock .
COPY app ./app

RUN deno task build

COPY drizzle.config.ts .

COPY static ./static

ENTRYPOINT deno -A npm:drizzle-kit generate && \
           deno -A npm:drizzle-kit migrate && \
           ./dist/app
