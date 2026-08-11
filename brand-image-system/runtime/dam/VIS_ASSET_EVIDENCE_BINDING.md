# VIS Asset Evidence Binding

Approved or published media jobs must carry a
`starlight.visAssetEvidenceBinding.v1` receipt. It binds every declared output to
the corresponding VIS `asset_id`, immutable `version_id`, SHA-256, rights state,
approval state, provenance event, lineage, and release-evidence hash.

## Fail-closed policy

The runtime rejects an approved or published job when any output has no binding,
its on-disk SHA-256 differs from the bound VIS version, its rights are unknown,
needs review, or blocked, its VIS approval state is not `approved`, its lineage is
malformed, or its release-evidence hash does not match the job evidence artifact.

A draft job intentionally does not require a VIS receipt. An iteration may revise
its candidate; only a passing approved/published state needs immutable bindings.

## Authority boundary

This repository validates an exported VIS receipt and the referenced local bytes.
It does **not** query a developer's ignored `data/vis.sqlite` database or pretend
to provide a cryptographic signature that VIS has not emitted. The VIS repository
must provide the trusted receipt emitter and any signer/revocation service before
this contract can be represented as direct live-database proof.

The contract is compatible with VIS's published identifiers and states:
`asset_id`, `version_id`, SHA-256, `rights_status`, `approval_status`, provenance
events, derivative lineage, and publication records.
