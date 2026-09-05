# Brand experience protocol

Status: proposed extension. Current product decisions govern proposition and availability; approved brand references govern identity. Record conflicts explicitly when older pack copy describes a superseded product model. This protocol does not revise those source decisions.

A brand should help a person anticipate a useful experience and recognise it when it happens. Define what the person will do, the evidence that it worked, and the cue that lets them remember the brand at the next relevant moment.

## Required brief

Every active product or campaign brief names:
- A stable brand ID and the existing brand-pack path.
- A product ID, owning repository, surface and accountable owner.
- A concrete audience situation and one current, deliverable promise.
- A voluntary role the task helps the person practise.
- Existing visual, verbal or sonic cue references and their approval state.
- The smallest useful action and its observable completion event.
- A real specimen, source and proof limit.
- The next relevant action after value, including any cross-brand handoff.
- A measurement plan, reviewer, version and decision status.

The [brief template](../examples/brand-experience-brief.json) is planning data. It is not a runtime schema, proof of adoption or permission to change a public identity. Never use a generated brief to override the immutable design contract.

## Experience sequence

Use a recognizable cue near a credible promise. Let the user do a small piece of the actual work. Confirm the result accurately and give them control over saving, sharing or continuing it. Keep the cue associated with that result across approved formats.

For FrankX this can be an architecture decision made explicit. For GenCreator it can be a source-linked draft that the creator reviews and exports. For Arcanea it can be a connected world seed that remains coherent as the creator develops it. Each uses its own brand pack.

Use accurate states: drafted, reviewed, exported and published mean different things. A click on an export control is not proof of a successful export. A static demo must be labelled as a demo.

## Portfolio boundaries

One product has one owning brand, even when distributed through several sites or marketplaces. A brand, domain, legal owner, product, artist, imprint and community are separate entities.

Cross-brand descriptions name the visitor's task. State technical dependencies only when they exist. Endorsement language must distinguish authorship, portfolio membership, technical integration and external endorsement.

Reuse stable brand cues without imposing shared fonts, colors or motion on the entire portfolio. Preserve each pack's surface modes. An identity exploration is not an approved mark.

## Distribution

Adapt one source-backed product story into relevant formats: a demonstration, an annotated specimen, a lesson, a product listing and a useful follow-up. Each derivative retains the product version, proof source, availability and owner.

Books and workbooks should make the brand's practice tangible. Templates should retain an inspectable worked example. Software confirms actual completion. Media should show the work at the moment the brand cue appears. Gatherings create a participant contribution.

Maintain recognition while varying the stories. Repetition of the same unsupported claim does not create proof.

## Evidence and measurement

Keep experimental priming results separate from product promises. The [Apple/IBM study](https://doi.org/10.1086/527269) does not establish an uplift for another brand. A [preregistered stereotype-susceptibility replication](https://doi.org/10.1027/1864-9335/a000193) did not reproduce the original performance effect. No demographic stereotype is needed to invite someone into useful work.

Use [category entry points](https://marketingscience.info/learn-with-us/commercial-research/identifying-and-prioritising-category-entry-points) to define the situations in which people should remember the brand. Test comprehension, correct attribution, completed work and meaningful return separately.

Record a baseline before claiming lift. An experiment declares one primary outcome, assignment unit, denominator, observation window and stop rule. Small task-observation sessions guide design; they do not establish population effect sizes.

Use the product's existing analytics and consent mechanisms. Event properties may include brand_id, product_id, surface_id, experiment_id, variant, asset_version and proof_id. Raw user content and sensitive identity inferences do not belong in events.

## Review

A reviewer must be able to identify the audience situation, the task, the evidence and the next action without reading the strategy.

Reject a brief when the promise is unavailable, the proposed identity relies on superiority over other people, proof is fabricated, the cue has no approved source, or the brand could be swapped without changing the task.

Public interface changes still follow the existing web release gate. This protocol adds a product-experience question to planning; it does not create a new deployment approval or bypass an existing one.
