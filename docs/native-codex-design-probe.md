# Verify native Codex design hook execution

An intact skill directory and a trusted hook definition do not establish that the
hook runs successfully. This command exercises the installed native client using
a local fixture provider. It performs no external inference and changes no shared
configuration, hook trust, repository files, or MCP installation.

With machine admission and an existing private evidence directory, run:

```powershell
python scripts/probe-codex-design-hooks.py --codex-exe <native-codex.exe> --cwd <project> --output-dir <private-evidence-directory>
```

Run the same command separately with `--tool-path native-apply-patch` and
`--tool-path native-shell` to test those actual built-in paths. The default is
`dynamic-write`, retaining compatibility with earlier receipts. Each invocation
has its own private outputs and receipt; success on one path never approves
another. This is a diagnostic, not a hook installer.

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

Two deterministic responses request the selected fixture tool. For dynamic
`Write`, the allowed request must reach the handler once and produce the exact private text.
A synthetic, nonfunctional secret-shaped string must trigger a native pre-tool
block before the handler is called. The denied file must remain absent. The
client independently refuses every other target or payload; that fallback refusal
cannot satisfy the native-denial verdict.

For native `apply_patch`, no dynamic tool is registered and the client never
emulates the write. A custom tool response supplies a fixed Add File patch to the
built-in handler. The allowed case needs exactly one completed native file-change
event and zero client tool calls. The denied case needs no completed native
file-change event, an actual pre-tool block, and an absent denied file.

For native shell, a fixed `exec_command` response runs one exclusive text write.
Windows uses PowerShell and .NET CreateNew; other platforms use the current
Python executable through POSIX shell quoting. The allowed case needs exactly
one successful native command event. The denied case needs zero successful
commands, a native pre-tool block, and an absent denied file. An unsuccessful
allow command means unverified execution, even if no denied file was created.
Both built-in modes retain thread read-only defaults and give that turn a
workspace-write sandbox with the admitted private output root. The project cwd
can also be writable under native workspace semantics; all constructed tool
inputs target only the private fixture. No external model chooses tool inputs.

The shell case deliberately uses a nonfunctional synthetic token-shaped string.
If a hook misses it, the private denied fixture remains as failure evidence.
It contains no credential. Never treat a completed turn, failed command, client
fallback refusal, or missing post-edit hook as successful coverage.

The receipt distinguishes the native tool boundary from Impeccable's post-edit
and Stop lifecycle. Failed or missing design hooks make the command exit 2 even
when both fixture turns complete. Hook notifications retain status, timing and
bounded error summaries. Request hashes, routing markers and source hashes are
recorded; raw prompts, response bodies, request headers and credentials are not.
Outputs remain private. Do not attach a raw receipt to a public issue.

Client fixture, receipt and shell writes use exclusive creation. Native patch
construction refuses existing or redirected targets before dispatch, but does
not promise atomic exclusive creation inside Codex's patch handler. Unique
per-invocation targets and the deterministic provider bound this diagnostic.
All targets must resolve inside the admitted directory. The local
HTTP server processes requests serially, bounds socket waits before reading any
headers, rejects invalid or excessive body sizes before reading their bodies,
and bounds recorded request counts. Failed native commands retain a bounded
private output excerpt so launch failures can be distinguished from hook denial.

This is a native lifecycle simulation. It does not establish model skill
application, unselected tool paths, MCP/code-mode coverage, bounded refinement under real defects, visual
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

The 2026-10-04 execution separately passed native `apply_patch`: the allow patch
produced one completed native file-change event, the synthetic deny produced none,
and Impeccable's post-edit and both Stop hooks completed. The native shell control
successfully wrote both private fixtures, received no matching pre-tool secret
block, and lacked Impeccable's post-edit event. It therefore failed coverage.
An earlier shell attempt could not launch the sandbox-hidden user-local Python
binary; it is preserved as an execution failure, not evidence of hook coverage.
The Windows fixture now uses the shell's .NET APIs without another interpreter.

Codex documents `Edit` and `Write` aliases for `apply_patch`, while shell commands
match `Bash`. Hooks on code-mode scripts apply to nested tool calls. A transcript
entry named `exec` alone cannot establish whether its nested patch or shell call
received a hook. The current CLI exercise does not approve this Codex app session
or another harness. Route hook configuration repairs through the configuration
owner, retain explicit disables, and use native trust review for changed hook
definitions. Do not hand-edit trust hashes or classify this diagnostic as a fix.

Protocol references: [Codex app-server](https://developers.openai.com/codex/app-server/),
[hooks](https://developers.openai.com/codex/hooks),
[custom providers](https://developers.openai.com/codex/config-advanced/).
