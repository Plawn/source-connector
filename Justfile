

start:
    deno run --allow-net src/main.ts

# test slack
test: 
    deno run --allow-net --allow-env --env-file test.ts