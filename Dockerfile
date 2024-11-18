FROM denoland/deno:2.0.2

WORKDIR /app

COPY . .

RUN deno task build

CMD [ "./dist/app" ]
