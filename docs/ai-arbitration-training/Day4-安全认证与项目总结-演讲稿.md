# Day 4: 安全认证 + 项目总结 - 详细演讲稿
> 当前版本更新说明（2026-06-27）：
> - 课堂主线以 `courseware/index.html` 和 `完整四天授课执行脚本.md` 为准。
> - 当前讲课顺序调整为：从零实现主线 → 四天逐日节奏 → 技术地图 → 答辩准备。
> - “从零实现”已补充前端最小页面路径：先静态、再 mock、再接接口。
> - Day4 中密码安全、第三方登录、接口限流作为扩展了解，不再作为学生必须完整实现的主任务。
> - 旧路径已统一迁移到当前骨架表达：`backend/app/plugin/module_ai/chat/*`、`backend/app/plugin/module_ai/knowledge/*`、`backend/app/core/*`。
> - 旧稿中较深的实现细节仅供讲师备课参考，课堂投屏优先使用网页课件。

---

## 🌅 上午课程（9:00-12:00）

---

### 开场和练习复盘（9:00-9:30，30分钟）

大家早上好！欢迎来到第四天，也是最后一天的课程。

前三天我们完成了项目的核心 AI 功能，今天我们要完善安全认证机制，并进行项目总结和答辩准备。

#### 9:00-9:15 练习检查（15分钟）

**练习完成情况**：

请完成以下功能的同学举手：
- ✅ 证据上传功能测试成功
- ✅ 文书生成功能测试成功
- ✅ 完善了文书模板样式

（讲师统计完成情况）

**优秀案例展示**：

（选择 2-3 个同学展示他们的文书模板或 AI 提示词优化）

#### 9:15-9:25 常见问题讲解（10分钟）

**问题 1：文件上传后找不到文件**

```python
# 原因：相对路径问题
file_path = "data/evidence_uploads/xxx.pdf"  # ❌ 相对路径

# 解决：使用绝对路径
file_path = settings.BASE_DIR / "data" / "evidence_uploads" / "xxx.pdf"  # ✅
```

**问题 2：后台任务数据库会话失效**

```python
# 错误：
background_tasks.add_task(process_evidence, db, evidence_id)
# db 会话在响应后关闭

# 正确：在任务中创建新会话
def process_evidence(evidence_id: str):
    with Session(engine) as db:
        # 处理逻辑
        pass
```

**问题 3：Jinja2 模板变量未定义**

```jinja2
{# 错误：直接访问可能不存在的变量 #}
{{ user.name }}  {# 如果 user 为 None 会报错 #}

{# 正确：使用默认值 #}
{{ user.name if user else '未知' }}
{{ user.name | default('未知') }}
```

#### 9:25-9:30 今日课程预览（5分钟）

**上午内容**：
1. JWT 身份认证（原理、实现、测试）
2. 扩展了解：密码安全
3. 扩展了解：第三方登录流程
4. 扩展了解：接口限流（Rate Limiting）

**下午内容**：
1. 项目部署准备
2. 前后端联调
3. 项目答辩准备
4. 模拟答辩

**今天的目标**：
完善项目的安全机制，准备项目答辩！

---

### 第一部分：JWT 身份认证（9:30-10:40，70分钟）

#### 1.1 认证和授权基础（15分钟）

**认证 vs 授权**：

```
认证（Authentication）：你是谁？
- 登录验证
- 确认身份

授权（Authorization）：你能做什么？
- 权限检查
- 访问控制
```

**常见认证方式对比**：

```
1. Session-Cookie（传统方式）
优点：
✅ 服务器端控制（可随时撤销）
✅ 安全性高（session 存储在服务器）

缺点：
❌ 服务器存储压力（大量 session）
❌ 难以跨域
❌ 难以水平扩展（需要 session 共享）

2. JWT（Token-Based，我们用的）
优点：
✅ 无状态（服务器不存储）
✅ 易于跨域
✅ 易于扩展（多服务共享）
✅ 移动端友好

缺点：
❌ 无法主动撤销（除非加黑名单）
❌ Token 体积较大
```

**JWT 结构**：

