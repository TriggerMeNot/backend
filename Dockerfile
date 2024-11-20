FROM denoland/deno:2.0.2

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

WORKDIR /app

COPY deno.json .
COPY deno.lock .
COPY app ./app

RUN deno task build

COPY drizzle.config.ts .

RUN deno -A npm:drizzle-kit generate
RUN deno -A npm:drizzle-kit migrate

RUN rm -rf drizzle

RUN rm deno.json
RUN rm deno.lock
RUN rm -rf app

RUN mv dist/app .
RUN rm -rf dist

COPY static ./static

CMD [ "./app" ]
