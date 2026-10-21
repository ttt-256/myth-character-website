# 上古纪事 · 神话人物志

零依赖的中国上古神话人物展示站点：登录后进入首页，挑选人物，先读一段**逐字浮现**的人物故事，再进入**对话页**听人物逐字说话（可选语音朗读）。

登录是**真实的 服务端会话**：账号存在服务端、密码 scrypt 加盐哈希、登录下发 HttpOnly 签名 Cookie，前端不保存任何密码。服务端同样是零依赖（只用 Node 内置模块）。

## 站点结构

```
登录页  →  首页  →  人物馆  →  人物故事页  →  人物对话页
login    index    characters   nezha/wukong…   story?c=<id>
```

| 页面 | 文件 | 说明 |
| --- | --- | --- |
| 登录 / 注册 | `login.html` | 双 Tab，走服务端接口；支持可选的通行密钥登录（见下文） |
| 首页 | `index.html` | 红光标题、开始探索 / 关于本志 / 退出，底部六位人物快捷入口 |
| 人物馆 | `characters.html` | 六张毛玻璃卡片，点击进入该人物故事页 |
| 人物故事 | `nezha.html` 等六个 | 头像 + 副标题 + 逐字故事，读完弹出「重读 / 返回 / 进入对话」 |
| 人物对话 | `story.html?c=<id>` | 左侧人物名录，右侧逐字台词 + 浏览器语音朗读 |

## 目录

```
.
├── server.js           登录服务（零依赖 Node：静态托管 + /api/*）
├── package.json        npm start 即可启动
├── data/               运行时生成：users.json 账号库、.session-secret 签名密钥
│                       （已在 .gitignore 里，绝不入库）
├── index.html          首页
├── login.html          登录 / 注册
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
│   ├── auth.js         会话探测 + 页面守卫 + 登录/注册/登出的统一封装
│   ├── login.js        登录 / 注册交互
│   ├── passkey.js      通行密钥登录（可选，未配置接口时自动隐藏）
│   ├── bg.js           首页 Canvas 火星粒子背景
│   ├── index.js        首页交互
│   ├── characters.js   对话页人物数据（台词、标签、主题色）
│   ├── story.js        对话页逐字打字机 + 语音朗读
│   ├── select.js       人物馆交互（用户名、退出、数字键 1-6）
│   ├── tales.js        六位人物故事全文（唯一文本来源）
│   └── tale.js         故事页逐字浮现 + 头像更换
└── assets/
    ├── avatar-*.svg    占位头像（国风纹样 + 名字单字）
    └── avatars/        故事页 140px 头像位，放 <人物id>.jpg 即自动生效
```

## 启动

需要 Node 18+，无需安装任何依赖：

```bash
node server.js          # 或 npm start
# 默认 http://127.0.0.1:3000 ，可用 PORT=8080 node server.js 换端口
```

然后打开 `http://127.0.0.1:3000/login.html`，先「注册」一个账号（用户名 2-24 位，密码至少 6 位），注册成功会自动带回登录 Tab。

> 直接双击 `login.html`（file:// 方式）无法登录：没有服务端就没有会话。页面会明确提示「未连接登录服务」。

