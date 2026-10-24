[
  {
    "name": "__MODULE_TITLE__",
    "title": "__MODULE_TITLE__",
    "type": 1,
    "icon": "ri:code-box-line",
    "order": 90,
    "route_name": "__MODULE_CLASS__",
    "route_path": "/__MODULE__",
    "redirect": "/__MODULE__/__RESOURCE__",
    "children": [
      {
        "name": "__TITLE__管理",
        "title": "__TITLE__管理",
        "type": 2,
        "icon": "ri:folder-line",
        "order": 1,
        "permission": "module___MODULE__:__RESOURCE__:query",
        "route_name": "__MODULE_CLASS____RESOURCE_CLASS__",
        "route_path": "__RESOURCE__",
        "component_path": "module___MODULE__/__RESOURCE__/index",
        "children": [
          {
            "name": "新增",
            "title": "新增",
            "type": 3,
            "order": 1,
            "permission": "module___MODULE__:__RESOURCE__:create"
          },
          {
            "name": "编辑",
            "title": "编辑",
            "type": 3,
            "order": 2,
            "permission": "module___MODULE__:__RESOURCE__:update"
          },
          {
            "name": "删除",
            "title": "删除",
            "type": 3,
            "order": 3,
            "permission": "module___MODULE__:__RESOURCE__:delete"
          },
          {
            "name": "详情",
            "title": "详情",
            "type": 3,
            "order": 4,
            "permission": "module___MODULE__:__RESOURCE__:detail"
          }
        ]
      }
    ]
  }
]
