from pydantic import BaseModel, ConfigDict, Field


class PluginCreateSchema(BaseModel):
    name: str = Field(..., max_length=100)
    code: str = Field(..., max_length=50)
    description: str | None = None
    version: str = "1.0.0"
    author: str | None = None
    icon: str | None = None
    category: str = "tool"
    price: int = 0
    menu_path: str | None = None
    permission_prefix: str | None = None
    dependencies: str | None = None
    sort: int = 0


class PluginUpdateSchema(BaseModel):
    name: str | None = None
    description: str | None = None
    version: str | None = None
    author: str | None = None
    icon: str | None = None
    category: str | None = None
    price: int | None = None
    menu_path: str | None = None
    permission_prefix: str | None = None
    dependencies: str | None = None
    sort: int | None = None
    status: str | None = None


class PluginOutSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    code: str
    description: str | None = None
    version: str
    author: str | None = None
    icon: str | None = None
    category: str
    price: int
    menu_path: str | None = None
    permission_prefix: str | None = None
    dependencies: str | None = None
    sort: int
    status: str
    installed: bool = False  # 当前租户是否已安装


class PluginQueryParam:
    def __init__(self, name: str | None = None, category: str | None = None, status: str | None = None):
        if name: self.name = ("like", name)
        if category: self.category = ("eq", category)
        if status: self.status = ("eq", status)


class PluginInstallSchema(BaseModel):
    plugin_id: int = Field(..., description="插件ID")
