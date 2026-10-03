"""Bounded, model-free native hooks exercise with session-only skill scoping.

Uses documented app-server thread/turn APIs, dynamic tools, and hook events.
Only the explicit private fixture output can be written. No trust/config writes,
credential reads, external inference, repo mutation, or MCP child startup.
"""
import argparse
import hashlib
import http.server
import json
import os
from pathlib import Path
import queue
import shlex
import subprocess
import sys
import threading
import time
import tomllib
import uuid

SAFE = "Native model-free lifecycle fixture. No product implementation.\n"
TOOL_PATHS = ("dynamic-write", "native-apply-patch", "native-shell")


def private_directory(path):
    root = path.resolve()
    if not root.is_dir():
        raise ValueError("The output directory must already exist")
    if any((parent / ".git").exists() for parent in (root, *root.parents)):
        raise ValueError("Keep private evidence outside Git repositories")
    return root


def write_private_fixture(path, root, text):
    if path.parent != root or path.resolve().parent != root:
        raise ValueError("Private artifact path escaped its admitted directory")
    with path.open('x', encoding='utf-8') as file:
        file.write(text)


def new_fixture_target(path, root):
    if any(ord(char) < 32 or ord(char) == 127 for char in str(path)):
        raise ValueError("Native fixture target cannot contain control characters")
    if path.parent != root or path.resolve().parent != root or path.exists() or path.is_symlink():
        raise ValueError("Native fixture target must be new and contained")


def fixture_patch(path, root, text):
    """Construct only a new, contained fixture; never accept a model-supplied patch."""
    new_fixture_target(path, root)
    return ("*** Begin Patch\n*** Add File: " + path.as_posix() + "\n"
            + "\n".join("+" + line for line in text.splitlines())
            + "\n*** End Patch")


def fixture_shell(path, root, text):
    """The actual native shell runs only this exclusive, contained text write."""
    new_fixture_target(path, root)
    if os.name == "nt":
        quote = lambda value: "'" + value.replace("'", "''") + "'"
        return ("$starlightFixtureBytes = [Text.Encoding]::UTF8.GetBytes(" + quote(text) + ")\n"
                "$starlightFixtureStream = [IO.File]::Open(" + quote(str(path))
                + ", [IO.FileMode]::CreateNew, [IO.FileAccess]::Write)\n"
                "try { $starlightFixtureStream.Write($starlightFixtureBytes, 0, $starlightFixtureBytes.Length) }\n"
                "finally { $starlightFixtureStream.Dispose() }")
    code = ("from pathlib import Path\nwith Path(" + repr(str(path))
            + ").open('x', encoding='utf-8') as file:\n    file.write(" + repr(text) + ")")
    return shlex.quote(sys.executable) + " -c " + shlex.quote(code)


def fixture_request_size(length, path):
    try:
        size = int(length)
    except (TypeError, ValueError):
        raise ValueError("Invalid fixture body size") from None
    if not 0 < size <= 2_000_000 or path != "/v1/responses":
        raise ValueError("Fixture request boundary")
    return size


def skill_scope(native):
    names = {"emil-design-eng", "apple-design", "animate", "review-animations",
             "improve-animations", "find-animation-opportunities", "animation-vocabulary",
             "pick-ui-library", "emil-prototype", "ask-sonner", "animate-expo",
             "write-swift", "mobile-native", "design-capability-routing",
             "impeccable:impeccable", "frontend-design:frontend-design", "openai-docs",
             "agent-workspace-bootstrap", "pp", "starlight-storage-intelligence",
             "starlight-activation-router:starlight-si",
             "starlight-activation-router:starlight-so",
             "starlight-activation-router:acos-router"}
    entries, preserved = [], []
    for skill in native:
        security = any(term in skill["name"].lower()
                       for term in ("security", "secret-guard", "search-safety"))
        keep = skill["scope"] in ("system", "admin") or security or skill["name"] in names
        if "stale-backup" in skill["path"] and not security:
            keep = False
        enabled = bool(keep and skill["enabled"])
        entries.append({"path": skill["path"], "enabled": enabled})
        if enabled:
            preserved.append({"name": skill["name"], "path": skill["path"]})
    return entries, preserved


