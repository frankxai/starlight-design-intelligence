"""Prevent fixture success from concealing failed/missing native design hooks."""
import copy
import importlib.util
import os
from pathlib import Path
import socket
import tempfile
import threading
import unittest
from unittest.mock import patch

source = Path(__file__).resolve().parents[1] / 'scripts/probe-codex-design-hooks.py'
spec = importlib.util.spec_from_file_location('native_probe', source)
probe = importlib.util.module_from_spec(spec)
spec.loader.exec_module(probe)


def receipt():
    runs = [('deny', 'preToolUse', 'secret-guard', 'blocked'),
            ('allow', 'postToolUse', 'impeccable', 'completed'),
            ('allow', 'stop', 'impeccable', 'completed'),
            ('deny', 'stop', 'impeccable', 'completed')]
    return {'failure': None, 'sharedConfigUnchanged': True, 'serverClosed': True,
            'nativeProcessExit': 0, 'allowContentMatches': True, 'denyFileAbsent': True,
            'observations': [{'routingContextPresent': True, 'skillDescriptionPresent': True}],
            'cases': [{'case': 'allow', 'completed': True, 'turnStatus': 'completed', 'clientToolCalls': 1},
                      {'case': 'deny', 'completed': True, 'turnStatus': 'completed', 'clientToolCalls': 0}],
            'notifications': [{'case': case, 'method': 'hook/completed',
                               'run': {'id': name, 'eventName': event, 'status': status}}
                              for case, event, name, status in runs]}


