# Hermes Media Job Workflow

Hermes should:
1. Read `hermes-adapter.json`, then copy the schema-valid `media-job-template.json` to the job folder and replace its draft values.
2. Delegate rendering to the appropriate profile or tool (Satori/Playwright)
3. Monitor the job folder for evidence.json
4. Run visual QA, record the selected workflow's 30-point score, and keep the
   decision at `iterate` or `restart` below its threshold.
5. Add named approval metadata only after the real exports and evidence are
   inspected.
6. Run the media validator with the job path and explicit
   `STARLIGHT_ASSET_ROOT` before handoff or publishing.
7. Feed results back into Hermes memory for automatic learning

Example command pattern:
hermes -p arcanea chat -q "Execute media-job 2026-07-07-frankx-social-static using the brand-image-system runtime"
