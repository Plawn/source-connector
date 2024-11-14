FROM denoland/deno:alpine-2.0.4

WORKDIR /app

COPY deno.json .
COPY deno.lock .
COPY src .

RUN deno install --entrypoint src/main.ts

CMD ["deno", "run", "--allow-env", "--allow-read", "--allow-net", "--env-file", "src/main.ts"]

EXPOSE 8000