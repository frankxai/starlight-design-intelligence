"""Prevent fixture success from concealing failed/missing native design hooks."""
import copy
import importlib.util
import os
from pathlib import Path
import tempfile
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
        original_server = probe.http.server.ThreadingHTTPServer

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
                     patch.object(probe.http.server, 'ThreadingHTTPServer', record_server), \
                     patch.object(probe.subprocess, 'Popen', side_effect=OSError('native launch refused')):
                    with self.assertRaisesRegex(OSError, 'native launch refused'):
                        probe.main()
                self.assertEqual(len(created), 1)
                self.assertEqual(created[0].fileno(), -1)
            finally:
                for server in created:
                    server.server_close()


if __name__ == '__main__':
    unittest.main()
