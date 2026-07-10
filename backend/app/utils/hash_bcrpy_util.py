import base64
import hashlib
import os

_PBKDF2_ALGO = "sha256"
_PBKDF2_ITERATIONS = 600_000
_PBKDF2_SALT_LEN = 16
_PBKDF2_PREFIX = "$pbkdf2-sha256$"


class PwdUtil:

    @staticmethod
    def hash_password(password: str) -> str:
        salt = os.urandom(_PBKDF2_SALT_LEN)
        dk = hashlib.pbkdf2_hmac(_PBKDF2_ALGO, password.encode(), salt, _PBKDF2_ITERATIONS)
        return f"{_PBKDF2_PREFIX}{_PBKDF2_ITERATIONS}${base64.b64encode(salt).decode()}${base64.b64encode(dk).decode()}"

    @staticmethod
    def verify_password(plain_password: str, password_hash: str) -> bool:
        try:
            _, _algo, iters_str, salt_b64, hash_b64 = password_hash.split("$")
            salt = base64.b64decode(salt_b64)
            expected = base64.b64decode(hash_b64)
            dk = hashlib.pbkdf2_hmac(_PBKDF2_ALGO, plain_password.encode(), salt, int(iters_str))
            return dk == expected
        except Exception:
            return False

    @staticmethod
    def check_password_strength(password: str) -> str | None:
        if len(password) < 6:
            return "密码长度至少6位"
        if not any(c.isupper() for c in password):
            return "密码需要包含大写字母"
        if not any(c.islower() for c in password):
            return "密码需要包含小写字母"
        if not any(c.isdigit() for c in password):
            return "密码需要包含数字"
        return None
