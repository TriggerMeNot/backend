FROM denoland/deno:2.0.2

WORKDIR /app

COPY deno.json .
COPY deno.lock .
copy app ./app

RUN deno task build

RUN rm deno.json
RUN rm deno.lock
RUN rm -rf app

RUN mv dist/app .
RUN rm -rf dist

COPY static ./static

CMD [ "./app" ]
