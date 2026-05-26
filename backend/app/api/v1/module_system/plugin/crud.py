from app.api.v1.module_system.auth.schema import AuthSchema
from app.core.base_crud import CRUDBase

from .model import PluginModel
from .schema import PluginCreateSchema, PluginUpdateSchema


class PluginCRUD(CRUDBase[PluginModel, PluginCreateSchema, PluginUpdateSchema]):
    def __init__(self, auth: AuthSchema) -> None:
        self.auth = auth
        super().__init__(model=PluginModel, auth=auth)
