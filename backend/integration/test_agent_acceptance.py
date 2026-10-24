"""Safety/model-protocol self-checks; no database, Redis or application imports."""

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from agent_acceptance import clean_environment, local_model_message, validate_root


class AgentAcceptanceSafetyTests(unittest.TestCase):
    def test_reject_non_temporary_or_unowned_root(self):
        for root in (Path("/Users/gml/code/FastCore"), Path(tempfile.gettempdir()) / "existing-data"):
            with self.assertRaises(ValueError):
                validate_root(root)

    def test_clean_environment_has_no_application_credentials(self):
        with patch.dict("os.environ", {"DATABASE_PASSWORD": "not-real", "OPENAI_API_KEY": "not-real",
                                     "PYTHONPATH": "/not-real", "HTTPS_PROXY": "http://not-real"}):
            for key in ("DATABASE_PASSWORD", "OPENAI_API_KEY", "PYTHONPATH", "HTTPS_PROXY"):
                self.assertNotIn(key, clean_environment())

    def test_http_model_requests_selected_tools_and_reports_real_evidence(self):
        payload = {"messages": [{"role": "user", "content": "acceptance"}], "tools": [
            {"function": {"name": "query_runtime_logs"}}, {"function": {"name": "search_knowledge"}},
        ]}
        first = local_model_message(payload)
        self.assertEqual(len(first["tool_calls"]), 2)
        payload["messages"].append({"role": "tool", "content": '{"citations":[{"id":"1","snippet":"real evidence"}]}'})
        self.assertIn("[1] real evidence", local_model_message(payload)["content"])

    def test_http_model_refuses_fabricated_empty_evidence(self):
        with self.assertRaises(AssertionError):
            local_model_message({"messages": [{"role": "user", "content": "acceptance"},
                                               {"role": "tool", "content": '{"citations":[]}'}],
                                 "tools": [{"function": {"name": "search_knowledge"}}]})


if __name__ == "__main__":
    unittest.main()
