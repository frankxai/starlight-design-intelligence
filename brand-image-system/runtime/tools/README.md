# Runtime Tools

## Higgsfield bake-off

Live preflight only:

```powershell
node .\brand-image-system\runtime\tools\higgsfield-bakeoff.mjs `
  --job .\brand-image-system\runtime\examples\frankx-higgsfield-bakeoff.json
```

Execute after reviewing `preflight.json` and receiving any required approval:

```powershell
node .\brand-image-system\runtime\tools\higgsfield-bakeoff.mjs `
  --job .\brand-image-system\runtime\examples\frankx-higgsfield-bakeoff.json `
  --execute
```

The default runner ceiling is five credits. Do not raise `HIGGSFIELD_MAX_JOB_CREDITS` merely to make a blocked job run. The CLI/MCP lane is metered even when a model is Unlimited in the web UI.

Run unit tests:

```powershell
node --test .\brand-image-system\runtime\tests\higgsfield-bakeoff.test.mjs
```

The runner does not publish, schedule, select a winner, or approve rights. Its terminal state is `generated_unreviewed`.
