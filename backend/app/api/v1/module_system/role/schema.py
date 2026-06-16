from fastapi import Query
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)

from app.api.v1.module_platform.menu.schema import MenuOutSchema
from app.api.v1.module_system.dept.schema import DeptOutSchema
from app.common.enums import QueueEnum
from app.core.base_schema import BaseSchema
from app.core.validator import (
    DateTimeStr,
    role_permission_request_validator,
    validate_required_code,
)


class RoleCreateSchema(BaseModel):
    """角色创建模型"""

    name: str = Field(..., min_length=1, max_length=64, description="角色名称")
    code: str = Field(..., min_length=2, max_length=64, description="角色编码")
    order: int | None = Field(default=1, ge=0, description="显示排序")
    data_scope: int | None = Field(
        default=1,
        ge=1,
        le=5,
        description="数据权限范围(1:仅本人 2:本部门 3:本部门及以下 4:全部 5:自定义)",
    )
    status: int = Field(default=0, ge=0, le=1, description="状态(0:正常 1:禁用)")
    description: str | None = Field(default=None, max_length=255, description="描述")

    @field_validator("code")
    @classmethod
    def validate_code(cls, value: str):
        """校验角色编码：字母开头，2-64 位，仅含字母/数字/下划线"""
        return validate_required_code(value)

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: int):
        """校验状态：仅支持 0(正常)、1(禁用)"""
        if value not in {0, 1}:
            raise ValueError("状态仅支持 0(正常) 或 1(禁用)")
        return value

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str):
        """校验角色名称：不能为空"""
        v = value.strip()
        if not v:
            raise ValueError("角色名称不能为空")
        return v


class RolePermissionSettingSchema(BaseModel):
    """角色权限配置模型"""

    data_scope: int = Field(
        default=1,
        description="数据权限范围(1:仅本人 2:本部门 3:本部门及以下 4:全部 5:自定义)",
    )
    role_ids: list[int] = Field(default_factory=list, description="角色ID列表")
    menu_ids: list[int] = Field(default_factory=list, description="菜单ID列表")
    dept_ids: list[int] = Field(default_factory=list, description="部门ID列表")

    @model_validator(mode="after")
    def validate_fields(self):
        """
        校验角色权限配置字段（数据范围与关联 ID 等）。

        参数:
        - self: 当前模型实例（校验后状态）。

        返回:
        - RolePermissionSettingSchema: 通过 `role_permission_request_validator` 校验后的同一实例。

        异常:
        - CustomException: 不满足权限配置约束时抛出。
        """
        return role_permission_request_validator(self)


class RoleUpdateSchema(RoleCreateSchema):
    """角色更新模型"""


class RoleOutSchema(RoleCreateSchema, BaseSchema):
    """角色信息响应模型"""

    model_config = ConfigDict(from_attributes=True)

    menus: list[MenuOutSchema] = Field(default_factory=list, description="角色菜单列表")
    depts: list[DeptOutSchema] = Field(default_factory=list, description="角色部门列表")


class RoleQueryParam:
    """角色管理查询参数"""

    def __init__(
        self,
        name: str | None = Query(None, description="角色名称"),
        description: str | None = Query(None, description="描述"),
        status: str | None = Query(None, description="是否启用"),
        created_time: list[DateTimeStr] | None = Query(
            None,
            description="创建时间范围",
            examples=["2025-01-01 00:00:00", "2025-12-31 23:59:59"],
        ),
        updated_time: list[DateTimeStr] | None = Query(
            None,
            description="更新时间范围",
            examples=["2025-01-01 00:00:00", "2025-12-31 23:59:59"],
        ),
    ) -> None:
        # 模糊查询字段
        self.name = (QueueEnum.like.value, name)
        if description:
            self.description = (QueueEnum.like.value, description)

        # 精确查询字段
        if status:
            self.status = (QueueEnum.eq.value, status)

        # 时间范围查询
        if created_time and len(created_time) == 2:
            self.created_time = (QueueEnum.between.value, (created_time[0], created_time[1]))
        if updated_time and len(updated_time) == 2:
            self.updated_time = (QueueEnum.between.value, (updated_time[0], updated_time[1]))
