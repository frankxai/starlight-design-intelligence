# Hermes Media Job Workflow

Hermes should:
1. Create the `media-job.json` using the template
2. Delegate rendering to the appropriate profile or tool (Satori/Playwright)
3. Monitor the job folder for evidence.json
4. Run visual QA and update the decision field
5. Feed results back into Hermes memory for automatic learning

Example command pattern:
hermes -p arcanea chat -q "Execute media-job 2026-07-07-frankx-social-static using the brand-image-system runtime"