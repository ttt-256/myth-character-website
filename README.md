# 上古纪事 · 神话人物志

零依赖的中国上古神话人物展示站点：登录后进入首页，挑选人物，先读一段**逐字浮现**的人物故事，再进入**对话页**听人物逐字说话（可选语音朗读）。

登录是**真实的云端账号体系（Supabase Auth）**：邮箱 + 密码注册/登录，验证在 Supabase 云端完成，本站不保存任何密码，会话由 supabase-js 自动续期。站点本体纯静态，不需要自建后端也能跑。

> ⚠️ **配置**：把 Supabase 的 Publishable key（`sb_publishable_` 开头）填进 `js/auth.js` 顶部 `CONFIG.anonKey`。
> 没填之前站点会进入「免登录预览」模式：所有页面可看，底部有金色提示条，登录表单上会明确说明。
> 另外建议在 Supabase 后台 → Authentication → Providers → Email 里**关掉 Confirm email**，注册即可直接进站。

## 站点结构

```
登录页  →  首页  →  人物馆  →  人物故事页  →  人物对话页
login    index    characters   nezha/wukong…   story?c=<id>
```

| 页面 | 文件 | 说明 |
| --- | --- | --- |
| 登录 / 注册 | `login.html` | 双 Tab，邮箱 + 密码，走 Supabase Auth |
| 首页 | `index.html` | 红光标题、开始探索 / 关于本志 / 退出，底部六位人物快捷入口 |
| 人物馆 | `characters.html` | 六张卡片（两列网格、专属光色），点击进入该人物故事页 |
| 人物故事 | `nezha.html` 等六个 | 头像 + 副标题 + 逐字故事，读完弹出「重读 / 返回 / 进入对话」 |
| 人物对话 | `story.html?c=<id>` | 左侧人物名录，右侧逐字台词 + 浏览器语音朗读 |

## 目录

```
.
├── server.js           本地预览服务器（静态托管；旧的账号接口已退役但保留）
├── package.json        npm start 即可启动
├── data/               （历史遗留）旧版用户名密码账号库，现登录已不使用
├── index.html          首页
├── login.html          登录 / 注册（邮箱）
├── characters.html     人物馆（第二页）
├── story.html          人物对话页
├── nezha.html          哪吒 · 故事页
├── wukong.html         孙悟空 · 故事页
├── yangjian.html       杨戬 · 故事页
├── change.html         嫦娥 · 故事页
├── kuafu.html          夸父 · 故事页
├── jingwei.html        精卫 · 故事页
├── css/
│   ├── style.css       首页 / 对话页
│   ├── login.css       登录页
│   ├── characters.css  人物馆
│   └── tale.css        故事页（六页共用，颜色由 CSS 变量驱动）
├── js/
│   ├── auth.js         Supabase 接入 + 会话探测 + 页面守卫（Publishable key 填在顶部 CONFIG）
│   ├── vendor/
│   │   └── supabase.js supabase-js@2 本地副本（优先加载，CDN 兜底）
│   ├── login.js        登录 / 注册交互（邮箱）
│   ├── passkey.js      通行密钥登录（已退役：绑定的是旧 Node 接口，页面未加载）
│   ├── bg.js           首页 Canvas 火星粒子背景
│   ├── index.js        首页交互
│   ├── characters.js   对话页人物数据（台词、标签、主题色）
│   ├── story.js        对话页逐字打字机 + 语音朗读
│   ├── select.js       人物馆交互（卡片生成、光色、数字键 1-6）
│   ├── tales.js        六位人物故事全文（唯一文本来源）
│   └── tale.js         故事页逐字浮现 + 头像更换
└── assets/
    ├── avatar-*.svg    占位头像（国风纹样 + 名字单字）
    └── avatars/        故事页 140px 头像位，放 <人物id>.jpg 即自动生效
```

## 启动

站点本体纯静态，三种跑法任选：

```bash
# 1. 什么都不装：双击任意 html（file:// 方式登录可能不稳定，见下方说明）
# 2. 任意静态服务器，比如：
npx serve .
# 3. 用自带的小服务器（零依赖）：
node server.js          # 或 npm start，默认 http://127.0.0.1:3000
```

打开 `login.html`，用**邮箱 + 密码**（至少 6 位）注册；Supabase 关掉邮箱验证后注册即登录。

> **必须先填 key**：`js/auth.js` 顶部 `CONFIG.anonKey`。没填时全站免登录可看（底部有提示条），注册/登录会提示「尚未配置」。
> Supabase 免费版对匿名请求有速率限制，公网部署时注意。

## 登录服务（Supabase Auth）

| 操作 | 前端调用 | 说明 |
| --- | --- | --- |
| 注册 | `auth.signUp({ email, password })` | 关掉邮箱验证时直接返回会话；开着则提示去邮箱点链接 |
| 登录 | `auth.signInWithPassword()` | 校验在 Supabase 云端，本站不经手密码 |
| 登出 | `auth.signOut()` | 清本地会话 |
| 会话探测 | `auth.getSession()` | 页面守卫用，本地读取 + 自动续期 |

安全说明：

- 密码校验全部在 Supabase 云端完成，前端与任何中间层都拿不到明文
- 页面守卫是**前端门禁**（隐藏/跳转页面），站内没有需要保密的数据时够用；如果以后接入真正的私人数据，必须在 Supabase 里启用 **RLS（行级安全）**，让数据接口本身验证会话
- Supabase 的 Publishable key 是公钥，放前端是安全的；**不要**把 service_role key 放进前端

## 怎么改内容

**改人物台词**：`js/characters.js` 的 `CHARACTERS` 数组，每人 5 句 `{ text, note }`，对话页名录、进度点、翻页会自动适配。

**改人物故事**：`js/tales.js`，六个键对应六页，改文本即可，排版与交互不受影响。

**换头像**：
- 故事页顶部头像读 `assets/avatars/<人物id>.jpg`，放进去刷新即生效，缺图时自动退回 `assets/avatar-*.svg`
- 也可以在页面上点「更换头像」，但只存在当前浏览器（`localStorage`）
- 首页底部 / 登录页左侧的小头像在 `index.html`、`login.html` 里，直接改 `src`

**改主题色**：故事页的颜色全部是 `css/tale.css` 里 `body.bg-<人物>` 的 CSS 变量（`--accent` / `--title` / `--subtitle`）：
哪吒红橙、孙悟空金、杨戬冷青、嫦娥月白、夸父暮金、精卫青碧。

## 通行密钥登录（已退役）

`js/passkey.js` 是之前给自建后端实现的 WebAuthn 通行密钥登录（含输入框条件式自动填充）。
切换到 Supabase 后**页面已不再加载它**，文件保留备查：Supabase 新版 Auth 支持 passkey，
以后想接可以在登录页把 `signInWithIdToken` / WebAuthn 流程挂回来。

## 技术说明

- 站点纯静态、无构建、无框架；supabase-js@2 已下载到 `js/vendor/supabase.js` 本地优先加载（jsDelivr CDN 兜底），运行时不依赖 CDN
- 逐字效果基于 `setTimeout` 分段写入；语音朗读用浏览器自带 `speechSynthesis`（中文音色取决于系统语音包）
- 页面守卫：`js/auth.js` 在 `<head>` 里先遮住页面，读 Supabase 会话；未登录跳 `login.html?next=<原地址>`；Supabase 未配置或连不上时进入「免登录预览」并在底部显示提示条

## 浏览器建议

Chrome / Edge 最新版。语音朗读需要用户先与页面交互过一次（浏览器自动播放策略），页面内有提示条。