class NativeProofTests(unittest.TestCase):
    def test_full_boundary_and_lifecycle_are_required(self):
        self.assertTrue(probe.verdict(receipt())['hostProbePassed'])

    def test_native_patch_requires_native_changes_and_no_client_emulation(self):
        value = receipt()
        value['toolPath'] = 'native-apply-patch'
        value['cases'][0].update(clientToolCalls=0, nativeFileChanges=1)
        value['cases'][1]['nativeFileChanges'] = 0
        self.assertTrue(probe.verdict(value)['hostProbePassed'])
        for index, field, bad in [(0, 'nativeFileChanges', 0),
                                  (0, 'nativeFileChanges', 2),
                                  (1, 'nativeFileChanges', 1),
                                  (0, 'clientToolCalls', 1),
                                  (1, 'clientToolCalls', 1)]:
            failed = copy.deepcopy(value)
            failed['cases'][index][field] = bad
            self.assertFalse(probe.verdict(failed)['hostProbePassed'], (index, field))

    def test_unknown_tool_path_and_cross_path_evidence_cannot_pass(self):
        value = receipt()
        for path in ('unsupported', 'native-apply-patch'):
            value['toolPath'] = path
            self.assertFalse(probe.verdict(value)['hostProbePassed'])

    def test_shell_write_without_native_denial_fails_even_with_completed_turns(self):
        value = receipt()
        value['toolPath'] = 'native-shell'
        value['cases'][0].update(clientToolCalls=0, nativeShellCommands=1)
        value['cases'][1]['nativeShellCommands'] = 0
        self.assertTrue(probe.verdict(value)['hostProbePassed'])
        value['cases'][1]['nativeShellCommands'] = 1
        value['denyFileAbsent'] = False
        self.assertFalse(probe.verdict(value)['hostProbePassed'])
        value['denyFileAbsent'] = True
        self.assertFalse(probe.verdict(value)['hostProbePassed'])

    def test_shell_fixture_round_trip_preserves_metacharacters_and_refuses_overwrite(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            path = root / "fixture '$ value.txt"
            text = "Literal '$(), backticks `, quotes \" and Unicode é.\n"
            command = probe.fixture_shell(path, root, text)
            shell = ['pwsh', '-NoProfile', '-NonInteractive', '-Command', command] if os.name == 'nt' else ['/bin/sh', '-c', command]
            result = probe.subprocess.run(shell, capture_output=True, timeout=10)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(path.read_text(encoding='utf-8'), text)
            with self.assertRaises(ValueError):
                probe.fixture_shell(path, root, 'replacement')
            with self.assertRaises(ValueError):
                probe.fixture_shell(root.parent / 'outside.txt', root, text)

    def test_native_patch_refuses_existing_escaped_and_injected_targets(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            path = root / 'native.txt'
            self.assertIn('*** Add File: ' + path.as_posix(),
                          probe.fixture_patch(path, root, probe.SAFE))
            self.assertFalse(path.exists(), 'Patch construction must not emulate execution')
            path.write_text('preserved', encoding='utf-8')
            for target in (path, root.parent / 'outside.txt', root / 'bad\n*** Delete File: victim'):
                with self.assertRaises(ValueError):
                    probe.fixture_patch(target, root, probe.SAFE)
            self.assertEqual(path.read_text(encoding='utf-8'), 'preserved')

    def test_native_secret_denial_cannot_conceal_failed_design_stop(self):
        value = receipt()
        value['notifications'][2]['run']['status'] = 'failed'
        result = probe.verdict(value)
        self.assertTrue(result['nativeToolBoundaryVerified'])
        self.assertEqual(result['impeccableLifecycle'], 'failed')
        self.assertFalse(result['hostProbePassed'])

    def test_missing_stop_is_pending_even_when_no_failures_are_reported(self):
        value = receipt()
        value['notifications'] = value['notifications'][:2]
        self.assertEqual(probe.verdict(value)['impeccableLifecycle'], 'missing')
        self.assertFalse(probe.verdict(value)['hostProbePassed'])

    def test_unrouted_or_unreadable_catalog_cannot_pass_host_probe(self):
        for key in ('routingContextPresent', 'skillDescriptionPresent'):
            value = receipt()
            value['observations'][0][key] = False
            self.assertFalse(probe.verdict(value)['nativeRoutingVerified'])
            self.assertFalse(probe.verdict(value)['hostProbePassed'])

    def test_unexpected_fixture_authentication_cannot_pass(self):
        value = receipt()
        value['observations'][0]['authorizationHeaderPresent'] = True
        self.assertTrue(probe.verdict(value)['unexpectedFixtureAuthentication'])
        self.assertFalse(probe.verdict(value)['hostProbePassed'])

    def test_client_rejection_is_not_native_denial(self):
        value = receipt()
        value['cases'][1]['clientToolCalls'] = 1
        self.assertFalse(probe.verdict(value)['nativeToolBoundaryVerified'])

    def test_failed_terminal_turn_cannot_pass_from_completion_notification(self):
        value = receipt()
        value['cases'][1]['turnStatus'] = 'failed'
        self.assertFalse(probe.verdict(value)['hostProbePassed'])
        value = receipt()
        value['notifications'][0]['run']['status'] = 'completed'
        self.assertFalse(probe.verdict(value)['nativeToolBoundaryVerified'])

    def test_interruption_configuration_drift_and_leaked_server_fail(self):
        for key, bad in [('sharedConfigUnchanged', False), ('serverClosed', False),
                         ('nativeProcessExit', 1), ('failure', 'interrupted')]:
            value = receipt()
            value[key] = bad
            self.assertFalse(probe.verdict(value)['hostProbePassed'], key)
        value = receipt()
        value['cases'][0]['completed'] = False
        self.assertFalse(probe.verdict(value)['nativeToolBoundaryVerified'])

    def test_scoping_preserves_explicit_disables_system_and_security(self):
        native = [{'name': 'emil-design-eng', 'path': '/design', 'scope': 'user', 'enabled': False},
                  {'name': 'security-guard', 'path': '/guard', 'scope': 'user', 'enabled': True},
                  {'name': 'core', 'path': '/core', 'scope': 'system', 'enabled': True},
                  {'name': 'pp', 'path': '/pp.stale-backup/skill', 'scope': 'user', 'enabled': True},
                  {'name': 'other', 'path': '/other', 'scope': 'user', 'enabled': True}]
        original = copy.deepcopy(native)
        entries, _ = probe.skill_scope(native)
        self.assertEqual(native, original)
        self.assertEqual([entry['enabled'] for entry in entries], [False, True, True, False, False])

    def test_private_artifacts_reject_git_checkout_and_worktree(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            child = root / 'child'
            child.mkdir()
            self.assertEqual(probe.private_directory(child), child.resolve())
            (root / '.git').write_text('gitdir: elsewhere', encoding='utf-8')
            with self.assertRaises(ValueError):
                probe.private_directory(child)

    def test_native_launch_failure_closes_real_http_server_and_preserves_error(self):
        created = []
        original_server = probe.http.server.HTTPServer

        def record_server(*args, **kwargs):
            server = original_server(*args, **kwargs)
            created.append(server)
            return server

        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            executable = root / 'native-fixture.exe'
            executable.touch()
            (root / 'config.toml').write_text('[mcp_servers]\n', encoding='utf-8')
            argv = ['probe', '--codex-exe', str(executable), '--cwd', str(root),
                    '--output-dir', str(root)]
            try:
                with patch.dict(os.environ, {'CODEX_HOME': str(root)}), \
                     patch('sys.argv', argv), \
                     patch.object(probe.http.server, 'HTTPServer', record_server), \
                     patch.object(probe.subprocess, 'Popen', side_effect=OSError('native launch refused')):
                    with self.assertRaisesRegex(OSError, 'native launch refused'):
                        probe.main()
                self.assertEqual(len(created), 1)
                self.assertEqual(created[0].fileno(), -1)
            finally:
                for server in created:
                    server.server_close()

    def test_header_reads_are_bounded_before_native_launch_failure(self):
        created, socket_timeouts = [], []
        accepted = threading.Event()
        original_server = probe.http.server.HTTPServer

        def record_server(*args, **kwargs):
            server = original_server(*args, **kwargs)
            original_setup = server.RequestHandlerClass.setup

            def record_setup(handler):
                original_setup(handler)
                socket_timeouts.append(handler.connection.gettimeout())
                accepted.set()

            server.RequestHandlerClass.setup = record_setup
            # The deliberately disconnected header fixture can reset its socket.
            server.handle_error = lambda *_args: None
            created.append(server)
            return server

        def refuse_launch(*_args, **_kwargs):
            with socket.create_connection(created[0].server_address, timeout=1) as client:
                client.sendall(b'POST /v1/responses HTTP/1.1\r\n')
                self.assertTrue(accepted.wait(1), 'The real server did not accept the connection')
                self.assertIsNotNone(socket_timeouts[0], 'Header reads could stall shutdown forever')
                self.assertGreater(socket_timeouts[0], 0)
                self.assertLessEqual(socket_timeouts[0], 5)
            raise OSError('native launch refused with stalled headers')

        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            executable = root / 'native-fixture.exe'
            executable.touch()
            (root / 'config.toml').write_text('[mcp_servers]\n', encoding='utf-8')
            argv = ['probe', '--codex-exe', str(executable), '--cwd', str(root),
                    '--output-dir', str(root)]
            try:
                with patch.dict(os.environ, {'CODEX_HOME': str(root)}), \
                     patch('sys.argv', argv), \
                     patch.object(probe.http.server, 'HTTPServer', record_server), \
                     patch.object(probe.subprocess, 'Popen', side_effect=refuse_launch):
                    with self.assertRaisesRegex(OSError, 'native launch refused with stalled headers'):
                        probe.main()
                self.assertEqual(created[0].fileno(), -1)
            finally:
                for server in created:
                    server.server_close()

    def test_existing_private_fixture_cannot_be_overwritten(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            path = root / 'allow.txt'
            probe.write_private_fixture(path, root, 'original')
            with self.assertRaises(FileExistsError):
                probe.write_private_fixture(path, root, 'replacement')
            self.assertEqual(path.read_text(encoding='utf-8'), 'original')

    def test_redirected_private_fixture_cannot_touch_external_sentinel(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory).resolve()
            root = base / 'evidence'
            root.mkdir()
            sentinel = base / 'sentinel.txt'
            sentinel.write_text('preserved', encoding='utf-8')
            path = root / 'allow.txt'
            try:
                path.symlink_to(sentinel)
            except OSError:
                self.skipTest('Platform does not admit unprivileged symlinks')
            with self.assertRaises(ValueError):
                probe.write_private_fixture(path, root, 'replacement')
            self.assertEqual(sentinel.read_text(encoding='utf-8'), 'preserved')

    def test_invalid_body_sizes_and_paths_are_rejected_before_read(self):
        self.assertEqual(probe.fixture_request_size('2000000', '/v1/responses'), 2000000)
        for size in (None, '', 'bad', '-1', '0', '2000001'):
            with self.assertRaises(ValueError):
                probe.fixture_request_size(size, '/v1/responses')
        with self.assertRaises(ValueError):
            probe.fixture_request_size('10', '/other')


if __name__ == '__main__':
    unittest.main()
