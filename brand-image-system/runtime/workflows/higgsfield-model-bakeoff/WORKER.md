# Worker

1. Load the brand pack, surface workflow, provider contract, and model router.
2. Validate the job without executing generation.
3. Run account and per-candidate live cost preflights.
4. Write `preflight.json` and stop when any budget gate fails.
5. On explicit `--execute`, acquire the shared generation lock and append the preflight event before spending credits.
6. Generate sequentially and stop on the first ambiguous failure.
7. Download every returned output into the candidate directory.
8. Write a VIS-compatible provenance sidecar with prompt, model, settings, local path, hash, job, and rights state.
9. Append one generation ledger event per completed candidate.
10. Write `run-receipt.json` with state `generated_unreviewed`.
11. Hand off to the verifier. The worker never scores its own output as final.

The worker releases its own lock at exit. A stale lock is never removed automatically; verify the owning process and account transactions first.

The worker must preserve failed candidates and receipts. Rejection evidence is part of the model router’s learning data.