def verdict(receipt):
    cases = {case["case"]: case for case in receipt["cases"]}
    runs = [event for event in receipt["notifications"]
            if event.get("method") == "hook/completed"]
    path = receipt.get("toolPath", "dynamic-write")
    dynamic = (path == "dynamic-write"
               and cases.get("allow", {}).get("clientToolCalls") == 1
               and cases.get("deny", {}).get("clientToolCalls") == 0)
    native = (path == "native-apply-patch"
              and all(case.get("clientToolCalls") == 0 for case in cases.values())
              and cases.get("allow", {}).get("nativeFileChanges") == 1
              and cases.get("deny", {}).get("nativeFileChanges") == 0)
    shell = (path == "native-shell"
             and all(case.get("clientToolCalls") == 0 for case in cases.values())
             and cases.get("allow", {}).get("nativeShellCommands") == 1
             and cases.get("deny", {}).get("nativeShellCommands") == 0)
    boundary = (not receipt["failure"] and receipt["sharedConfigUnchanged"]
                and receipt["serverClosed"] and receipt["nativeProcessExit"] == 0
                and set(cases) == {"allow", "deny"}
                and all(case["completed"] and case.get("turnStatus") == "completed"
                        for case in cases.values())
                and (dynamic or native or shell)
                and receipt["allowContentMatches"] and receipt["denyFileAbsent"]
                and any(event["case"] == "deny"
                        and event["run"]["eventName"] == "preToolUse"
                        and event["run"]["status"] == "blocked" for event in runs))
    relevant = [event for event in runs if "impeccable" in event["run"]["id"]]
    expected = {("allow", "postToolUse"), ("allow", "stop"), ("deny", "stop")}
    completed = {(event["case"], event["run"]["eventName"])
                 for event in relevant if event["run"]["status"] == "completed"}
    failed = any(event["run"]["status"] != "completed" for event in relevant)
    design = "failed" if failed else "verified" if expected <= completed else "missing"
    routing = bool(receipt["observations"] and all(
        observation["routingContextPresent"] and observation["skillDescriptionPresent"]
        for observation in receipt["observations"]))
    unexpected_auth = any(observation.get("authorizationHeaderPresent", False)
                          for observation in receipt["observations"])
    return {"nativeToolBoundaryVerified": bool(boundary),
            "toolPath": path,
            "nativeRoutingVerified": routing,
            "impeccableLifecycle": design,
            "unexpectedFixtureAuthentication": unexpected_auth,
            "hostProbePassed": bool(boundary and routing and not unexpected_auth
                                    and design == "verified"),
            "scope": "Native lifecycle fixture; no model skill application or visual approval"}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--codex-exe", type=Path, required=True)
    parser.add_argument("--cwd", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--tool-path", choices=TOOL_PATHS, default="dynamic-write")
    args = parser.parse_args()
    tool_path = args.tool_path
    ROOT = private_directory(args.output_dir)
    EXE, CWD = args.codex_exe.resolve(), args.cwd.resolve()
    if not EXE.is_file() or not CWD.is_dir():
        raise ValueError("Use an existing native Codex executable and working directory")
    codex_home = Path(os.environ.get("CODEX_HOME", Path.home() / ".codex"))
    CONFIG, HOOKS = codex_home / "config.toml", codex_home / "hooks.json"
    tag = "native-design-" + uuid.uuid4().hex
    OUTPUT, BLOCKED_OUTPUT = ROOT / (tag + "-allow.txt"), ROOT / (tag + "-deny.txt")
    config = tomllib.loads(CONFIG.read_text(encoding="utf-8-sig"))
    if "starlight_native_fixture" in config.get("model_providers", {}):
        raise ValueError("Existing fixture provider would inherit configuration; scope not attempted")
    protected = [path for path in (CONFIG, HOOKS) if path.is_file()]
    before = {str(path): digest(path) for path in protected}
    native, entries, preserved = [], [], []
    observations, notifications, cases = [], [], []
    state = {"case": "allow", "responses": 0, "clientToolCalls": 0,
             "nativeFileChanges": 0, "nativeShellCommands": 0}

    class Handler(http.server.BaseHTTPRequestHandler):
        def setup(self):
            self.request.settimeout(5)
            super().setup()

        def log_message(self, *_args):
            pass

        def do_POST(self):
            try:
                size = fixture_request_size(self.headers.get("Content-Length"), self.path)
            except ValueError:
                self.send_error(400, "Fixture boundary")
                return
            raw = self.rfile.read(size)
            try:
                request = json.loads(raw)
            except (UnicodeDecodeError, ValueError):
                self.send_error(400, "Fixture expects plain JSON")
                return
            if len(raw) != size or not isinstance(request, dict):
                self.send_error(400, "Fixture expects a complete JSON object")
                return
            state["responses"] += 1
            if state["responses"] > 4:
                self.send_error(400, "Fixture response budget")
                return
            content = json.dumps(request.get("input", []))
            observations.append({"case": state["case"], "response": state["responses"], "requestSha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw), "routingContextPresent": "Design skill routing: read these SKILL.md" in content, "skillDescriptionPresent": "Select installed design and motion expertise for UI implementation and review." in content, "tools": [{"type": t.get("type"), "name": t.get("name")} for t in request.get("tools", [])], "authorizationHeaderPresent": bool(self.headers.get("Authorization")), "externalInference": False})
            rid = state["case"] + "-" + str(state["responses"])
            if state["responses"] == 1:
                target = OUTPUT if state["case"] == "allow" else BLOCKED_OUTPUT
                content_text = SAFE if state["case"] == "allow" else "sk-" + "syntheticfixture" + "A" * 30
                if args.tool_path == "native-apply-patch":
                    item = {"type": "custom_tool_call", "call_id": "fixture-patch-" + state["case"], "name": "apply_patch", "input": fixture_patch(target, ROOT, content_text)}
                elif args.tool_path == "native-shell":
                    item = {"type": "function_call", "call_id": "fixture-shell-" + state["case"], "name": "exec_command", "arguments": json.dumps({"cmd": fixture_shell(target, ROOT, content_text), "workdir": str(ROOT), "yield_time_ms": 1000, "max_output_tokens": 200})}
                else:
                    item = {"type": "function_call", "call_id": "fixture-write-" + state["case"], "name": "Write", "arguments": json.dumps({"file_path": str(target), "content": content_text})}
            else:
                item = {"type": "message", "role": "assistant", "id": "fixture-done", "content": [{"type": "output_text", "text": "Native lifecycle fixture completed. No design acceptance is claimed."}]}
            events = [{"type": "response.created", "response": {"id": rid}}, {"type": "response.output_item.done", "item": item}, {"type": "response.completed", "response": {"id": rid, "usage": {"input_tokens": 0, "input_tokens_details": None, "output_tokens": 0, "output_tokens_details": None, "total_tokens": 0}}}]
            body = "".join("event: " + e["type"] + "\ndata: " + json.dumps(e) + "\n\n" for e in events).encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

    server = http.server.HTTPServer(("127.0.0.1", 0), Handler)
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    overrides = ['model_provider="starlight_native_fixture"', 'model_providers.starlight_native_fixture.name="Model-free native fixture"', 'model_providers.starlight_native_fixture.base_url="http://127.0.0.1:' + str(server.server_port) + '/v1"', 'model_providers.starlight_native_fixture.wire_api="responses"', 'model_providers.starlight_native_fixture.requires_openai_auth=false', 'model_providers.starlight_native_fixture.supports_websockets=false', 'model_providers.starlight_native_fixture.request_max_retries=0', 'model_providers.starlight_native_fixture.stream_max_retries=0', 'features.enable_request_compression=false']
    for name in config.get("mcp_servers", {}):
        if not all(char.isalnum() or char in "_-" for char in name):
            server.shutdown()
            server.server_close()
            raise ValueError("Unexpected MCP key; inspect native override syntax")
        overrides.append("mcp_servers." + name + ".enabled=false")
    command = [str(EXE)]
    for item in overrides:
        command += ["-c", item]
    command += ["app-server", "--stdio"]
    env = os.environ.copy()
    env["NO_PROXY"] = "127.0.0.1,localhost"
    env["STARLIGHT_HOOK_LOG_ROOT"] = str(ROOT / "native-lifecycle-hook-events")
    try:
        process = subprocess.Popen(command, cwd=CWD, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, encoding="utf-8", env=env, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
    except BaseException:
        server.shutdown()
        server.server_close()
        server_thread.join(timeout=2)
        raise
    messages = queue.Queue(maxsize=2048)
    sequence = 0
    def read_messages():
        for line in process.stdout:
            try:
                message = json.loads(line)
            except ValueError:
                message = {"method": "probe/protocolError"}
            try:
                messages.put(message, timeout=1)
            except queue.Full:
                return
    reader = threading.Thread(target=read_messages, daemon=True)
    reader.start()

    def send(value):
        process.stdin.write(json.dumps(value) + "\n")
        process.stdin.flush()

    def handle(message):
        if len(notifications) >= 512:
            raise RuntimeError("Native notification budget exceeded")
        if message.get("method") == "probe/protocolError":
            raise RuntimeError("Native protocol returned invalid JSON")
        method = message.get("method", "")
        params = message.get("params", {})
        if method == "item/tool/call":
            state["clientToolCalls"] += 1
            args = params.get("arguments", {})
            if isinstance(args, str):
                args = json.loads(args)
            if tool_path != "dynamic-write" or state["case"] != "allow" or params.get("tool") != "Write" or Path(args.get("file_path", "")).resolve() != OUTPUT.resolve() or args.get("content") != SAFE:
                send({"id": message["id"], "result": {"contentItems": [{"type": "inputText", "text": "Private fixture boundary rejected execution."}], "success": False}})
            else:
                write_private_fixture(OUTPUT, ROOT, SAFE)
                send({"id": message["id"], "result": {"contentItems": [{"type": "inputText", "text": "Private fixture written."}], "success": True}})
        elif "id" in message and "method" in message:
            raise RuntimeError("Unexpected server request: " + method)
        if method.startswith("hook/"):
            run = params.get("run", {})
            record = {"case": state["case"], "method": method, "run": {k: run[k] for k in ("id", "eventName", "hookKey", "status", "displayName", "durationMs", "exitCode", "decision", "reason", "error") if k in run}, "runKeys": list(run)}
            if method == "hook/completed" and run.get("status") in ("failed", "blocked"):
                record["failureEntries"] = run.get("entries", [])
            notifications.append(record)
        elif method == "error":
            notifications.append({"case": state["case"], "method": method, "message": str(params.get("error", {}).get("message", ""))[:1000]})
        elif method in ("turn/completed", "item/completed"):
            item = params.get("item", {})
            if method == "item/completed" and item.get("type") == "fileChange" and item.get("status") == "completed":
                state["nativeFileChanges"] += 1
            if method == "item/completed" and item.get("type") == "commandExecution" and item.get("status") == "completed" and item.get("exitCode") == 0:
                state["nativeShellCommands"] += 1
            if method == "turn/completed" or item.get("type") in ("dynamicToolCall", "fileChange", "commandExecution"):
                notifications.append({"case": state["case"], "method": method, "itemType": item.get("type"), "status": params.get("turn", item).get("status"), "exitCode": item.get("exitCode")})
                if item.get("type") == "commandExecution" and item.get("status") == "failed":
                    notifications[-1]["failureOutput"] = str(item.get("aggregatedOutput", ""))[:2000]

    def call(method, params):
        nonlocal sequence
        sequence += 1
        current = sequence
        send({"id": current, "method": method, "params": params})
        end = time.monotonic() + 30
        while time.monotonic() < end:
            try:
                message = messages.get(timeout=.25)
            except queue.Empty:
                continue
            if message.get("id") == current and "method" not in message:
                if "error" in message:
                    raise RuntimeError(method + ": " + str(message["error"])[:1200])
                return message["result"]
            handle(message)
        raise TimeoutError(method)

    started = time.monotonic()
    failure = None
    try:
        call("initialize", {"clientInfo": {"name": "starlight-design-native-lifecycle", "version": "1.0"}, "capabilities": {"experimentalApi": True}})
        send({"method": "initialized"})
        listed = call("skills/list", {"cwds": [str(CWD)], "forceReload": True})
        native = [skill for item in listed["data"] for skill in item["skills"]]
        if any(item.get("errors") for item in listed["data"]):
            raise RuntimeError("Native skill inventory has errors; scope not attempted")
        entries, preserved = skill_scope(native)
        for case in ("allow", "deny"):
            state.update(case=case, responses=0, clientToolCalls=0, nativeFileChanges=0, nativeShellCommands=0)
            thread_params = {"cwd": str(CWD), "approvalPolicy": "never", "sandbox": "read-only", "ephemeral": True, "config": {"skills.config": entries}}
            if args.tool_path == "dynamic-write":
                thread_params["dynamicTools"] = [{"type": "function", "name": "Write", "description": "Write only the bounded private native fixture.", "inputSchema": {"type": "object", "properties": {"file_path": {"type": "string"}, "content": {"type": "string"}}, "required": ["file_path", "content"], "additionalProperties": False}}]
            result = call("thread/start", thread_params)
            tid = result["thread"]["id"]
            turn_params = {"threadId": tid, "input": [{"type": "text", "text": "Review a product interface for icons, keyboard focus, reduced motion and recovery. Model-free native hook fixture, no product edits."}]}
            if args.tool_path in ("native-apply-patch", "native-shell"):
                turn_params["sandboxPolicy"] = {"type": "workspaceWrite", "writableRoots": [str(ROOT)], "networkAccess": False}
            started_turn = call("turn/start", turn_params)
            turn_id = started_turn["turn"]["id"]
            deadline = time.monotonic() + 45
            done = False
            turn_status = None
            while time.monotonic() < deadline:
                try:
                    message = messages.get(timeout=.25)
                except queue.Empty:
                    continue
                handle(message)
                if message.get("method") == "turn/completed":
                    done = True
                    turn_status = message.get("params", {}).get("turn", {}).get("status")
                    break
            cases.append({"case": case, "completed": done, "turnStatus": turn_status, "clientToolCalls": state["clientToolCalls"], "nativeFileChanges": state["nativeFileChanges"], "nativeShellCommands": state["nativeShellCommands"], "responses": state["responses"]})
            if not done:
                call("turn/interrupt", {"threadId": tid, "turnId": turn_id})
                raise TimeoutError("Native fixture turn")
    except Exception as error:
        failure = str(error)[:1600]
    finally:
        process.stdin.close()
        try:
            process.wait(timeout=3)
        except subprocess.TimeoutExpired:
            process.terminate()
            process.wait(timeout=5)
        server.shutdown()
        server.server_close()
        server_thread.join(timeout=2)
    after = {str(path): digest(path) for path in protected}
    receipt = {"at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "probeSourceSha256": digest(Path(__file__)), "probe": "native synchronous lifecycle and selected tool dispatch", "toolPath": args.tool_path, "failure": failure, "durationSeconds": round(time.monotonic() - started, 3), "nativeRows": len(native), "sessionEnabledRows": sum(e["enabled"] for e in entries), "preservedSkills": preserved, "sharedConfigUnchanged": before == after, "sharedConfigHashes": after, "skillScope": "thread/start runtime override only", "cases": cases, "observations": observations, "notifications": notifications, "allowFilePresent": OUTPUT.is_file(), "allowContentMatches": OUTPUT.is_file() and OUTPUT.read_text(encoding="utf-8") == SAFE, "denyFileAbsent": not BLOCKED_OUTPUT.exists(), "serverClosed": not server_thread.is_alive(), "nativeProcessExit": process.returncode, "externalInferenceCalls": 0, "limits": ["Selected deterministic fixture tool path only", "No product design quality or native MCP/code-mode execution acceptance", "Shell mode may retain a nonfunctional denied-payload fixture when hook coverage fails", "Default native catalog not changed", "No hook trust bypass"]}
    receipt["verdict"] = verdict(receipt)
    receipt_path = ROOT / (tag + ".json")
    write_private_fixture(receipt_path, ROOT, json.dumps(receipt, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"receipt": str(receipt_path), "durationSeconds": receipt["durationSeconds"],
                      "cases": cases, "verdict": receipt["verdict"], "failure": failure}, indent=2))
    return 0 if receipt["verdict"]["hostProbePassed"] else 2



if __name__ == "__main__":
    raise SystemExit(main())
