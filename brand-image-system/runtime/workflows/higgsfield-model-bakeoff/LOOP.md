# Higgsfield Model Bake-off Sub-loop

## Role

This sub-loop performs one bounded provider comparison inside the existing Brand Image Factory. It does not choose publishing accounts, schedule content, or publish.

## Definition Of Done

- One valid model-bakeoff job exists.
- Machine preflight is `allow` or `bounded`.
- Every candidate has a live cost receipt.
- Predicted total is inside the approved cap and post-run balance guardrail.
- Generated assets are downloaded locally with VIS-compatible provenance.
- A verifier inspects every actual export and writes a six-dimension 30-point score.
- At most one master is promoted; a no-winner outcome is valid.
- Any downstream brand packet stops at `approval_pending`.

## Iteration Budget

The default run is three candidates. One targeted iteration is allowed only when the same approved cap covers it. Stop after one promoted master or after the cap makes further learning irrational.

## State

Durable state lives in the job directory under the local Higgsfield workspace. This tracked folder defines the contract only. `STATE.md` records qualification state; `RUNS.md` points to completed proof cycles.

## Scheduling

Manual-only until three clean cycles prove complete cost, provenance, visual, rights, and approval behavior. A successful first run is not permission to schedule.