## 登录服务（server.js）

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/register` | POST | 建号；用户名唯一（大小写不敏感），密码 scrypt 加盐哈希 |
| `/api/login` | POST | 校验密码，成功下发 `mytho_sid` 会话 Cookie |
| `/api/logout` | POST | 清除 Cookie |
| `/api/me` | GET | 会话探测，返回 `{ ok, username }` 或 401 |

安全设计：

- **密码**：scrypt（N=16384）+ 每用户随机盐，库中无明文；比对用 `timingSafeEqual`
- **会话**：HMAC-SHA256 签名的无状态 Cookie，`HttpOnly` + `SameSite=Lax`，7 天有效；签名密钥在 `data/.session-secret`（首次启动生成，权限 600），重启不掉线
- **限流**：同一 IP 5 分钟内登录失败 8 次 → 429 拒绝
- **输入**：用户名 2-24 位（中英文/数字/下划线/点/短横线），密码至少 6 位，前后端各校验一次
- **托管**：`data/`、`server.js`、`package.json` 不通过 HTTP 暴露；路径穿越被 normalize + 前缀校验拦截
- 已知取舍：会话无状态，登出只清 Cookie，签发过的令牌到期前技术上仍可重放；提示「用户不存在 / 密码错误」会暴露账号是否存在（沿用了页面原有的提示文案），要改成统一话术改 `server.js` 两行即可

## 怎么改内容

**改人物台词**：`js/characters.js` 的 `CHARACTERS` 数组，每人 5 句 `{ text, note }`，对话页名录、进度点、翻页会自动适配。

**改人物故事**：`js/tales.js`，六个键对应六页，改文本即可，排版与交互不受影响。

**换头像**：
- 故事页顶部头像读 `assets/avatars/<人物id>.jpg`，放进去刷新即生效，缺图时自动退回 `assets/avatar-*.svg`
- 也可以在页面上点「更换头像」，但只存在当前浏览器（`localStorage`）
- 首页底部 / 登录页左侧的小头像在 `index.html`、`login.html` 里，直接改 `src`

**改主题色**：故事页的颜色全部是 `css/tale.css` 里 `body.bg-<人物>` 的 CSS 变量（`--accent` / `--title` / `--subtitle`）：
哪吒红橙、孙悟空金、杨戬冷青、嫦娥月白、夸父暮金、精卫青碧。

## 通行密钥登录（可选）

`js/passkey.js` 实现了 WebAuthn 通行密钥登录（含输入框自动填充的条件式调用）。
**默认关闭**：`CONFIG.apiBase` 为空时入口按钮整个隐藏，密码登录不受任何影响。

**启用**：把 `js/passkey.js` 顶部 `CONFIG.apiBase` 改成后端地址（如 `'/api'`），
或在引入脚本前设置 `window.PASSKEY_CONFIG = { apiBase: '/api' }`。

**后端接口契约**（前端已按此实现）：

```
POST {apiBase}/auth/passkey/options
  请求体：{}（不传用户名，走 discoverable credential）
  响应 200：PublicKeyCredentialRequestOptions（challenge 用 base64url，
            需含 rpId、timeout、userVerification）
  服务端应把 challenge 存入会话，供下一步比对

POST {apiBase}/auth/passkey/verify
  请求体：{ id, rawId, type, authenticatorAttachment,
            response: { clientDataJSON, authenticatorData, signature, userHandle },
            clientExtensionResults }   （均为 base64url）
  响应 200：{ "ok": true, "user": { "name": "用户名" } }，并下发本站会话 Cookie
  响应 4xx：验证失败
```

要求与注意：
- **必须 HTTPS**（`localhost` 除外），`rpId` 必须等于站点域名（不带端口和协议）
- 前端请求均带 `credentials: 'include'`，跨域部署时后端要配 CORS 允许凭据
- **验签必须在服务端做**（校验 challenge、origin、rpId、签名计数），前端无法自查
- 验证成功后前端会探测 `/api/me` 确认会话已建立，探不通会提示改用密码登录

后端选型建议：
1. **自建**：在 `server.js` 里加 `@simplewebauthn/server` 的两个接口即可
2. **托管身份服务**：Clerk、Auth0 等原生支持 passkey，适合不想碰加密细节的场景
3. WorkBuddy 云服务的账号体系（邮箱 / 短信 / 微信登录）**不包含** WebAuthn

## 技术说明

- 站点本体仍是纯静态、无构建、无框架；登录服务零依赖，只用 Node 内置模块
- 逐字效果基于 `setTimeout` 分段写入；语音朗读用浏览器自带 `speechSynthesis`（中文音色取决于系统语音包）
- 页面守卫：`js/auth.js` 在 `<head>` 里先遮住页面，向 `/api/me` 探测会话；未登录跳 `login.html?next=<原地址>`，探不到服务跳 `login.html?offline=1` 并给出启动提示

## 浏览器建议

Chrome / Edge 最新版。语音朗读需要用户先与页面交互过一次（浏览器自动播放策略），页面内有提示条。