```
JWT = Header.Payload.Signature

示例：
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiJhZG1pbiIsImV4cCI6MTcwMDAwMDAwMH0.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

解析后：
Header: {
  "alg": "HS256",      # 签名算法
  "typ": "JWT"         # 类型
}

Payload: {
  "sub": "admin",      # 用户名
  "exp": 1700000000    # 过期时间
}

Signature: 
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

**工作流程**（在白板上画图）：

```
【登录流程】
1. 用户提交：username + password
2. 服务器验证密码
3. 生成 JWT Token
4. 返回 Token 给客户端
5. 客户端存储 Token（localStorage）

【访问受保护接口】
1. 客户端发送请求：Header: Authorization: Bearer <token>
2. 服务器验证 Token：
   - 解码
   - 验证签名
   - 检查过期时间
3. 提取用户信息（sub）
4. 查询数据库获取用户对象
5. 执行业务逻辑
6. 返回响应
```

#### 1.2 项目中的 JWT 实现（30分钟）

**核心代码讲解**：

打开 `backend/app/core/security.py`：

```python
# backend/app/core/security.py
import jwt
from datetime import datetime, timedelta, timezone

def create_access_token(payload: JWTPayloadSchema) -> str:
    """创建 JWT 访问令牌
    
    Args:
        payload: JWT 负载（用户名、过期时间等）
        
    Returns:
        JWT token 字符串
    """
    to_encode = payload.model_dump()
    
    # 设置过期时间
    if not payload.exp:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
        to_encode["exp"] = expire
    
    # 编码生成 Token
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,      # 密钥（必须保密）
        algorithm=settings.ALGORITHM  # HS256
    )
    
    return encoded_jwt

def decode_access_token(token: str) -> JWTPayloadSchema:
    """解码 JWT 访问令牌
    
    Args:
        token: JWT token 字符串
        
    Returns:
        JWT 负载对象
        
    Raises:
        TokenExpiredError: Token 已过期
        InvalidTokenError: Token 无效
    """
    try:
        # 解码并验证
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return JWTPayloadSchema(**payload)
        
    except jwt.ExpiredSignatureError as exc:
        raise TokenExpiredError("登录已过期，请重新登录") from exc
    except jwt.JWTError as exc:
        raise InvalidTokenError("无效的令牌") from exc
```

**登录接口实现**：

```python
# backend/app/plugin/module_ai/chat/controller.py

@router.post("/login", name="用户登录")
async def login_controller(
    credentials: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """用户登录
    
    Args:
        credentials: 包含 username 和 password
        
    Returns:
        {
          "access_token": "eyJhbGci...",
          "token_type": "bearer",
          "expires_in": 1800
        }
    """
    
    # === 步骤 1：查询用户 ===
    user = db.exec(
        select(User).where(User.username == credentials.username)
    ).first()
    
    if not user:
        raise ExceptResponse(msg="用户名或密码错误", code=401)
    
    # === 步骤 2：验证密码 ===
    if not verify_password(credentials.password, user.password):
        raise ExceptResponse(msg="用户名或密码错误", code=401)
    
    # === 步骤 3：检查用户状态 ===
    if not user.status:
        raise ExceptResponse(msg="账号已被禁用", code=403)
    
    # === 步骤 4：生成 JWT Token ===
    payload = JWTPayloadSchema(
        sub=user.username,
        exp=datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )
    
    access_token = create_access_token(payload)
    
    # === 步骤 5：返回 Token ===
    return SuccessResponse(
        data={
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
    )
```

**依赖注入获取当前用户**：

```python
# backend/app/core/dependencies.py

async def get_current_user(
    request: Request,
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """获取当前登录用户（依赖注入）
    
    Args:
        token: JWT token（从 Authorization header 提取）
        db: 数据库会话
        
    Returns:
        User 对象
        
    Raises:
        HTTPException: Token 无效或用户不存在
    """
    
    # === 步骤 1：检查 Token ===
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="未登录，请先登录"
        )
    
    # === 步骤 2：解码 Token ===
    try:
        payload = decode_access_token(token)
    except (TokenExpiredError, InvalidTokenError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc)
        )
    
    # === 步骤 3：查询用户 ===
    username = payload.sub
    user = db.exec(
        select(User).where(User.username == username)
    ).first()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在"
        )
    
    # === 步骤 4：检查用户状态 ===
    if not user.status:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="账号已被禁用"
        )
    
    return user

