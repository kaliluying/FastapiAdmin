import unittest
from unittest.mock import patch

from runtime_acceptance import run, validate_target


class TargetSafetyTests(unittest.TestCase):
    def test_explicit_disposable_target_is_required_before_connecting(self) -> None:
        with patch("builtins.__import__", side_effect=AssertionError("dependency must not be imported")), self.assertRaises(ValueError):
            run(13316, 16379, False)

    def test_default_duplicate_and_invalid_ports_are_rejected(self) -> None:
        for mysql_port, redis_port in [(3306, 16379), (5432, 16379), (13316, 6379), (13316, 5432), (13316, 13316), (1, 16379), (13316, 70000)]:
            with self.subTest(mysql_port=mysql_port, redis_port=redis_port), self.assertRaises(ValueError):
                validate_target(mysql_port, redis_port, True)

    def test_dedicated_ports_are_allowed(self) -> None:
        validate_target(13316, 16379, True)

    def test_unsupported_database_is_rejected_before_connecting(self) -> None:
        with patch("builtins.__import__", side_effect=AssertionError("dependency must not be imported")), self.assertRaises(ValueError):
            run(13316, 16379, True, "sqlite")


if __name__ == "__main__":
    unittest.main()
