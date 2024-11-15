

start:
    deno run --allow-net src/main.ts

# test trustpilot
test-t:
    deno run --allow-net --allow-env --env-file test.ts

# test slack
test-s: 
    deno run --allow-net --allow-env --env-file test.ts