# 类型别名（方便使用）
CurrentUser = Annotated[User, Depends(get_current_user)]
```

**使用示例**：

```python
# 在需要认证的接口中使用
@router.get("/profile", name="获取用户信息")
async def get_profile_controller(current_user: CurrentUser):
    """获取当前用户信息（需要登录）"""
    return SuccessResponse(
        data={
            "id": current_user.id,
            "username": current_user.username,
            "name": current_user.name
        }
    )
```

#### 1.3 扩展了解：密码安全（15分钟）

**为什么要加密密码？**

```
明文存储（❌ 绝对不可以）：
users 表：
id | username | password
1  | admin    | 123456

风险：
- 数据库泄露 → 所有密码暴露
- 内部人员可见
- SQL 注入可直接获取

加密存储（✅ 必须）：
users 表：
id | username | password
1  | admin    | $2b$12$xQZ8...（不可逆）

优势：
- 数据库泄露 → 密码仍然安全
- 内部人员无法知道原密码
```

**密码哈希 特点**：

```python
# 密码哈希 是一种慢哈希算法

优点：
✅ 不可逆（无法从哈希值还原密码）
✅ 加盐（同样的密码，哈希值不同）
✅ 自适应（可调整计算复杂度，抵抗暴力破解）

示例：
password = "123456"

# 第1次加密
hash1 = "$2b$12$xQZ8aB3cD4eF5gH6iJ7kL.mN8oP9qR0sT1uV2wX3yZ4aB5cD6eF7g"

# 第2次加密（相同密码，不同哈希）
hash2 = "$2b$12$yZ4aB5cD6eF7gH8iJ9kL0.mN1oP2qR3sT4uV5wX6yZ7aB8cD9eF0g"

# 验证密码
密码哈希.checkpw("123456", hash1)  # True
密码哈希.checkpw("123456", hash2)  # True
密码哈希.checkpw("wrong", hash1)   # False
```

**项目中的实现**：

```python
# backend/app/core/security.py
import 密码哈希

