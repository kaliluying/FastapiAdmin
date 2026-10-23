"""第三方 OAuth2 登录（微信开放平台扫码、QQ、GitHub、Gitee）。

各平台需在开放平台登记「授权回调域 / redirect_uri」为：
  {API}/system/auth/oauth/{provider}/callback
例如：https://your-domain.com/api/v1/system/auth/oauth/github/callback

环境变量见 Settings 中 OAUTH_* 字段。
"""

import json
import secrets
from typing import Any, Literal
from urllib.parse import quote, urlencode, urlparse

import httpx
from fastapi import Request
from redis.asyncio.client import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.module_system.user.crud import UserCRUD
from app.api.v1.module_system.user.model import UserModel
from app.config.setting import settings
from app.core.base_schema import AuthSchema, JWTOutSchema
from app.core.exceptions import CustomException
from app.core.logger import logger
from app.core.redis_crud import RedisCURD

from .service import LoginService

OAuthProvider = Literal["wechat", "qq", "github", "gitee"]

STATE_PREFIX = "oauth_state:"
STATE_TTL_SECONDS = 600
OAUTH_TICKET_PREFIX = "oauth_ticket:"
OAUTH_TICKET_TTL_SECONDS = 60


def _extract_url_origin(url: str) -> str:
    """提取 URL 的 origin（scheme://host[:port]）。"""
    parsed = urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        return ""
    return f"{parsed.scheme}://{parsed.netloc}".lower()


def _validate_redirect_uri(redirect_uri: str) -> None:
    """校验 redirect_uri 是否在白名单内。"""
    uri_origin = _extract_url_origin(redirect_uri)
    if not uri_origin:
        raise CustomException(msg="非法的回调地址")

    # 获取白名单
    allowed = list(settings.OAUTH_ALLOWED_REDIRECT_ORIGINS)
    fallback_origin = _extract_url_origin(settings.OAUTH_FRONTEND_FALLBACK)
    if fallback_origin and fallback_origin not in allowed:
        allowed.append(fallback_origin)

    if not allowed:
        raise CustomException(msg="OAuth 回调地址未配置")

    if uri_origin not in allowed:
        raise CustomException(msg="非法的回调地址")


def safe_frontend_redirect(redirect_uri: str | None) -> str:
    """校验前端重定向地址，无效时使用配置中的回退地址。

    Args:
        redirect_uri: 用户提供的前端 URL。

    Returns:
        来源匹配已配置白名单的 URL。
    """
    fallback = settings.OAUTH_FRONTEND_FALLBACK
    if not redirect_uri:
        return fallback
    try:
        _validate_redirect_uri(redirect_uri)
    except CustomException:
        return fallback
    return redirect_uri.strip()


def _callback_url(request: Request, provider: OAuthProvider) -> str:
    root = str(request.base_url).rstrip("/")
    return f"{root}/system/auth/oauth/{provider}/callback"


def _frontend_error_redirect(frontend_base: str, message: str) -> str:
    sep = "&" if "?" in frontend_base else "?"
    return f"{frontend_base}{sep}oauth_error={quote(message, safe='')}"


def _require_credentials(provider: OAuthProvider) -> tuple[str, str]:
    if provider == "github":
        cid, sec = settings.OAUTH_GITHUB_CLIENT_ID, settings.OAUTH_GITHUB_CLIENT_SECRET
    elif provider == "gitee":
        cid, sec = settings.OAUTH_GITEE_CLIENT_ID, settings.OAUTH_GITEE_CLIENT_SECRET
    elif provider == "wechat":
        cid, sec = settings.OAUTH_WECHAT_OPEN_APP_ID, settings.OAUTH_WECHAT_OPEN_APP_SECRET
    elif provider == "qq":
        cid, sec = settings.OAUTH_QQ_APP_ID, settings.OAUTH_QQ_APP_SECRET
    else:
        raise CustomException(msg="不支持的 OAuth 渠道")
    if not cid or not sec:
        raise CustomException(msg=f"{provider} OAuth 未配置（客户端密钥为空）")
    return cid, sec


