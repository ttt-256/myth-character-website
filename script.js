/* ============================================================
   上古纪事 · 单页版脚本
   人物数据、逐字台词、AI 多轮对话（Supabase 云函数 + 本地兜底）
   ============================================================ */
(function () {
    'use strict';

    /* ============ ① Supabase 配置（接 AI 对话用） ============
       填上你的项目 URL 与 Publishable key，并部署好 chat 云函数后，
       就能与人物自由对话；留空则始终用本地台词代答。            */
    var SUPABASE_URL = 'https://jftlwzeynffxhjjwrdkr.supabase.co';
    var SUPABASE_KEY = 'sb_publishable_1c9kqUua6WuKExLsS_dO9Q_Kc8prVzM';
    /* ======================================================== */

    var AVATARS = {"nezha":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSLlk6rlkJIiPgogIDwhLS0g5Y2g5L2N5aS05YOPIMK3IOWTquWQku+9nOabv+aNoiBhc3NldHMvYXZhdGFyLW5lemhhLmpwZyDljbPlj6/mjaLmiJDoh6rlt7HnmoTnq4vnu5ggLS0+CiAgPGRlZnM+CiAgICA8cmFkaWFsR3JhZGllbnQgaWQ9ImJnIiBjeD0iNTAlIiBjeT0iMzYlIiByPSI3NCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMmExMjIwIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzBiMGExMiIvPgogICAgPC9yYWRpYWxHcmFkaWVudD4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0icmluZyIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmZkNzZhIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iNDYlIiBzdG9wLWNvbG9yPSIjZmY5YzRhIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2ZmM2IzYiIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iOTYiIGZpbGw9InVybCgjYmcpIi8+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI5NCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ1cmwoI3JpbmcpIiBzdHJva2Utd2lkdGg9IjQiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9Ijg0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmQ3NmEiIHN0cm9rZS1vcGFjaXR5PSIuMjIiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWRhc2hhcnJheT0iMyA3Ii8+CgogIDwhLS0g6I6y6IqxIC0tPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwMCw2NCkiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmOGE1YyIgc3Ryb2tlLXdpZHRoPSIyLjYiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+CiAgICA8cGF0aCBkPSJNMCwtMjcgQzksLTE2IDksLTUgMCw0IEMtOSwtNSAtOSwtMTYgMCwtMjdaIi8+CiAgICA8cGF0aCBkPSJNMSwtMTMgQzE0LC0xNyAyMywtOSAyMSwzIEM5LDIgMywtNCAxLC0xM1oiLz4KICAgIDxwYXRoIGQ9Ik0tMSwtMTMgQy0xNCwtMTcgLTIzLC05IC0yMSwzIEMtOSwyIC0zLC00IC0xLC0xM1oiLz4KICAgIDxwYXRoIGQ9Ik0zLDEgQzE2LDQgMjMsMTUgMTYsMjMgQzYsMTkgMywxMCAzLDFaIi8+CiAgICA8cGF0aCBkPSJNLTMsMSBDLTE2LDQgLTIzLDE1IC0xNiwyMyBDLTYsMTkgLTMsMTAgLTMsMVoiLz4KICAgIDxjaXJjbGUgY3g9IjAiIGN5PSItMyIgcj0iNC4yIiBmaWxsPSIjZmZkNzZhIiBzdHJva2U9Im5vbmUiLz4KICA8L2c+CgogIDx0ZXh0IHg9IjEwMCIgeT0iMTU4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iS2FpVGksIFNUS2FpdGksIFNpbVN1biwgc2VyaWYiCiAgICAgICAgZm9udC1zaXplPSI2MiIgZmlsbD0iI2ZmOGE1YyIgbGV0dGVyLXNwYWNpbmc9IjIiPuWTqjwvdGV4dD4KPC9zdmc+Cg==","wukong":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSLlrZnmgp/nqboiPgogIDwhLS0g5Y2g5L2N5aS05YOPIMK3IOWtmeaCn+epuu+9nOabv+aNoiBhc3NldHMvYXZhdGFyLXd1a29uZy5qcGcg5Y2z5Y+v5o2i5oiQ6Ieq5bex55qE56uL57uYIC0tPgogIDxkZWZzPgogICAgPHJhZGlhbEdyYWRpZW50IGlkPSJiZyIgY3g9IjUwJSIgY3k9IjM2JSIgcj0iNzQlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzJiMjQxMiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwYjBhMTIiLz4KICAgIDwvcmFkaWFsR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9InJpbmciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZjBiOCIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjQ2JSIgc3RvcC1jb2xvcj0iI2ZmYzk0YSIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZjZhMmIiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgoKICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9Ijk2IiBmaWxsPSJ1cmwoI2JnKSIvPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iOTQiIGZpbGw9Im5vbmUiIHN0cm9rZT0idXJsKCNyaW5nKSIgc3Ryb2tlLXdpZHRoPSI0Ii8+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI4NCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZkNzZhIiBzdHJva2Utb3BhY2l0eT0iLjIyIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1kYXNoYXJyYXk9IjMgNyIvPgoKICA8IS0tIOmHkeeujSAtLT4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDAsNjQpIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmQ3NmEiIHN0cm9rZS13aWR0aD0iMy4yIiBzdHJva2UtbGluZWNhcD0icm91bmQiPgogICAgPHBhdGggZD0iTS0zMCwtNCBDLTMwLC0yMCAtMTYsLTI4IDAsLTI4IEMxNiwtMjggMzAsLTIwIDMwLC00Ii8+CiAgICA8cGF0aCBkPSJNLTMwLC00IEMtMjQsNiAtMTIsMTAgMCwxMCBDMTIsMTAgMjQsNiAzMCwtNCIvPgogICAgPHBhdGggZD0iTTAsLTI4IEwwLC0zNCIvPgogICAgPHBhdGggZD0iTS0xNiwtMTUgQy0xMiwtMjEgLTYsLTIzIC0xLC0yMSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2Utb3BhY2l0eT0iLjcyIi8+CiAgICA8cGF0aCBkPSJNMTYsLTE1IEMxMiwtMjEgNiwtMjMgMSwtMjEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLW9wYWNpdHk9Ii43MiIvPgogICAgPGNpcmNsZSBjeD0iMCIgY3k9Ii0zNSIgcj0iNC41IiBmaWxsPSIjZmZkNzZhIiBzdHJva2U9Im5vbmUiLz4KICA8L2c+CgogIDx0ZXh0IHg9IjEwMCIgeT0iMTU4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iS2FpVGksIFNUS2FpdGksIFNpbVN1biwgc2VyaWYiCiAgICAgICAgZm9udC1zaXplPSI2MiIgZmlsbD0iI2ZmZDc2YSIgbGV0dGVyLXNwYWNpbmc9IjIiPuaCnzwvdGV4dD4KPC9zdmc+Cg==","erlang":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSLkuozpg47npZ4iPgogIDwhLS0g5Y2g5L2N5aS05YOPIMK3IOS6jOmDjuelnu+9nOabv+aNoiBhc3NldHMvYXZhdGFyLWVybGFuZy5qcGcg5Y2z5Y+v5o2i5oiQ6Ieq5bex55qE56uL57uYIC0tPgogIDxkZWZzPgogICAgPHJhZGlhbEdyYWRpZW50IGlkPSJiZyIgY3g9IjUwJSIgY3k9IjM2JSIgcj0iNzQlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzJiMWMxMiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwYjBhMTIiLz4KICAgIDwvcmFkaWFsR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9InJpbmciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZDc2YSIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjQ2JSIgc3RvcC1jb2xvcj0iI2ZmYTIzYSIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlMDQ1MWYiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgoKICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9Ijk2IiBmaWxsPSJ1cmwoI2JnKSIvPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iOTQiIGZpbGw9Im5vbmUiIHN0cm9rZT0idXJsKCNyaW5nKSIgc3Ryb2tlLXdpZHRoPSI0Ii8+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI4NCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZkNzZhIiBzdHJva2Utb3BhY2l0eT0iLjIyIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1kYXNoYXJyYXk9IjMgNyIvPgoKICA8IS0tIOmineS4iuWkqeecvCAtLT4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDAsNjQpIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmIwNGEiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj4KICAgIDxwYXRoIGQ9Ik0tMzIsMCBDLTIwLC0xNyAyMCwtMTcgMzIsMCBDMjAsMTcgLTIwLDE3IC0zMiwwWiIvPgogICAgPGNpcmNsZSBjeD0iMCIgY3k9IjAiIHI9IjkuNSIgZmlsbD0iI2ZmZDc2YSIgc3Ryb2tlPSJub25lIi8+CiAgICA8Y2lyY2xlIGN4PSIwIiBjeT0iMCIgcj0iNC4yIiBmaWxsPSIjM2ExNTA4IiBzdHJva2U9Im5vbmUiLz4KICAgIDxwYXRoIGQ9Ik0tMzYsLTExIEwtNDIsLTE3IE0zNiwtMTEgTDQyLC0xNyIgc3Ryb2tlLXdpZHRoPSIyLjQiIHN0cm9rZS1vcGFjaXR5PSIuNzUiLz4KICAgIDxwYXRoIGQ9Ik0tMTIsLTI1IEwtMTUsLTMxIE0xMiwtMjUgTDE1LC0zMSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2Utb3BhY2l0eT0iLjUiLz4KICA8L2c+CgogIDx0ZXh0IHg9IjEwMCIgeT0iMTU4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iS2FpVGksIFNUS2FpdGksIFNpbVN1biwgc2VyaWYiCiAgICAgICAgZm9udC1zaXplPSI2MiIgZmlsbD0iI2ZmYjA0YSIgbGV0dGVyLXNwYWNpbmc9IjIiPuaIrDwvdGV4dD4KPC9zdmc+Cg==","change":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSLlq6blqKUiPgogIDwhLS0g5Y2g5L2N5aS05YOPIMK3IOWrpuWope+9nOabv+aNoiBhc3NldHMvYXZhdGFyLWNoYW5nZS5qcGcg5Y2z5Y+v5o2i5oiQ6Ieq5bex55qE56uL57uYIC0tPgogIDxkZWZzPgogICAgPHJhZGlhbEdyYWRpZW50IGlkPSJiZyIgY3g9IjUwJSIgY3k9IjM2JSIgcj0iNzQlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzE0MWMzMCIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwYjBhMTIiLz4KICAgIDwvcmFkaWFsR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9InJpbmciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjQ2JSIgc3RvcC1jb2xvcj0iI2JjZDRmZiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM3YThlY2YiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgoKICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9Ijk2IiBmaWxsPSJ1cmwoI2JnKSIvPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iOTQiIGZpbGw9Im5vbmUiIHN0cm9rZT0idXJsKCNyaW5nKSIgc3Ryb2tlLXdpZHRoPSI0Ii8+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI4NCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY2ZlMGZmIiBzdHJva2Utb3BhY2l0eT0iLjIiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWRhc2hhcnJheT0iMyA3Ii8+CgogIDwhLS0g5byv5pyI5LiO5pif5a2QIC0tPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwMCw2NCkiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NmZTBmZiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiPgogICAgPHBhdGggZD0iTS04LC0yNiBBMjcgMjcgMCAxIDAgLTgsMjYgQTIxIDIxIDAgMSAxIC04LC0yNloiIGZpbGw9IiNlOGYwZmYiIGZpbGwtb3BhY2l0eT0iLjE0Ii8+CiAgICA8Y2lyY2xlIGN4PSIxOCIgY3k9Ii0xNiIgcj0iMi42IiBmaWxsPSIjZmZkNzZhIiBzdHJva2U9Im5vbmUiLz4KICAgIDxjaXJjbGUgY3g9IjI1IiBjeT0iMiIgcj0iMS44IiBmaWxsPSIjZmZkNzZhIiBzdHJva2U9Im5vbmUiLz4KICAgIDxjaXJjbGUgY3g9IjE0IiBjeT0iMTgiIHI9IjEuNCIgZmlsbD0iI2ZmZDc2YSIgc3Ryb2tlPSJub25lIiBvcGFjaXR5PSIuOCIvPgogIDwvZz4KCiAgPHRleHQgeD0iMTAwIiB5PSIxNTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJLYWlUaSwgU1RLYWl0aSwgU2ltU3VuLCBzZXJpZiIKICAgICAgICBmb250LXNpemU9IjYyIiBmaWxsPSIjY2ZlMGZmIiBsZXR0ZXItc3BhY2luZz0iMiI+5aumPC90ZXh0Pgo8L3N2Zz4K","kuafu":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSLlpLjniLYiPgogIDwhLS0g5Y2g5L2N5aS05YOPIMK3IOWkuOeItu+9nOabv+aNoiBhc3NldHMvYXZhdGFyLWt1YWZ1LmpwZyDljbPlj6/mjaLmiJDoh6rlt7HnmoTnq4vnu5ggLS0+CiAgPGRlZnM+CiAgICA8cmFkaWFsR3JhZGllbnQgaWQ9ImJnIiBjeD0iNTAlIiBjeT0iMzYlIiByPSI3NCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMmUxYTBlIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzBiMGExMiIvPgogICAgPC9yYWRpYWxHcmFkaWVudD4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0icmluZyIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmZlMDhhIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iNDYlIiBzdG9wLWNvbG9yPSIjZmY5YzRhIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2Q0M2MxYyIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iOTYiIGZpbGw9InVybCgjYmcpIi8+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI5NCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ1cmwoI3JpbmcpIiBzdHJva2Utd2lkdGg9IjQiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9Ijg0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmQ3NmEiIHN0cm9rZS1vcGFjaXR5PSIuMjIiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWRhc2hhcnJheT0iMyA3Ii8+CgogIDwhLS0g5aSq6ZizIC0tPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwMCw2NCkiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmOWM0YSIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiPgogICAgPGNpcmNsZSBjeD0iMCIgY3k9IjAiIHI9IjE1IiBmaWxsPSIjZmY4YTNkIiBmaWxsLW9wYWNpdHk9Ii4yIi8+CiAgICA8ZyBzdHJva2Utd2lkdGg9IjIuNiI+CiAgICAgIDxwYXRoIGQ9Ik0wLC0yNSBMMCwtMzMgTTAsMjUgTDAsMzMgTS0yNSwwIEwtMzMsMCBNMjUsMCBMMzMsMCIvPgogICAgICA8cGF0aCBkPSJNLTE4LC0xOCBMLTI0LC0yNCBNMTgsLTE4IEwyNCwtMjQgTS0xOCwxOCBMLTI0LDI0IE0xOCwxOCBMMjQsMjQiLz4KICAgIDwvZz4KICA8L2c+CgogIDx0ZXh0IHg9IjEwMCIgeT0iMTU4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iS2FpVGksIFNUS2FpdGksIFNpbVN1biwgc2VyaWYiCiAgICAgICAgZm9udC1zaXplPSI2MiIgZmlsbD0iI2ZmOWM0YSIgbGV0dGVyLXNwYWNpbmc9IjIiPuWkuDwvdGV4dD4KPC9zdmc+Cg==","jingwei":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSLnsr7ljasiPgogIDwhLS0g5Y2g5L2N5aS05YOPIMK3IOeyvuWNq++9nOabv+aNoiBhc3NldHMvYXZhdGFyLWppbmd3ZWkuanBnIOWNs+WPr+aNouaIkOiHquW3seeahOeri+e7mCAtLT4KICA8ZGVmcz4KICAgIDxyYWRpYWxHcmFkaWVudCBpZD0iYmciIGN4PSI1MCUiIGN5PSIzNiUiIHI9Ijc0JSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMwZTJhMjYiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMGIwYTEyIi8+CiAgICA8L3JhZGlhbEdyYWRpZW50PgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJyaW5nIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNjOWZmZjAiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSI0NiUiIHN0b3AtY29sb3I9IiM3ZmUwYzAiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMmY5YzhhIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KCiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI5NiIgZmlsbD0idXJsKCNiZykiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9Ijk0IiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjcmluZykiIHN0cm9rZS13aWR0aD0iNCIvPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iODQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzdmZTBjMCIgc3Ryb2tlLW9wYWNpdHk9Ii4yMiIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtZGFzaGFycmF5PSIzIDciLz4KCiAgPCEtLSDpo57puJ/ooZTnn7MgLS0+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAwLDYyKSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjN2ZlMGMwIiBzdHJva2Utd2lkdGg9IjMuMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KICAgIDxwYXRoIGQ9Ik0tMzQsNiBDLTI0LC0xMiAtMTIsLTEyIC0yLDIgQzgsLTEyIDIwLC0xMiAzMCw2Ii8+CiAgICA8Y2lyY2xlIGN4PSIwIiBjeT0iMjIiIHI9IjUuNSIgZmlsbD0iI2ZmZDc2YSIgZmlsbC1vcGFjaXR5PSIuNTUiIHN0cm9rZT0iI2ZmZDc2YSIgc3Ryb2tlLXdpZHRoPSIxLjYiLz4KICA8L2c+CgogIDx0ZXh0IHg9IjEwMCIgeT0iMTU4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iS2FpVGksIFNUS2FpdGksIFNpbVN1biwgc2VyaWYiCiAgICAgICAgZm9udC1zaXplPSI2MiIgZmlsbD0iIzdmZTBjMCIgbGV0dGVyLXNwYWNpbmc9IjIiPueyvjwvdGV4dD4KPC9zdmc+Cg=="};

    var CHARACTERS = [{"id":"nezha","name":"哪吒","title":"三坛海会大神","color":"#ff8a5c","intro":"灵珠子转世，莲花化身。削肉还母、剔骨还父，而后以藕为骨、以荷为肉，重生于火中。","tags":["莲花重生","火尖枪","乾坤圈","混天绫"],"lines":[{"text":"我乃托塔李天王三太子，哪吒是也。","note":"—— 东海之滨，少年自报家门"},{"text":"莲花为身，藕为骨。我从火里生，也从火里长。","note":"—— 太乙真人以莲藕重塑其身"},{"text":"混天绫、乾坤圈、火尖枪——这三件宝物，随我踏过东海的浪。","note":"—— 三宝随身，闹海扬名"},{"text":"我曾削肉还母，剔骨还父。可我不后悔。","note":"—— 一句话，换一身清白"},{"text":"命由我不由天。若天要压我，我便反了这天。","note":"—— 少年归位，风火轮起"}]},{"id":"wukong","name":"孙悟空","title":"齐天大圣","color":"#ffd76a","intro":"花果山灵石所生，拜菩提祖师为师。大闹天宫，压于五行山下五百年，后保唐僧西行，终成斗战胜佛。","tags":["七十二变","筋斗云","金箍棒","火眼金睛"],"lines":[{"text":"俺老孙乃花果山美猴王，齐天大圣！","note":"—— 水帘洞前，一呼百应"},{"text":"师父给我取名悟空，我便悟了这一个「空」字。","note":"—— 灵台方寸山，斜月三星洞"},{"text":"七十二变，一个筋斗云十万八千里。","note":"—— 技成归山，天宫震动"},{"text":"大闹天宫那一日，十万天兵，也拦不住我一根金箍棒。","note":"—— 凌霄殿外，无人可挡"},{"text":"金箍棒重一万三千五百斤，我压在五行山下，也压了五百年。","note":"—— 五行山下，静待取经人"}]},{"id":"erlang","name":"杨戬","title":"清源妙道真君","color":"#ffb04a","intro":"杨戬，玉帝外甥。额生天眼，能辨虚实。曾劈山救母，也曾与齐天大圣斗得难分胜负。","tags":["额上天眼","三尖两刃刀","哮天犬","听调不听宣"],"lines":[{"text":"我杨戬，灌江口二郎真君。","note":"—— 灌江口上，香火不绝"},{"text":"额上天眼一开，世间虚妄皆无所遁形。","note":"—— 天眼之下，妖魔现形"},{"text":"哮天犬随我左右，三尖两刃刀从不离身。","note":"—— 一犬一刀，走遍三界"},{"text":"我劈开桃山救出母亲，也曾在花果山与那猴子斗上百合。","note":"—— 七十二变对七十二变"},{"text":"听调不听宣——这是我的规矩。","note":"—— 玉帝也奈何不得的傲气"}]},{"id":"change","name":"嫦娥","title":"月宫仙子","color":"#cfe0ff","intro":"后羿之妻。误食西王母所赐仙药，身轻飞升，居于广寒宫，与玉兔、桂树相伴千年。","tags":["广寒宫","玉兔捣药","桂花香远","碧海青天"],"lines":[{"text":"广寒宫冷，桂花香远。","note":"—— 一宫一人，一树千年"},{"text":"我吞下那一丸仙药，身子便轻了，轻得像要飘出去。","note":"—— 那一夜，月色极好"},{"text":"玉兔捣药，吴刚伐桂，千年如此，不曾停歇。","note":"—— 月宫里的三样寂寞"},{"text":"人间团圆时，我在这清冷的月宫里，望向故乡。","note":"—— 碧海青天夜夜心"},{"text":"若再选一次……我大概，还是会吞下它。","note":"—— 话音很轻，散在风里"}]},{"id":"kuafu","name":"夸父","title":"逐日者","color":"#ff9c4a","intro":"上古巨人，立志追上西沉的太阳。渴饮黄河、渭水，道渴而死，弃杖化为桃林。","tags":["逐日","饮河渭","邓林","巨人"],"lines":[{"text":"我要追上那轮太阳，问它为何不肯停一停。","note":"—— 日出之地，他迈开第一步"},{"text":"渴了，饮黄河、渭水；不够，便去饮大泽的水。","note":"—— 河渭不足，饮于大泽"},{"text":"道渴而死。我丢下的那根手杖，化作了一片桃林。","note":"—— 弃其杖，化为邓林"},{"text":"后人笑我不自量力。可若无人去追，太阳岂不是永远孤独？","note":"—— 他要的从来不是追上"},{"text":"纵死，也要奔向光。","note":"—— 桃林年年开花，红得像火"}]},{"id":"jingwei","name":"精卫","title":"炎帝之女","color":"#7fe0c0","intro":"炎帝之女女娃，溺于东海，化为神鸟精卫。日日衔西山木石，投于东海，欲平其浪。","tags":["衔木石","填东海","衔冤","不死之志"],"lines":[{"text":"我本炎帝之女，名叫女娃。","note":"—— 那时她还会笑"},{"text":"东海夺了我的性命，我便化作一只鸟，名叫精卫。","note":"—— 溺而不返，故为精卫"},{"text":"衔西山之木石，以堙于东海。","note":"—— 一趟，一趟，又一趟"},{"text":"一日一石，一日一木。哪怕海枯，我也不会停。","note":"—— 她的翅膀很小，海很大"},{"text":"总有一日，这海，会被我填平。","note":"—— 据说不曾有人见她停下"}]}];

    var $ = function (id) { return document.getElementById(id); };
    var CHAT_KEY = 'chat_';
    var CHAT_MAX = 40;
    var charIndex = 0;
    var lineIndex = 0;
    var typeTimer = null;
    var chatting = false;

    /* ---------- 台词打字机 ---------- */
    function stopTyping() {
        if (typeTimer !== null) { clearInterval(typeTimer); typeTimer = null; }
        $('bubbleText').classList.remove('typing');
    }

    function typeLine(text) {
        stopTyping();
        var el = $('bubbleText');
        el.textContent = '';
        el.classList.add('typing');
        var i = 0;
        typeTimer = setInterval(function () {
            i++;
            el.textContent = text.slice(0, i);
            if (i >= text.length) {
                clearInterval(typeTimer);
                typeTimer = null;
                el.classList.remove('typing');
            }
        }, 70);
    }

    /* ---------- 渲染 ---------- */
    function renderRoster() {
        var box = $('roster');
        box.innerHTML = '<div class="roster-head">人 物 名 录</div>';
        CHARACTERS.forEach(function (ch, i) {
            var btn = document.createElement('button');
            btn.className = 'roster-card';
            btn.type = 'button';
            btn.dataset.index = String(i);
            btn.innerHTML =
                '<img alt="' + ch.name + '">' +
                '<span class="roster-meta"><span class="roster-name">' + ch.name + '</span>' +
                '<span class="roster-title">' + ch.title + '</span></span>';
            btn.querySelector('img').src = AVATARS[ch.id];
            btn.addEventListener('click', function () { selectCharacter(i); });
            box.appendChild(btn);
        });
        markActiveRoster();
    }

    function markActiveRoster() {
        var cards = $('roster').querySelectorAll('.roster-card');
        for (var i = 0; i < cards.length; i++) {
            cards[i].classList.toggle('active', Number(cards[i].dataset.index) === charIndex);
        }
    }

    function renderStage(ch) {
        $('stageAvatar').src = AVATARS[ch.id];
        $('stageName').textContent = ch.name;
        $('stageTitle').textContent = ch.title;
        $('stageIntro').textContent = ch.intro;
        document.querySelector('.stage').style.setProperty('--c', ch.color);
        document.querySelector('.avatar-wrap').style.filter =
            'drop-shadow(0 0 22px ' + ch.color + '66)';
        var row = $('tagRow');
        row.innerHTML = '';
        ch.tags.forEach(function (t) {
            var s = document.createElement('span');
            s.className = 'tag';
            s.textContent = t;
            row.appendChild(s);
        });
        $('chatInput').placeholder = '想对' + ch.name + '说点什么…';
    }

    function renderProgress(ch) {
        var box = $('progress');
        box.innerHTML = '';
        ch.lines.forEach(function (_, i) {
            var d = document.createElement('button');
            d.className = 'dot';
            d.type = 'button';
            d.title = '第 ' + (i + 1) + ' 句';
            d.addEventListener('click', function () { showLine(i); });
            box.appendChild(d);
        });
        var c = document.createElement('span');
        c.className = 'count';
        box.appendChild(c);
        markProgress(ch);
    }

    function markProgress(ch) {
        var dots = $('progress').querySelectorAll('.dot');
        for (var i = 0; i < dots.length; i++) {
            dots[i].classList.toggle('active', i === lineIndex);
        }
        $('progress').querySelector('.count').textContent =
            (lineIndex + 1) + ' / ' + ch.lines.length;
    }

    function showLine(index) {
        var ch = CHARACTERS[charIndex];
        lineIndex = Math.max(0, Math.min(ch.lines.length - 1, index));
        $('bubbleNote').textContent = ch.lines[lineIndex].note || '';
        markProgress(ch);
        typeLine(ch.lines[lineIndex].text);
    }

    function selectCharacter(i) {
        charIndex = (i + CHARACTERS.length) % CHARACTERS.length;
        var ch = CHARACTERS[charIndex];
        renderStage(ch);
        markActiveRoster();
        renderProgress(ch);
        renderChatHistory(ch);
        showLine(0);
    }

    /* ---------- AI 多轮对话 ---------- */
    function chatHistory(id) {
        try { return JSON.parse(localStorage.getItem(CHAT_KEY + id) || '[]'); }
        catch (e) { return []; }
    }

    function saveChatHistory(id, arr) {
        try { localStorage.setItem(CHAT_KEY + id, JSON.stringify(arr.slice(-CHAT_MAX))); }
        catch (e) { /* 隐私模式忽略 */ }
    }

    function appendMsg(role, text, ch, offlineNote) {
        var log = $('chatLog');
        var div = document.createElement('div');
        div.className = 'msg ' + (role === 'user' ? 'me' : 'char');
        if (role === 'char') {
            var ava = document.createElement('img');
            ava.className = 'ava';
            ava.alt = '';
            ava.src = AVATARS[ch.id];
            div.appendChild(ava);
        }
        var b = document.createElement('div');
        b.className = 'b';
        if (role === 'char') {
            var who = document.createElement('span');
            who.className = 'who';
            who.textContent = ch.name;
            b.appendChild(who);
        }
        b.appendChild(document.createTextNode(text));
        if (offlineNote) {
            var note = document.createElement('span');
            note.className = 'offline-note';
            note.textContent = offlineNote;
            b.appendChild(note);
        }
        div.appendChild(b);
        log.appendChild(div);
        log.scrollTop = log.scrollHeight;
        return div;
    }

    function renderChatHistory(ch) {
        var log = $('chatLog');
        log.innerHTML = '';
        chatHistory(ch.id).forEach(function (m) { appendMsg(m.role, m.content, ch); });
    }

    function askAI(ch, history) {
        if (!/^https?:\/\//.test(SUPABASE_URL) || SUPABASE_KEY.length < 20) {
            return Promise.reject(new Error('not-configured'));
        }
        return fetch(SUPABASE_URL.replace(/\/+$/, '') + '/functions/v1/chat', {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + SUPABASE_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                persona: { name: ch.name, title: ch.title, intro: ch.intro, tags: ch.tags, lines: ch.lines },
                messages: history
            })
        }).then(function (r) {
            return r.json().then(function (j) {
                if (!r.ok) throw new Error(j.error || ('HTTP ' + r.status));
                return j.reply;
            });
        });
    }

    function localReply(text, ch) {
        for (var i = 0; i < ch.lines.length; i++) {
            var t = ch.lines[i].text;
            for (var j = 0; j < text.length - 1; j++) {
                if (t.indexOf(text.substr(j, 2)) > -1) return t;
            }
        }
        return ch.lines[Math.floor(Math.random() * ch.lines.length)].text;
    }

    function sendChat() {
        var input = $('chatInput');
        var text = (input.value || '').trim();
        if (!text || chatting) return;
        input.value = '';

        var ch = CHARACTERS[charIndex];
        appendMsg('user', text, ch);
        var history = chatHistory(ch.id);
        history.push({ role: 'user', content: text });
        saveChatHistory(ch.id, history);

        chatting = true;
        var typing = appendMsg('char', '', ch);
        typing.classList.add('typing');
        typing.querySelector('.b').textContent = '···';

        function finish(reply, offlineNote) {
            typing.remove();
            appendMsg('char', reply, ch, offlineNote);
            history.push({ role: 'assistant', content: reply });
            saveChatHistory(ch.id, history);
            chatting = false;
        }

        askAI(ch, history.slice(-30))
            .then(function (reply) { finish(reply); })
            .catch(function () { finish(localReply(text, ch), '（此刻云游在外，以此句代答）'); });
    }

    function clearChat() {
        var ch = CHARACTERS[charIndex];
        if (!confirm('清空与「' + ch.name + '」的全部对话记录？')) return;
        try { localStorage.removeItem(CHAT_KEY + ch.id); } catch (e) { /* noop */ }
        renderChatHistory(ch);
    }

    /* ---------- 启动 ---------- */
    function init() {
        renderRoster();
        $('prevBtn').addEventListener('click', function () {
            var ch = CHARACTERS[charIndex];
            if (lineIndex > 0) showLine(lineIndex - 1);
            else selectCharacter(charIndex - 1);
        });
        $('nextBtn').addEventListener('click', function () {
            var ch = CHARACTERS[charIndex];
            if (lineIndex < ch.lines.length - 1) showLine(lineIndex + 1);
            else selectCharacter(charIndex + 1);
        });
        $('replayBtn').addEventListener('click', function () { showLine(lineIndex); });
        $('chatSend').addEventListener('click', sendChat);
        $('chatInput').addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); sendChat(); }
        });
        $('chatClear').addEventListener('click', clearChat);
        document.addEventListener('keydown', function (e) {
            if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
            if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); showLine(lineIndex + 1); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); showLine(lineIndex - 1); }
        });

        /* 支持 index.html?c=erlang 直达指定人物 */
        var start = 0;
        try {
            var id = new URLSearchParams(window.location.search).get('c');
            CHARACTERS.forEach(function (ch, i) { if (ch.id === id) start = i; });
        } catch (e) { /* noop */ }
        selectCharacter(start);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