def set_password_hash(password: str) -> str:
    """扩展了解：密码安全
    
    Args:
        password: 明文密码
        
    Returns:
        加密后的哈希值
    """
    # 限制密码长度（密码哈希 限制为 72 字节）
    password_bytes = password[:72].encode("utf-8")
    
    # 生成盐（rounds=12，计算时间约 0.3 秒）
    salt = 密码哈希.gensalt(rounds=12)
    
    # 加密
    hashed = 密码哈希.hashpw(password_bytes, salt)
    
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码
    
    Args:
        plain_password: 明文密码
        hashed_password: 哈希值
        
    Returns:
        True: 密码正确
        False: 密码错误
    """
    plain_bytes = plain_password[:72].encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    
    return 密码哈希.checkpw(plain_bytes, hashed_bytes)
```

**测试密码安全**：

```python
# test_password.py
from core.security import set_password_hash, verify_password

# 加密
password = "123456"
hashed = set_password_hash(password)
print(f"哈希值: {hashed}")
print(f"长度: {len(hashed)}")

# 验证
print(f"正确密码: {verify_password('123456', hashed)}")  # True
print(f"错误密码: {verify_password('wrong', hashed)}")   # False

# 相同密码，不同哈希
hashed2 = set_password_hash(password)
print(f"哈希值不同: {hashed != hashed2}")  # True
print(f"都能验证: {verify_password('123456', hashed2)}")  # True
```

#### 1.4 测试认证流程（10分钟）

**使用 API 文档测试**：

```bash
# 1. 启动服务
uv run main.py run --env=dev

# 2. 打开浏览器
# 访问实际 SERVER_PORT 对应的 /docs，当前骨架默认示例：
http://localhost:8004/docs

# 3. 测试登录
POST /api/login
{
  "username": "admin",
  "password": "123456"
}

# 响应：
{
  "code": 200,
  "data": {
    "access_token": "eyJhbGci...",
    "token_type": "bearer",
    "expires_in": 1800
  }
}

# 4. 使用 Token 访问受保护接口
# 点击右上角 "Authorize" 按钮
# 输入：Bearer eyJhbGci...
# 点击 "Authorize"

# 5. 测试受保护接口
GET /api/profile
# 应该返回用户信息

# 6. 测试 Token 过期
# 等待 30 分钟后再次访问
# 应该返回 401 Unauthorized
```

---

### 🕚 休息（10:40-10:50，10分钟）

---

### 第二部分：第三方登录和接口限流扩展（10:50-12:00，70分钟）

#### 2.1 第三方登录流程（30分钟）

**扩展了解：第三方登录原理**（在白板上画图）：

```
【流程图】
第三方客户端                  后端服务器                平台服务器
   |                             |                         |
   | 获取授权 code              |                         |
   |--------------------------->|                         |
   |                             |                         |
   |<-- 返回 code               |                         |
   |                             |                         |
   | 发送 code 到后端           |                         |
   |------------------------->  |                         |
   |                             | 换取用户身份接口        |
   |                             |------------------------>|
   |                             |                         |
   |                             |<-- 用户唯一标识         |
   |                             |                         |
   |                             | 查询或创建用户          |
   |                             | 生成 JWT Token          |
   |                             |                         |
   |<-- 返回 Token              |                         |
   |                             |                         |
   | 存储 Token                 |                         |
   |                             |                         |
```

**后端伪代码**：

```python
def exchange_code_for_identity(code: str) -> dict:
    """用授权 code 向第三方平台换取用户身份。

    课堂只讲流程，不要求接入真实平台。
    """
    return {
        "external_id": "第三方平台用户唯一标识",
        "provider": "mock_provider"
    }
```

**登录接口**：

```python
# backend/app/plugin/module_ai/chat/service.py
class UserService:
    
    @staticmethod
    def third_party_login(db: Session, code: str) -> JWTOutSchema:
        """扩展了解：第三方登录。"""
        
        # === 步骤 1：用授权 code 换取外部身份 ===
        identity = exchange_code_for_identity(code)
        external_id = identity["external_id"]
        
        # === 步骤 2：查询或创建本系统用户 ===
        user = db.exec(
            select(User).where(User.username == external_id)
        ).first()
        
        if not user:
            user = User(
                name=f"外部用户_{external_id[-6:]}",
                username=external_id,
                password=set_password_hash(uuid4().hex),  # 随机密码
                status=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # === 步骤 3：仍然签发本系统 JWT ===
        payload = JWTPayloadSchema(
            sub=user.username,
            exp=datetime.now(timezone.utc) + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        )
        access_token = create_access_token(payload)
        
        token = JWTOutSchema(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        
        return token
```

#### 2.2 扩展了解：接口限流（Rate Limiting）（30分钟）

**为什么需要扩展了解：接口限流？**

```
防止：
❌ DDoS 攻击（大量请求压垮服务器）
❌ 恶意刷接口（爬虫、刷票）
❌ API 滥用（超出配额）

保护：
✅ 服务器资源
✅ OpenAI API 配额
✅ 数据库性能
```

**常见策略**：

```
1. 固定窗口（Fixed Window）
   - 每分钟最多 30 次
   - 简单但有突刺问题

2. 滑动窗口（Sliding Window）
   - 更精确
   - 实现复杂

3. 令牌桶（Token Bucket）
   - 允许突发流量
   - 实现最复杂

我们用固定窗口（简单够用）
```

**实现**：

```python
# backend/app/core/http_limit.py
from time import time
from typing import Dict, Tuple

class RateLimiter:
    """简单的内存扩展了解：接口限流器"""
    
    def __init__(self):
        # {client_key: (last_reset_time, request_count)}
        self._cache: Dict[str, Tuple[float, int]] = {}
        # {client_key: block_until_time}
        self._blocked: Dict[str, float] = {}
    
    def is_allowed(
        self,
        client_key: str,
        max_requests: int = 30,      # 最大请求数
        window_seconds: int = 60,    # 时间窗口（秒）
        block_seconds: int = 300,    # 封禁时长（秒）
    ) -> Tuple[bool, str]:
        """检查是否允许请求
        
        Returns:
            (是否允许, 错误信息)
        """
        
        current_time = time()
        
        # 检查是否在封禁期
        if client_key in self._blocked:
            block_until = self._blocked[client_key]
            if current_time < block_until:
                remaining = int(block_until - current_time)
                return False, f"请求过于频繁，请在 {remaining} 秒后重试"
            else:
                del self._blocked[client_key]
        
        # 检查请求频率
        if client_key in self._cache:
            last_reset, count = self._cache[client_key]
            
            if current_time - last_reset < window_seconds:
                if count >= max_requests:
                    # 超过限制，封禁
                    self._blocked[client_key] = current_time + block_seconds
                    return False, f"请求过于频繁，已封禁 {block_seconds} 秒"
                else:
                    # 增加计数
                    self._cache[client_key] = (last_reset, count + 1)
            else:
                # 时间窗口过期，重置
                self._cache[client_key] = (current_time, 1)
        else:
            # 首次请求
            self._cache[client_key] = (current_time, 1)
        
        return True, ""

# 全局实例
rate_limiter = RateLimiter()
```

**中间件实现**：

```python
# core/middlewares.py
class RateLimitMiddleware(BaseHTTPMiddleware):
    """扩展了解：接口限流中间件"""
    
    async def dispatch(self, request: Request, call_next):
        # 获取客户端标识（IP 地址）
        client_ip = request.client.host if request.client else "unknown"
        
        # 检查是否允许
        allowed, message = rate_limiter.is_allowed(
            client_key=client_ip,
            max_requests=30,
            window_seconds=60
        )
        
        if not allowed:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "code": 429,
                    "msg": message,
                    "data": None
                }
            )
        
        response = await call_next(request)
        return response

# 添加到应用
# main.py
app.add_middleware(RateLimitMiddleware)
```

#### 2.3 测试扩展了解：接口限流（10分钟）

```python
# test_rate_limit.py
import requests
import time

url = "http://localhost:8004/api/health-check"  # 端口以实际 SERVER_PORT 为准

# 快速发送 35 次请求
for i in range(35):
    response = requests.get(url)
    print(f"第 {i+1} 次请求: {response.status_code}")
    
    if response.status_code == 429:
        print(f"被限流: {response.json()}")
        break
    
    time.sleep(0.1)

# 预期：前 30 次成功，第 31 次返回 429
```

---

### 上午总结（12:00，5分钟）

**上午完成的内容**：
✅ JWT 身份认证（原理、实现、测试）
✅ 扩展了解：密码安全
✅ 扩展了解：第三方登录流程
✅ 扩展了解：接口限流（Rate Limiting）

**重点回顾**：
1. JWT 无状态认证，适合分布式系统
2. 密码必须加密存储（密码哈希）
3. 扩展了解：第三方登录通过外部用户标识识别用户
4. 扩展了解：接口限流保护服务器资源

**下午预告**：
- 项目部署准备
- 前后端联调
- 项目答辩准备
- 模拟答辩

中午休息，14:00 见！

---

## 讲师增强版：Day4 下午、答辩与完整收尾口径

Day4 的主线不是继续堆功能，而是把四天成果收束成一个可演示、可解释、可答辩的项目。上午讲安全认证和接口保护，下午讲联调、验收、答辩和后续扩展。

### 1. 下午开场话术（14:00-14:10）

> 前三天我们分别完成了环境和知识库、RAG 和 Prompt、证据和文书。今天下午要把这些功能串成一个完整演示：用户如何进入系统，如何提问，如何选择知识库，如何查看依据，如何整理证据，如何生成文书，最后如何说明系统边界。

板书：

```text
登录认证 -> AI 咨询 -> 知识库依据 -> 证据管理 -> 文书草稿 -> 项目答辩
```

### 2. 前后端联调讲解（14:10-15:00）

联调不要只看页面有没有按钮，要看链路证据：

| 页面动作 | 前端位置 | 后端接口 | 验收证据 |
|---|---|---|---|
| 登录 | 登录页 / request 拦截器 | 登录接口、JWT 校验 | 能拿到 token，受保护接口可访问 |
| 创建知识库 | 知识库页面 | `/ai/knowledge/create` | 数据库有知识库记录 |
| 上传文档 | 知识库文档区 | `/ai/knowledge/document/upload` | 文档状态解析/索引成功 |
| 检索测试 | 检索页面 | `/ai/knowledge/retrieval/test` | 返回相关 chunk |
| AI 咨询 | 聊天页面 | `/ai/chat/ai-chat` 或 WebSocket | 回答包含依据和边界 |

讲师话术：

> 联调的标准不是“页面没报错”，而是页面动作能落到接口、接口能落到数据库或向量库、最终能被用户看到。

### 3. 安全边界复盘（15:00-15:30）

安全认证讲完后，要回到业务风险：

| 风险 | 系统应对 |
|---|---|
| 未登录用户访问咨询记录 | JWT 校验和用户隔离 |
| A 用户看到 B 用户文档 | 数据查询必须带用户或权限边界 |
| API Key 泄露 | 密钥放环境变量，不投屏真实 Key |
| 模型输出被当成最终法律意见 | 页面和 Prompt 都强调人工复核 |
| 高频请求拖垮服务 | 限流、日志、异常处理 |

讲师提醒：

> 安全不是最后加一个登录按钮。只要系统保存用户材料、证据和咨询记录，就必须考虑身份、权限、数据隔离和审计。

### 4. 10 分钟项目答辩结构（15:40-16:30）

建议每组按这个顺序演示：

1. 项目背景：劳动者在劳动争议中缺少法律知识、证据组织和文书能力。
2. 系统目标：提供 AI 咨询、知识库依据、证据整理和文书草稿。
3. 架构说明：前端页面、后端接口、MySQL、Chroma、模型服务。
4. 功能演示：登录 -> 知识库 -> 检索 -> 咨询 -> 证据 -> 文书。
5. 技术亮点：RAG、Prompt 约束、证据结构化、JWT 权限、可观测验收。
6. 风险边界：AI 不替代律师，输出需人工复核。
7. 后续扩展：多知识库、混合检索、模板库、审计日志、评测集。

答辩话术示例：

> 我们的系统不是让大模型直接回答法律问题，而是先把劳动法材料和用户证据结构化，再通过 RAG 检索相关依据，最后用受约束的 Prompt 生成咨询建议或文书草稿。这样可以降低幻觉风险，并让回答有依据可追溯。

### 5. 常见追问标准回答（16:30-17:10）

**Q1：为什么不用纯大模型？**

A：纯大模型不了解本地材料和用户上传证据，容易出现无依据回答。RAG 可以先检索知识库，把依据放入上下文，再让模型生成回答。

**Q2：系统能不能替代律师？**

A：不能。系统定位是辅助咨询、证据整理和文书草稿生成，最终法律判断、金额确认和提交材料必须由专业人员或用户复核。

**Q3：回答不准怎么办？**

A：先看检索片段是否相关，再看 Prompt 是否约束清楚，然后看模型输出。不能只把问题归因给模型。

**Q4：项目最大的技术亮点是什么？**

A：把业务流程和 AI 能力结合起来：知识库检索提供依据，Prompt 控制输出边界，证据管理支撑文书生成，JWT 和权限保证数据访问边界。

**Q5：后续怎么扩展？**

A：可以扩展混合检索、法条版本管理、文书模板库、案件评测集、审计日志和多角色权限。

### 6. 最终验收清单（17:10-17:40）

每组至少提交或演示：

- 项目可启动，接口文档可访问。
- 知识库能创建、上传、索引和检索。
- AI 咨询能选择知识库并返回依据。
- 证据材料能被整理成结构化信息。
- 文书草稿能生成，并标注需人工复核。
- 登录认证或受保护接口能说明原理。
- 能画出或讲清系统架构图。
- 能回答“为什么需要 RAG”和“为什么不能替代律师”。

### 7. 四天课程收尾话术（17:40-18:00）

> 四天课程到这里，我们完成的不是一个孤立 Demo，而是一条完整的 AI 应用开发链路：从环境和工程结构开始，到知识库和 RAG，再到证据、文书、安全和答辩。以后大家做其他 AI 项目，也可以复用这套思路：先定义业务边界，再设计数据和接口，再接入模型，最后用验收证据证明系统真的跑通。

最后提醒学生：

- 不要把 AI 输出当最终法律意见。
- 不要把真实密钥、真实用户材料放到公开环境。
- 不要只演示页面，要能解释页面背后的接口、数据和 AI 链路。
- 项目答辩时优先讲清业务问题、架构链路和风险边界。