def build_authorize_url(
    *,
    provider: OAuthProvider,
    callback_url: str,
    state: str,
) -> str:
    """构造跳转至第三方授权页的 URL。"""
    cid, _ = _require_credentials(provider)

    if provider == "github":
        params = {
            "client_id": cid,
            "redirect_uri": callback_url,
            "scope": "user:email",
            "state": state,
        }
        return "https://github.com/login/oauth/authorize?" + urlencode(params)

    if provider == "gitee":
        params = {
            "client_id": cid,
            "redirect_uri": callback_url,
            "response_type": "code",
            "state": state,
        }
        return "https://gitee.com/oauth/authorize?" + urlencode(params)

    if provider == "wechat":
        params = {
            "appid": cid,
            "redirect_uri": callback_url,
            "response_type": "code",
            "scope": "snsapi_login",
            "state": state,
        }
        return "https://open.weixin.qq.com/connect/qrconnect?" + urlencode(params) + "#wechat_redirect"

    if provider == "qq":
        params = {
            "response_type": "code",
            "client_id": cid,
            "redirect_uri": callback_url,
            "state": state,
            "scope": "get_user_info",
        }
        return "https://graph.qq.com/oauth2.0/authorize?" + urlencode(params)

    raise CustomException(msg="不支持的 OAuth 渠道")


