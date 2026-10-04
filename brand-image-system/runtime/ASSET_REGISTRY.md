# File-verified asset registrations

The runtime registry starts empty. The former fabricated approval and usage record
is preserved byte-for-byte in `examples/asset-registry.legacy-example.json`; it is
historical sample data and fails the runtime schema.

`scripts/register-media-asset.mjs` verifies an existing approved media-job assertion,
an exported VIS receipt, all declared output bytes, release-evidence bytes, and each
adjacent `<output>.vis.provenance.json`. The sidecar must retain prompt, provider,
model, seed (explicit `null` when unavailable), agent session, and matching VIS
asset/version/hash. Output paths, rights states and receipt lineage must agree.
No artifact content or prompt is copied into the registry or printed.

Registration finds and revalidates the exact local versions that were reviewed.
It replaces the echo-only command's unconditional success. It does not create
artwork or compensate for missing brand, independent or human review.

## Preview, register and revalidate

Run from the owning assigned checkout after its routing and ownership checks:

```sh
node scripts/register-media-asset.mjs --job /assets/jobs/edition/media-job.json \
  --binding /assets/jobs/edition/vis-receipt.json --asset-root /assets
# Use the exact expectedRegistrySha256 returned by the preview:
node scripts/register-media-asset.mjs --job /assets/jobs/edition/media-job.json \
  --binding /assets/jobs/edition/vis-receipt.json --asset-root /assets \
  --apply --expected-registry-sha256 <preview-hash>
node scripts/register-media-asset.mjs --audit --asset-root /assets
```

The old shell command delegates to this CLI and propagates its exit status.
Missing arguments return 2. Verification or write failures return 1. Preview
changes no registry, asset or lock. An exact repeat is a no-op; an ID with changed
bytes fails and retains the old record. A different version needs a new media job.
Audit re-reads all job, receipt, evidence, output and sidecar bytes. Kernel CI uses
the same check: a nonempty registry without the declared asset root fails rather
than claiming verification over inaccessible assets.

Apply acquires an exclusive cooperative writer lock, checks expected registry
bytes, flushes a new file, rechecks sources and registry, renames, and verifies
readback. Normal error paths remove only this operation's lock/temp file. A crash
may leave its lock; inspect the owning operation before recovery. Never remove
a foreign lock by age. This is optimistic protection against noncooperating
writers, not a filesystem-wide transaction or a power-loss durability guarantee.

Selected paths reject links/junctions and containment escapes. Each file is bounded
to 64 MiB, JSON to 1 MiB, a job to 32 outputs and 128 MiB of read data. No upload,
inference, database query, publication, asset deletion or deployment occurs.
Assets remain in the declared existing asset mirror.

## Authority and preserved source

`file-verified` records local byte verification at registration time. Approval and
rights are exported assertions. A forged but internally consistent receipt cannot
authenticate a human or live VIS database state. Publication and visual/identity
acceptance require the owning human, independent review and release boundary.
The generation/taste ledgers and memory synchronization also need separate proof.

The VIS binding schema is reused unchanged from the retained Hermes lane at
`efeccd7a7a66f8ac1b880ccf37b9e58158e0df0b`, SHA-256
`200d3037cf86f6cec0052564525dc82c2586002e739fa0d9b6594c3b8d11822c`.
Its unfinished worktree remains intact. The sidecar schema is mirrored unchanged
from `frankxai/visual-intelligence` commit
`91918bfa7959491e8c7f631cc4e03b067e17ea0d`, SHA-256
`a198d2c0294c101e11747f92432cb5c9d80e1ff08d8a30fe59dec4352a1d435d`.
The public schema URL returned 404 on 4 October 2026; this local mirror makes
validation reproducible without inventing a replacement schema. Its nullable
generation fields are tightened by registration to retain replication information.
