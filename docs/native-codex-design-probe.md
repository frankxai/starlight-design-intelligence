# Verify native Codex design hook execution

An intact skill directory and a trusted hook definition do not establish that the
hook runs successfully. This command exercises the installed native client using
a local fixture provider. It performs no external inference and changes no shared
configuration, hook trust, repository files, or MCP installation.

With machine admission and an existing private evidence directory, run:

```powershell
python scripts/probe-codex-design-hooks.py --codex-exe <native-codex.exe> --cwd <project> --output-dir <private-evidence-directory>
```

Use the native executable reported by `codex doctor`. This probe uses Python 3.11+
standard-library modules and the documented experimental app-server APIs. It was
exercised on Codex 0.160.0. The native client rejected `sandbox: readOnly`; the
accepted thread-start value is `read-only`. Check the installed version's protocol
when upgrading.

The command disables MCP startup for its own invocation, injects a bounded design
catalog through the thread's runtime overrides, and retains system, security and
selected gateway entries. Existing explicit skill disables remain disabled.
Default skill discovery and the user's shared configuration remain unchanged.
Native `$skill` activation outside this fixture must be verified separately.

Two deterministic responses request the local dynamic `Write` fixture. The
allowed request must reach the handler once and produce the exact private text.
A synthetic, nonfunctional secret-shaped string must trigger a native pre-tool
block before the handler is called. The denied file must remain absent. The
client independently refuses every other target or payload; that fallback refusal
cannot satisfy the native-denial verdict.

The receipt distinguishes the native tool boundary from Impeccable's post-edit
and Stop lifecycle. Failed or missing design hooks make the command exit 2 even
when both fixture turns complete. Hook notifications retain status, timing and
bounded error summaries. Request hashes, routing markers and source hashes are
recorded; raw prompts, response bodies, request headers and credentials are not.
Outputs remain private. Do not attach a raw receipt to a public issue.

Fixture and receipt files use exclusive creation and must resolve inside the
admitted directory. Existing files and redirected targets are refused. The local
HTTP server processes requests serially, bounds socket waits before reading any
headers, rejects invalid or excessive body sizes before reading their bodies,
and bounds recorded request counts.

This is a native lifecycle simulation. It does not establish model skill
application, shell/MCP coverage, bounded refinement under real defects, visual
quality, legal rights, production acceptance or adoption by other harnesses.
All public UI and brand acceptance gates still apply.

The alternative is the offline design-capability installer check. Keep that check
for pinned sources and projections. Use this probe additionally for execution:
the 2026-10-03 observation found trusted Impeccable hooks failing because engine
0.1.11 was absent while engine 0.1.5 was cached. It also found 829 native skill
entries exhausting the catalog budget; a session-only 27-entry selection retained
the design routing description. Neither defect was resolved by a filesystem PASS.

Repair a missing engine through the owning installation lane after storage
admission permits it. Preserve failed receipts and the existing security hooks.
Do not bypass hook trust or treat a different engine version as the required one.
Shared catalog changes need the configuration owner's scoped review and recovery
receipt; this fixture does not authorize or apply those changes.

Protocol references: [Codex app-server](https://developers.openai.com/codex/app-server/),
[hooks](https://developers.openai.com/codex/hooks),
[custom providers](https://developers.openai.com/codex/config-advanced/).