async def _http_fetch(method: str, url: str, *, parse: str = "json", **kwargs: Any) -> Any:
    timeout = getattr(settings, "HTTPX_DEFAULT_TIMEOUT", 15.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        r = await client.request(method, url, **kwargs)
        r.raise_for_status()
        if parse == "text":
            return r.text
        try:
            return r.json()
        except json.JSONDecodeError:
            text = r.text
            logger.error(f"OAuth 非 JSON 响应: {text[:500]}")
            raise CustomException(msg="OAuth 接口返回异常")


async def exchange_github_token(client_id: str, client_secret: str, code: str, redirect_uri: str) -> str:
    data = await _http_fetch(
        "POST",
        "https://github.com/login/oauth/access_token",
        headers={"Accept": "application/json"},
        data={
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "redirect_uri": redirect_uri,
        },
    )
    if not isinstance(data, dict):
        raise CustomException(msg="GitHub token 响应格式错误")
    token = data.get("access_token")
    if not token:
        raise CustomException(msg=data.get("error_description") or "GitHub 换取令牌失败")
    return str(token)


async def exchange_gitee_token(client_id: str, client_secret: str, code: str, redirect_uri: str) -> str:
    qs = urlencode(
        {
            "grant_type": "authorization_code",
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
        }
    )
    data = await _http_fetch("GET", f"https://gitee.com/oauth/token?{qs}")
    if not isinstance(data, dict):
        raise CustomException(msg="Gitee token 响应格式错误")
    token = data.get("access_token")
    if not token:
        raise CustomException(msg=data.get("error_description") or "Gitee 换取令牌失败")
    return str(token)


async def exchange_wechat_token(app_id: str, secret: str, code: str) -> tuple[str, str]:
    qs = urlencode(
        {
            "appid": app_id,
            "secret": secret,
            "code": code,
            "grant_type": "authorization_code",
        }
    )
    data = await _http_fetch("GET", f"https://api.weixin.qq.com/sns/oauth2/access_token?{qs}")
    if not isinstance(data, dict):
        raise CustomException(msg="微信 token 响应格式错误")
    token = data.get("access_token")
    openid = data.get("openid")
    if not token or not openid:
        raise CustomException(msg=data.get("errmsg") or "微信换取令牌失败")
    return str(token), _validate_oauth_subject(openid)


async def exchange_qq_token(client_id: str, client_secret: str, code: str, redirect_uri: str) -> tuple[str, str]:
    qs = urlencode(
        {
            "grant_type": "authorization_code",
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "redirect_uri": redirect_uri,
        }
    )
    text = await _http_fetch("GET", f"https://graph.qq.com/oauth2.0/token?{qs}", parse="text")
    parts = dict(p.split("=", 1) for p in text.split("&") if "=" in p)
    token = parts.get("access_token")
    if not token:
        raise CustomException(msg="QQ 换取 access_token 失败")
    me = await _http_fetch(
        "GET",
        "https://graph.qq.com/oauth2.0/me",
        params={"access_token": token, "fmt": "json"},
    )
    if not isinstance(me, dict):
        raise CustomException(msg="QQ openid 响应格式错误")
    openid = me.get("openid")
    if not openid:
        raise CustomException(msg="QQ 获取 openid 失败")
    return str(token), _validate_oauth_subject(openid)


async def fetch_github_profile(access_token: str) -> tuple[str, str, str | None]:
    headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/json"}
    user = await _http_fetch("GET", "https://api.github.com/user", headers=headers)
    if not isinstance(user, dict):
        raise CustomException(msg="GitHub 用户信息格式错误")
    subject = user.get("id")
    if type(subject) is not int or subject <= 0:
        raise CustomException(msg="GitHub 用户标识无效")
    subject = _validate_oauth_subject(str(subject))
    login = str(user.get("login") or "")
    name = str(user.get("name") or login or "github")
    email = user.get("email")
    if not email:
        emails = await _http_fetch("GET", "https://api.github.com/user/emails", headers=headers)
        if isinstance(emails, list):
            primary = next((e for e in emails if isinstance(e, dict) and e.get("primary")), None)
            if primary:
                email = primary.get("email")
    return subject, name, email


async def fetch_gitee_profile(access_token: str) -> tuple[str, str, str | None]:
    user = await _http_fetch(
        "GET",
        "https://gitee.com/api/v5/user",
        params={"access_token": access_token},
    )
    if not isinstance(user, dict):
        raise CustomException(msg="Gitee 用户信息格式错误")
    subject = user.get("id")
    if type(subject) is not int or subject <= 0:
        raise CustomException(msg="Gitee 用户标识无效")
    subject = _validate_oauth_subject(str(subject))
    login = str(user.get("login") or "")
    name = str(user.get("name") or login)
    email = user.get("email")
    return subject, name, email


async def fetch_wechat_profile(access_token: str, openid: str) -> tuple[str, str]:
    openid = _validate_oauth_subject(openid)
    qs = urlencode({"access_token": access_token, "openid": openid, "lang": "zh_CN"})
    user = await _http_fetch("GET", f"https://api.weixin.qq.com/sns/userinfo?{qs}")
    if not isinstance(user, dict):
        raise CustomException(msg="微信用户信息格式错误")
    if user.get("errcode"):
        raise CustomException(msg="微信用户信息失败")
    if _validate_oauth_subject(user.get("openid")) != openid:
        raise CustomException(msg="微信用户标识不匹配")
    nickname = str(user.get("nickname") or "wechat")
    subject = _validate_oauth_subject(user["unionid"]) if "unionid" in user else openid
    return subject, nickname


async def fetch_qq_profile(access_token: str, app_id: str, openid: str) -> tuple[str, str]:
    openid = _validate_oauth_subject(openid)
    qs = urlencode(
        {
            "access_token": access_token,
            "oauth_consumer_key": app_id,
            "openid": openid,
        }
    )
    user = await _http_fetch("GET", f"https://graph.qq.com/user/get_user_info?{qs}")
    if not isinstance(user, dict):
        raise CustomException(msg="QQ 用户信息格式错误")
    ret = user.get("ret")
    if not (type(ret) is int and ret == 0 or ret == "0"):
        raise CustomException(msg="QQ 用户信息失败")
    nickname = str(user.get("nickname") or "qq")
    return openid, nickname


def _validate_oauth_subject(subject: Any) -> str:
    """绑定字段容量固定，不清洗、截断或强制转换外部身份。"""
    if not isinstance(subject, str) or not 1 <= len(subject) <= 32 or any(c.isspace() or not c.isprintable() for c in subject):
        raise CustomException(msg="OAuth 用户标识无效")
    return subject


async def ensure_oauth_user(
    *,
    db: AsyncSession,
    provider: OAuthProvider,
    unique_id: str,
    display_name: str,
) -> UserModel:
    subject = _validate_oauth_subject(unique_id)
    fields = {"github": "github_login", "gitee": "gitee_login", "wechat": "wx_login", "qq": "qq_login"}
    if provider not in fields:
        raise CustomException(msg="不支持的 OAuth 渠道")
    field = fields[provider]
    candidates = await db.scalars(select(UserModel).where(getattr(UserModel, field) == subject))
    # MySQL 排序规则可能忽略大小写；身份必须在 Python 中再次精确比较。
    matches = [user for user in candidates.unique() if getattr(user, field) == subject]
    if len(matches) > 1:
        raise CustomException(msg="OAuth 账号绑定冲突，请联系管理员")
    if not matches or matches[0].is_deleted:
        raise CustomException(msg="OAuth 账号未绑定，请由管理员创建内部账号并绑定")
    return matches[0]


async def complete_oauth_login(
    *,
    request: Request,
    redis: Redis,
    db: AsyncSession,
    provider: OAuthProvider,
    code: str,
    state: str,
) -> tuple[JWTOutSchema, str]:
    rc = RedisCURD(redis)
    # 兑换供应商授权码前先消费 CSRF state；回调重试必须重新发起 OAuth，
    # 不能复用同一 state。
    raw = await rc.getdel(f"{STATE_PREFIX}{state}")
    if not raw:
        raise CustomException(msg="登录状态已失效，请重试")
    if isinstance(raw, bytes):
        raw = raw.decode("utf-8")
    payload = json.loads(raw)
    if payload.get("provider") != provider:
        raise CustomException(msg="OAuth 状态不匹配")

    frontend = str(payload.get("frontend_redirect") or "").strip()
    if not frontend:
        raise CustomException(msg="缺少前端回调地址")

    callback_url = _callback_url(request, provider)
    cid, csec = _require_credentials(provider)

    if provider == "github":
        access = await exchange_github_token(cid, csec, code, callback_url)
        uid, name, _email = await fetch_github_profile(access)
    elif provider == "gitee":
        access = await exchange_gitee_token(cid, csec, code, callback_url)
        uid, name, _email = await fetch_gitee_profile(access)
    elif provider == "wechat":
        access, openid = await exchange_wechat_token(cid, csec, code)
        uid, name = await fetch_wechat_profile(access, openid)
    elif provider == "qq":
        access, openid = await exchange_qq_token(cid, csec, code, callback_url)
        uid, name = await fetch_qq_profile(access, cid, openid)
    else:
        raise CustomException(msg="不支持的 OAuth 渠道")

    user = await ensure_oauth_user(db=db, provider=provider, unique_id=uid, display_name=name)
    if user.status == 1:
        raise CustomException(msg="用户已被停用")

    await UserCRUD(AuthSchema(db=db, user=None, check_data_scope=False)).update_last_login(id=user.id)
    # 回调使用 GET，需在只读依赖回滚前单独持久化登录时间。
    await db.commit()

    login_type = f"oauth_{provider}"
    token = await LoginService.create_token(request=request, redis=redis, user=user, login_type=login_type)
    return token, frontend


async def save_oauth_state(
    *,
    redis: Redis,
    state: str,
    provider: OAuthProvider,
    frontend_redirect: str,
) -> None:
    _validate_redirect_uri(frontend_redirect)
    rc = RedisCURD(redis)
    ok = await rc.set(
        f"{STATE_PREFIX}{state}",
        json.dumps({"provider": provider, "frontend_redirect": frontend_redirect}),
        expire=STATE_TTL_SECONDS,
    )
    if not ok:
        raise CustomException(msg="缓存 OAuth 状态失败")


async def save_oauth_ticket(redis: Redis, token: JWTOutSchema) -> str:
    """将 OAuth 签发的 JWT 保存到短期一次性票据后，避免直接暴露令牌。"""
    ticket = secrets.token_urlsafe(32)
    ok = await RedisCURD(redis).set(
        f"{OAUTH_TICKET_PREFIX}{ticket}",
        token.model_dump(),
        expire=OAUTH_TICKET_TTL_SECONDS,
    )
    if not ok:
        raise CustomException(msg="缓存 OAuth 登录凭证失败")
    return ticket


async def exchange_oauth_ticket(redis: Redis, ticket: str) -> JWTOutSchema:
    """一次性消费 OAuth 票据并返回对应的 JWT 数据。"""
    if not ticket or len(ticket) > 256:
        raise CustomException(msg="OAuth 登录凭证已失效", status_code=401)
    raw = await RedisCURD(redis).getdel(f"{OAUTH_TICKET_PREFIX}{ticket}")
    if not raw:
        raise CustomException(msg="OAuth 登录凭证已失效", status_code=401)
    if isinstance(raw, bytes):
        raw = raw.decode("utf-8")
    try:
        return JWTOutSchema.model_validate(json.loads(raw))
    except (TypeError, json.JSONDecodeError, ValueError):
        raise CustomException(msg="OAuth 登录凭证无效", status_code=401)


def oauth_service_frontend_redirect_from_ticket(frontend_base: str, ticket: str) -> str:
    """构造仅携带不透明 OAuth 票据的回调 URL。"""
    safe_frontend = safe_frontend_redirect(frontend_base)
    sep = "&" if "?" in safe_frontend else "?"
    return f"{safe_frontend}{sep}oauth_ticket={quote(ticket, safe='')}"


def oauth_service_error_redirect(frontend_base: str, message: str) -> str:
    return _frontend_error_redirect(safe_frontend_redirect(frontend_base), message)


__all__ = [
    "OAuthProvider",
    "STATE_PREFIX",
    "OAUTH_TICKET_PREFIX",
    "build_authorize_url",
    "complete_oauth_login",
    "save_oauth_state",
    "_callback_url",
    "oauth_service_frontend_redirect_from_ticket",
    "save_oauth_ticket",
    "exchange_oauth_ticket",
    "safe_frontend_redirect",
    "oauth_service_error_redirect",
]
