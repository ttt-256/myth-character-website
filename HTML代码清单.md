# 「上古纪事」HTML 源码清单

> 项目 `mythology-site` ｜ 分支 `main` ｜ 提交 `254e9f2` ｜ 导出时间 2026-10-18 16:36

> 共 **10** 个 HTML 文件 ｜ 合计 **611** 行 ｜ **31,246** 字节

每个文件单独编号、单独成段，代码块可整段复制。顺序按站点实际访问流程排列（登录 → 首页 → 人物馆 → 故事页 → 对话页），不是字母序。

## 文件目录

| # | 文件 | 说明 | 行数 | 字节 |
|---|---|---|---|---|
| 01 | `login.html` | 登录 / 注册（入口页） | 111 | 5,628 |
| 02 | `index.html` | 首页（红光标题 + 开始探索 / 关于 / 退出） | 92 | 4,344 |
| 03 | `characters.html` | 人物馆（毛玻璃卡片网格，六位人物入口） | 64 | 2,427 |
| 04 | `nezha.html` | 故事页 · 哪吒 | 43 | 1,432 |
| 05 | `wukong.html` | 故事页 · 孙悟空 | 43 | 1,446 |
| 06 | `yangjian.html` | 故事页 · 杨戬 | 43 | 1,443 |
| 07 | `change.html` | 故事页 · 嫦娥 | 43 | 1,437 |
| 08 | `kuafu.html` | 故事页 · 夸父 | 43 | 1,432 |
| 09 | `jingwei.html` | 故事页 · 精卫 | 43 | 1,442 |
| 10 | `story.html` | 人物对话页（逐字打字机 + 语音朗读） | 86 | 10,215 |

---

## 使用说明

1. 复制某个文件的代码块，存为同名 `.html`，放回 `mythology-site/` 根目录即可运行。
2. **这些页面依赖同目录的 `css/`、`js/`、`assets/`**，单独拷走一个 HTML 会丢样式和交互。需要「单文件即可运行」的自包含版本，得把 CSS/JS 内联，可以另行生成。
3. 所有页面共用 `js/auth.js` 做登录守卫：未登录访问会跳回 `login.html`，属预期行为。

---

## 01 · login.html

> 登录 / 注册（入口页） ｜ 111 行 ｜ 5,181 字符

````html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>登录｜上古纪事</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/login.css">
    <script src="js/auth.js"></script>
</head>
<body>

    <canvas id="bgCanvas"></canvas>

    <main class="page login-page">
        <div class="login-wrap">

            <!-- 左：品牌区 -->
            <section class="login-brand">
                <p class="eyebrow">上 古 纪 事</p>
                <h1 class="brand-title">上古纪事</h1>
                <p class="brand-sub">一卷神话 · 六位传奇</p>

                <div class="brand-rule" aria-hidden="true"></div>
                <p class="brand-quote">「凭一纸名姓，<br>入这一卷山海。」</p>

                <div class="brand-faces" aria-hidden="true">
                    <img src="assets/avatar-nezha.svg" alt="哪吒">
                    <img src="assets/avatar-wukong.svg" alt="孙悟空">
                    <img src="assets/avatar-erlang.svg" alt="杨戬">
                    <img src="assets/avatar-change.svg" alt="嫦娥">
                    <img src="assets/avatar-kuafu.svg" alt="夸父">
                    <img src="assets/avatar-jingwei.svg" alt="精卫">
                </div>
            </section>

            <!-- 右：登录 / 注册 -->
            <section class="login-panel">
                <div class="auth-card">

                    <div class="auth-tabs" role="tablist" aria-label="登录或注册">
                        <button class="auth-tab active" id="tabLogin" type="button" role="tab"
                                aria-selected="true" aria-controls="loginForm">登录</button>
                        <button class="auth-tab" id="tabRegister" type="button" role="tab"
                                aria-selected="false" aria-controls="registerForm">注册</button>
                    </div>

                    <!-- 登录表单 -->
                    <form class="auth-form" id="loginForm" novalidate>
                        <div class="field">
                            <label class="field-label" for="loginUser">用户名</label>
                            <!-- autocomplete 末尾的 webauthn 是条件式通行密钥自动填充的必要标记 -->
                            <input type="text" id="loginUser" placeholder="输入用户名"
                                   autocomplete="username webauthn" spellcheck="false">
                        </div>
                        <div class="field">
                            <label class="field-label" for="loginPwd">密码</label>
                            <input type="password" id="loginPwd" placeholder="输入密码"
                                   autocomplete="current-password">
                        </div>
                        <p class="auth-msg" id="msg" role="status" aria-live="polite"></p>
                        <button class="game-button auth-submit" type="submit">登 录</button>

                        <!-- 通行密钥（可选）。未配置后端接口时由 js/passkey.js 自动隐藏 -->
                        <div class="passkey-box" id="passkeyBox" hidden>
                            <div class="passkey-divider" aria-hidden="true"><span>或</span></div>
                            <button class="passkey-btn" id="passkeyBtn" type="button">
                                <span class="passkey-icon" aria-hidden="true">◈</span>
                                使用通行密钥登录
                            </button>
                            <p class="passkey-msg" id="passkeyMsg" role="status" aria-live="polite"></p>
                        </div>
                    </form>

                    <!-- 注册表单 -->
                    <form class="auth-form" id="registerForm" novalidate style="display:none;">
                        <div class="field">
                            <label class="field-label" for="regUser">用户名</label>
                            <input type="text" id="regUser" placeholder="创建用户名"
                                   autocomplete="username" spellcheck="false">
                        </div>
                        <div class="field">
                            <label class="field-label" for="regPwd">密码</label>
                            <input type="password" id="regPwd" placeholder="创建密码"
                                   autocomplete="new-password">
                        </div>
                        <div class="field">
                            <label class="field-label" for="regPwd2">确认密码</label>
                            <input type="password" id="regPwd2" placeholder="再次输入密码"
                                   autocomplete="new-password">
                        </div>
                        <p class="auth-msg" id="msg2" role="status" aria-live="polite"></p>
                        <button class="game-button auth-submit" type="submit">注 册</button>
                    </form>

                    <p class="auth-note">
                        账号保存在本机浏览器中，换设备或清理浏览器数据后需要重新注册。
                        本站仅用于展示，请勿使用真实常用密码。
                    </p>

                </div>
            </section>

        </div>
    </main>

    <script src="js/bg.js"></script>
    <script src="js/login.js"></script>
    <script src="js/passkey.js"></script>
</body>
</html>
````

---

## 02 · index.html

> 首页（红光标题 + 开始探索 / 关于 / 退出） ｜ 92 行 ｜ 3,512 字符

````html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>上古纪事｜神话人物故事集</title>
    <meta name="description" content="上古纪事 · 神话人物故事集 —— 一卷神话，六位传奇。走进哪吒、孙悟空、杨戬、嫦娥、夸父、精卫的故事。">

    <!-- 登录门禁：未登录则先跳转 login.html -->
    <script src="js/auth.js"></script>
    <script>if (window.MythoAuth) { window.MythoAuth.require(); }</script>

    <link rel="stylesheet" href="css/style.css">
</head>
<body>

    <canvas id="bgCanvas"></canvas>

    <main class="page home">

        <!-- 朱砂印章（装饰） -->
        <div class="seal" aria-hidden="true">神话<br>人物志</div>

        <p class="eyebrow">上古纪事<br>神魔流章</p>
        <h1 class="main-title">神话人物故事集</h1>
        <p class="subtitle">一卷神话 · 书写传奇</p>

        <div class="divider" aria-hidden="true">
            <i></i><span>❖</span><i></i>
        </div>

        <div class="button-group">
            <button class="game-button" id="startBtn" type="button">开始探索</button>
            <button class="game-button ghost" id="aboutBtn" type="button">关于本志</button>
            <button class="game-button quiet" id="exitBtn" type="button">退出</button>
        </div>

        <!-- 六位人物剪影，点击直达 -->
        <div class="roster-strip" aria-label="人物快捷入口">
            <img src="assets/avatar-nezha.svg"   data-id="nezha"   alt="哪吒">
            <img src="assets/avatar-wukong.svg"  data-id="wukong"  alt="孙悟空">
            <img src="assets/avatar-erlang.svg"  data-id="erlang"  alt="杨戬">
            <img src="assets/avatar-change.svg"  data-id="change"  alt="嫦娥">
            <img src="assets/avatar-kuafu.svg"   data-id="kuafu"   alt="夸父">
            <img src="assets/avatar-jingwei.svg" data-id="jingwei" alt="精卫">
        </div>

        <p class="home-foot">
            <span class="foot-who" id="whoami"></span>
            建议开启声音 · 可听到人物逐字朗读
            <span class="foot-sep" aria-hidden="true">|</span>
            <button class="foot-link" id="logoutBtn" type="button">退出登录</button>
        </p>
    </main>

    <!-- 关于本志 -->
    <div class="overlay" id="aboutOverlay" role="dialog" aria-modal="true" aria-label="关于本志">
        <div class="dialog">
            <button class="close-x" data-close type="button" aria-label="关闭">×</button>
            <h3>关于本志</h3>
            <p>「上古纪事 · 神话人物故事集」收录了六位中国上古神话与传说中的角色：哪吒、孙悟空、杨戬、嫦娥、夸父、精卫。</p>
            <p>浏览顺序：登录 → 首页 →「开始探索」进入人物选择 → 人物详情 → 人物对话。每位人物配有专属台词与场景旁白，文字逐字浮现，并可同步语音朗读。</p>
            <p class="hint">
                操作提示：<br>
                · 点击左侧名录切换人物<br>
                · 「下一句 / 上一句」翻动台词，末句再点即跳下一位<br>
                · 快捷键 ← → 翻页，空格 下一句，R 重播<br>
                · 「自动连播」可让人物自己说下去
            </p>
            <div class="dialog-actions">
                <button class="btn-mini primary" data-close type="button">知道了</button>
            </div>
        </div>
    </div>

    <!-- 退出确认 -->
    <div class="overlay" id="exitOverlay" role="dialog" aria-modal="true" aria-label="退出确认">
        <div class="dialog">
            <button class="close-x" data-close type="button" aria-label="关闭">×</button>
            <h3>确定要退出吗？</h3>
            <p>六位人物还在等你，要不……再多留一会儿？</p>
            <div class="dialog-actions">
                <button class="btn-mini" data-close type="button">再逛逛</button>
                <button class="btn-mini primary" id="exitConfirm" type="button">退出</button>
            </div>
        </div>
    </div>

    <script src="js/bg.js"></script>
    <script src="js/index.js"></script>
</body>
</html>
````

---

## 03 · characters.html

> 人物馆（毛玻璃卡片网格，六位人物入口） ｜ 64 行 ｜ 2,140 字符

````html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>人物馆｜上古纪事</title>

    <!-- 登录门禁：未登录则先跳转 login.html -->
    <script src="js/auth.js"></script>
    <script>if (window.MythoAuth) { window.MythoAuth.require(); }</script>

    <link rel="stylesheet" href="css/characters.css">
</head>
<body>

<div id="userInfo"></div>
<button class="logout-btn" onclick="logout()">退出登录</button>

<div class="header">
    <h1>上古纪事</h1>
    <div class="divider"></div>
    <p class="subtitle">一卷神话 · 六位传奇<br>凭一纸名姓，入这一卷山海</p>
</div>

<!-- 六个人物卡片 -->
<div class="character-grid">
    <div class="char-card" tabindex="0" onclick="location.href='nezha.html'">
        <div class="char-avatar">吒</div>
        <div class="char-name">哪吒</div>
        <div class="char-tag">莲花化身 · 少年战神</div>
    </div>
    <div class="char-card" tabindex="0" onclick="location.href='wukong.html'">
        <div class="char-avatar">悟</div>
        <div class="char-name">孙悟空</div>
        <div class="char-tag">齐天大圣 · 斗战胜佛</div>
    </div>
    <div class="char-card" tabindex="0" onclick="location.href='yangjian.html'">
        <div class="char-avatar">戬</div>
        <div class="char-name">杨戬</div>
        <div class="char-tag">二郎真君 · 天眼通幽</div>
    </div>
    <div class="char-card" tabindex="0" onclick="location.href='change.html'">
        <div class="char-avatar">娥</div>
        <div class="char-name">嫦娥</div>
        <div class="char-tag">月宫仙子 · 清辉千年</div>
    </div>
    <div class="char-card" tabindex="0" onclick="location.href='kuafu.html'">
        <div class="char-avatar">夸</div>
        <div class="char-name">夸父</div>
        <div class="char-tag">逐日巨人 · 志在光明</div>
    </div>
    <div class="char-card" tabindex="0" onclick="location.href='jingwei.html'">
        <div class="char-avatar is-two">精卫</div>
        <div class="char-name">精卫</div>
        <div class="char-tag">衔石填海 · 执念不渝</div>
    </div>
</div>

<p class="footer-tip">✦ 点击人物，开启专属故事 ✦</p>
<a class="back-home" href="index.html">← 返回首页</a>

<script src="js/select.js"></script>
</body>
</html>
````

---

## 04 · nezha.html

> 故事页 · 哪吒 ｜ 43 行 ｜ 1,253 字符

````html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>哪吒｜上古纪事</title>

    <!-- 登录门禁：未登录则先跳转 login.html -->
    <script src="js/auth.js"></script>
    <script>if (window.MythoAuth) { window.MythoAuth.require(); }</script>

    <link rel="stylesheet" href="css/tale.css">
</head>
<body class="bg-nezha" data-char="nezha" data-story="nezha">

<button class="back" onclick="taleGoBack()">← 返回人物馆</button>

<div class="avatar-box">
    <img src="assets/avatars/nezha.jpg" alt="哪吒头像" data-fallback="assets/avatar-nezha.svg">
</div>
<div class="upload-area">
    <label for="avatarUpload">更换头像</label>
    <input type="file" id="avatarUpload" accept="image/*">
</div>

<h1>哪吒</h1>
<p class="char-subtitle">莲花化身 · 少年战神</p>
<p class="skip-tip">点击页面任意处可跳过逐字动画</p>
<div class="box" id="storyBox"></div>

<!-- 读完后的交互弹窗 -->
<div class="mask" id="mask"></div>
<div class="dialog" id="dialog">
    <p>故事已读完，你想？</p>
    <button onclick="taleGoBack()">返回人物馆</button>
    <button onclick="restartStory()">重读故事</button>
    <button class="ghost" id="talkBtn">进入人物对话</button>
</div>

<script src="js/tales.js"></script>
<script src="js/tale.js"></script>
</body>
</html>
````

---

## 05 · wukong.html

> 故事页 · 孙悟空 ｜ 43 行 ｜ 1,261 字符

````html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>孙悟空｜上古纪事</title>

    <!-- 登录门禁：未登录则先跳转 login.html -->
    <script src="js/auth.js"></script>
    <script>if (window.MythoAuth) { window.MythoAuth.require(); }</script>

    <link rel="stylesheet" href="css/tale.css">
</head>
<body class="bg-wukong" data-char="wukong" data-story="wukong">

<button class="back" onclick="taleGoBack()">← 返回人物馆</button>

<div class="avatar-box">
    <img src="assets/avatars/wukong.jpg" alt="孙悟空头像" data-fallback="assets/avatar-wukong.svg">
</div>
<div class="upload-area">
    <label for="avatarUpload">更换头像</label>
    <input type="file" id="avatarUpload" accept="image/*">
</div>

<h1>孙悟空</h1>
<p class="char-subtitle">齐天大圣 · 斗战胜佛</p>
<p class="skip-tip">点击页面任意处可跳过逐字动画</p>
<div class="box" id="storyBox"></div>

<!-- 读完后的交互弹窗 -->
<div class="mask" id="mask"></div>
<div class="dialog" id="dialog">
    <p>故事已读完，你想？</p>
    <button onclick="taleGoBack()">返回人物馆</button>
    <button onclick="restartStory()">重读故事</button>
    <button class="ghost" id="talkBtn">进入人物对话</button>
</div>

<script src="js/tales.js"></script>
<script src="js/tale.js"></script>
</body>
</html>
````

---

## 06 · yangjian.html

> 故事页 · 杨戬 ｜ 43 行 ｜ 1,264 字符

````html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>杨戬｜上古纪事</title>

    <!-- 登录门禁：未登录则先跳转 login.html -->
    <script src="js/auth.js"></script>
    <script>if (window.MythoAuth) { window.MythoAuth.require(); }</script>

    <link rel="stylesheet" href="css/tale.css">
</head>
<body class="bg-yangjian" data-char="yangjian" data-story="erlang">

<button class="back" onclick="taleGoBack()">← 返回人物馆</button>

<div class="avatar-box">
    <img src="assets/avatars/yangjian.jpg" alt="杨戬头像" data-fallback="assets/avatar-erlang.svg">
</div>
<div class="upload-area">
    <label for="avatarUpload">更换头像</label>
    <input type="file" id="avatarUpload" accept="image/*">
</div>

<h1>杨戬</h1>
<p class="char-subtitle">二郎真君 · 天眼通幽</p>
<p class="skip-tip">点击页面任意处可跳过逐字动画</p>
<div class="box" id="storyBox"></div>

<!-- 读完后的交互弹窗 -->
<div class="mask" id="mask"></div>
<div class="dialog" id="dialog">
    <p>故事已读完，你想？</p>
    <button onclick="taleGoBack()">返回人物馆</button>
    <button onclick="restartStory()">重读故事</button>
    <button class="ghost" id="talkBtn">进入人物对话</button>
</div>

<script src="js/tales.js"></script>
<script src="js/tale.js"></script>
</body>
</html>
````

---

## 07 · change.html

> 故事页 · 嫦娥 ｜ 43 行 ｜ 1,258 字符

````html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>嫦娥｜上古纪事</title>

    <!-- 登录门禁：未登录则先跳转 login.html -->
    <script src="js/auth.js"></script>
    <script>if (window.MythoAuth) { window.MythoAuth.require(); }</script>

    <link rel="stylesheet" href="css/tale.css">
</head>
<body class="bg-change" data-char="change" data-story="change">

<button class="back" onclick="taleGoBack()">← 返回人物馆</button>

<div class="avatar-box">
    <img src="assets/avatars/change.jpg" alt="嫦娥头像" data-fallback="assets/avatar-change.svg">
</div>
<div class="upload-area">
    <label for="avatarUpload">更换头像</label>
    <input type="file" id="avatarUpload" accept="image/*">
</div>

<h1>嫦娥</h1>
<p class="char-subtitle">月宫仙子 · 清辉千年</p>
<p class="skip-tip">点击页面任意处可跳过逐字动画</p>
<div class="box" id="storyBox"></div>

<!-- 读完后的交互弹窗 -->
<div class="mask" id="mask"></div>
<div class="dialog" id="dialog">
    <p>故事已读完，你想？</p>
    <button onclick="taleGoBack()">返回人物馆</button>
    <button onclick="restartStory()">重读故事</button>
    <button class="ghost" id="talkBtn">进入人物对话</button>
</div>

<script src="js/tales.js"></script>
<script src="js/tale.js"></script>
</body>
</html>
````

---

## 08 · kuafu.html

> 故事页 · 夸父 ｜ 43 行 ｜ 1,253 字符

````html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>夸父｜上古纪事</title>

    <!-- 登录门禁：未登录则先跳转 login.html -->
    <script src="js/auth.js"></script>
    <script>if (window.MythoAuth) { window.MythoAuth.require(); }</script>

    <link rel="stylesheet" href="css/tale.css">
</head>
<body class="bg-kuafu" data-char="kuafu" data-story="kuafu">

<button class="back" onclick="taleGoBack()">← 返回人物馆</button>

<div class="avatar-box">
    <img src="assets/avatars/kuafu.jpg" alt="夸父头像" data-fallback="assets/avatar-kuafu.svg">
</div>
<div class="upload-area">
    <label for="avatarUpload">更换头像</label>
    <input type="file" id="avatarUpload" accept="image/*">
</div>

<h1>夸父</h1>
<p class="char-subtitle">逐日巨人 · 志在光明</p>
<p class="skip-tip">点击页面任意处可跳过逐字动画</p>
<div class="box" id="storyBox"></div>

<!-- 读完后的交互弹窗 -->
<div class="mask" id="mask"></div>
<div class="dialog" id="dialog">
    <p>故事已读完，你想？</p>
    <button onclick="taleGoBack()">返回人物馆</button>
    <button onclick="restartStory()">重读故事</button>
    <button class="ghost" id="talkBtn">进入人物对话</button>
</div>

<script src="js/tales.js"></script>
<script src="js/tale.js"></script>
</body>
</html>
````

---

## 09 · jingwei.html

> 故事页 · 精卫 ｜ 43 行 ｜ 1,263 字符

````html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>精卫｜上古纪事</title>

    <!-- 登录门禁：未登录则先跳转 login.html -->
    <script src="js/auth.js"></script>
    <script>if (window.MythoAuth) { window.MythoAuth.require(); }</script>

    <link rel="stylesheet" href="css/tale.css">
</head>
<body class="bg-jingwei" data-char="jingwei" data-story="jingwei">

<button class="back" onclick="taleGoBack()">← 返回人物馆</button>

<div class="avatar-box">
    <img src="assets/avatars/jingwei.jpg" alt="精卫头像" data-fallback="assets/avatar-jingwei.svg">
</div>
<div class="upload-area">
    <label for="avatarUpload">更换头像</label>
    <input type="file" id="avatarUpload" accept="image/*">
</div>

<h1>精卫</h1>
<p class="char-subtitle">衔石填海 · 执念不渝</p>
<p class="skip-tip">点击页面任意处可跳过逐字动画</p>
<div class="box" id="storyBox"></div>

<!-- 读完后的交互弹窗 -->
<div class="mask" id="mask"></div>
<div class="dialog" id="dialog">
    <p>故事已读完，你想？</p>
    <button onclick="taleGoBack()">返回人物馆</button>
    <button onclick="restartStory()">重读故事</button>
    <button class="ghost" id="talkBtn">进入人物对话</button>
</div>

<script src="js/tales.js"></script>
<script src="js/tale.js"></script>
</body>
</html>
````

---

## 10 · story.html

> 人物对话页（逐字打字机 + 语音朗读） ｜ 86 行 ｜ 9,631 字符

````html
<!DOCTYPE html>
<html lang="zh-CN" data-page-node-id="XIttvLLeeol3d27EzsSSJL"><head data-page-node-id="jr9zywonEK37ckK3nFtAWz">
    <meta charset="UTF-8" data-page-node-id="H3mhBuLvo44zFQIg0L2uZB">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" data-page-node-id="jyqPl0C2OXOHU45E26TKVk">
    <title data-page-node-id="0DHqFBdow0VUvQN3ozvUG4">人物对话｜上古纪事</title>
    <link rel="stylesheet" href="css/style.css" data-page-node-id="Olx9g41Nou6sHQ11TmIA26">

    <!-- 登录门禁：未登录则先跳转 login.html -->
    <script src="js/auth.js"></script>
    <script>if (window.MythoAuth) { window.MythoAuth.require(); }</script>

<style id="__dm_no_drag_style__">* { -webkit-user-drag: none !important; }</style><style id="__dm_bindable_badge_style__">[data-sp-bindable="database"]{outline:1px dashed #0088ff;outline-offset:2px;border-radius:4px;}[data-sp-bindable="database"] *{pointer-events:none !important;transition:none !important;animation:none !important;}[data-sp-bindable="database"]{transition:none !important;animation:none !important;}</style></head>
<body data-page-node-id="JeuvrnaJE0eTZOgghGK1IK" style="">

    <canvas id="bgCanvas" width="723" height="842" style="width: 579px; height: 674px;" data-page-node-id="cAbp0wYpNL6mYgbQuQGjaj"></canvas>

    <div class="page" data-page-node-id="XYuiacmgY41sTG8qgiuGHn">

        <!-- 顶栏 -->
        <header class="topbar" data-page-node-id="ODuCUGWBBD8vukzaJYg8Fs">
            <a class="back-link" href="characters.html" data-page-node-id="saTEMDBmISEn61XwF3xb29">← 人物选择</a>
            <span class="topbar-title" data-page-node-id="TorJUTIZpvUBKonNooyddP" style="white-space: pre-wrap;">上古纪事</span>
            <span class="topbar-spacer" data-page-node-id="zSKhbFV5aqAr2ZdLMADcIv"></span>
            <button class="voice-toggle" id="speedBtn" type="button" title="切换朗读语速" data-page-node-id="rT0TGZVTB9OzPbeH9xqAsU">语速 · 中</button>
            <button class="voice-toggle on" id="voiceBtn" type="button" title="语音朗读开关" data-page-node-id="InIFytkpYGDfORJJCLtEVC">
                <span class="ico" data-page-node-id="NT2lDGWE8a7Ymx6tpihrNp">🔊</span><span class="label" data-page-node-id="Jz7HafiBpUFIHG2xXBJXdO">语音朗读 · 开</span>
            </button>
        </header>

        <main class="story-layout" data-page-node-id="dYgCFGFEVACalPcvq9Pf5z">

            <!-- 左：人物名录 -->
            <aside class="roster" id="roster" aria-label="人物名录" data-page-node-id="4GQTszkbVLMCgKSqTKNgjE"><div class="roster-head" data-page-node-id="rCbz6WEQ3RViwHf5XrHYs2">人 物 名 录</div><button class="roster-card active" type="button" data-index="0" data-page-node-id="ntBiXAVZH5R9HKDz9BIUqn"><img src="assets/avatar-nezha.svg" alt="哪吒" data-page-node-id="kNZlvwbFiGQRQFT6EsIoRF"><span class="roster-meta" data-page-node-id="NbFDDeX93TbvRVcPJ7rSIo"><span class="roster-name" data-page-node-id="mQnsiESdWD9Q7eVAAnYcZF">哪吒</span><span class="roster-title" data-page-node-id="eT7iPzyPmJ8bB33yvv7id3">三坛海会大神</span></span></button><button class="roster-card" type="button" data-index="1" data-page-node-id="d3mBEN0pA0GSJUbeJaKFby"><img src="assets/avatar-wukong.svg" alt="孙悟空" data-page-node-id="0im81vk6e4ijESrc7kgOcM"><span class="roster-meta" data-page-node-id="OYE4ptK7qDtKTWTeGCRrtc"><span class="roster-name" data-page-node-id="Mim7VE4eoBcCfyCkhGJ2gn">孙悟空</span><span class="roster-title" data-page-node-id="tKvGKWNg1qUn0f3aL1LY7H">齐天大圣</span></span></button><button class="roster-card" type="button" data-index="2" data-page-node-id="L4V98QcxoO19cTQlD3VXeS"><img src="assets/avatar-erlang.svg" alt="二郎神" data-page-node-id="lqy5Q7rxDLDMipPrwKwbkT"><span class="roster-meta" data-page-node-id="hrf5YFYIQTWIvhhxwUWVLB"><span class="roster-name" data-page-node-id="ngMNrwZzMz0Bc6Ij0cSXdf">二郎神</span><span class="roster-title" data-page-node-id="wm74rP5vaQQkCSau9xLlwg">清源妙道真君</span></span></button><button class="roster-card" type="button" data-index="3" data-page-node-id="Dj7qf7nNq0FwNXOvvhHf68"><img src="assets/avatar-change.svg" alt="嫦娥" data-page-node-id="AxY14QeHSjwCKA5lfMrL2S"><span class="roster-meta" data-page-node-id="YuqgG2G52AUybZoI9d3Z5s"><span class="roster-name" data-page-node-id="08Ywytsl2ikxUWbzDfb3Fn">嫦娥</span><span class="roster-title" data-page-node-id="RZRxslsPXdRoKP7jKftbmG">月宫仙子</span></span></button><button class="roster-card" type="button" data-index="4" data-page-node-id="EnxzLtAKo6VYgFQAcCOAIV"><img src="assets/avatar-kuafu.svg" alt="夸父" data-page-node-id="APiDwVhllZixIo7ApG7CA9"><span class="roster-meta" data-page-node-id="pIGY0GXd0HqjXb5cGYVvMJ"><span class="roster-name" data-page-node-id="NQ9TEL7MvvSFRzW00pUHRe">夸父</span><span class="roster-title" data-page-node-id="x641NK1wmNNuQmty3KqCJG">逐日者</span></span></button><button class="roster-card" type="button" data-index="5" data-page-node-id="fISaZ0JCWJScrHH9y8mx2W"><img src="assets/avatar-jingwei.svg" alt="精卫" data-page-node-id="hyyQmsRL39GJ3L18GcpAZd"><span class="roster-meta" data-page-node-id="xvbrSdE3nabDvotJGAOmoO"><span class="roster-name" data-page-node-id="luolSi9me6tNXjsv00haM9">精卫</span><span class="roster-title" data-page-node-id="MGSnfjEtsy7DsxsRhqDl9e">炎帝之女</span></span></button></aside>

            <!-- 右：对话舞台 -->
            <section class="stage" data-page-node-id="3wscdET2Bi9B254AWmchQ3">

                <div class="stage-top" data-page-node-id="8ANyvafd4FU3AG8FWUpvjb">
                    <div class="avatar-wrap" style="--char-color: #ff8a5c; filter: drop-shadow(rgba(255, 138, 92, 0.42) 0px 0px 22px);" data-page-node-id="AztluezF6fDYE9Lds86Avl">
                        <img id="stageAvatar" src="assets/avatar-nezha.svg" alt="哪吒" style="" data-page-node-id="VdIZDWYUQEKX9GbOgUBllO">
                    </div>
                    <div class="stage-id" data-page-node-id="1eAznTRnYUYksQXFeIyBlD">
                        <h1 class="stage-name" id="stageName" data-page-node-id="TQXakIdMFeEiVCesMvuBjH">哪吒</h1>
                        <p class="stage-title" id="stageTitle" data-page-node-id="VE3lDg7tkX8eGWx6UuPMHD">三坛海会大神</p>
                        <div class="tag-row" id="tagRow" data-page-node-id="DbW3IUg81IKEeJPPaHWqyo"><span class="tag" data-page-node-id="CkWcd9lsR1rFflauzsJtPc">莲花重生</span><span class="tag" data-page-node-id="h7r0jEgFAlAnDFtogKx7PD">火尖枪</span><span class="tag" data-page-node-id="DUggDKfzVNHcAVGnPVrwOF">乾坤圈</span><span class="tag" data-page-node-id="zYIS4iuTFH7Hb0xwYghYh1">混天绫</span></div>
                    </div>
                </div>

                <p class="stage-intro" id="stageIntro" data-page-node-id="wapUIzQj5ZimFYGvHkImjd">灵珠子转世，莲花化身。削肉还母、剔骨还父，而后以藕为骨、以荷为肉，重生于火中。</p>

                <div class="bubble" data-page-node-id="phFIRFYZP4ktqfCJMeicKT">
                    <div class="bubble-text" id="bubbleText" data-page-node-id="53P42ZPoFceHqzbGCsCdTp">莲花为身，藕为骨。我从火里生，也从火里长。</div>
                    <div class="bubble-note" id="bubbleNote" data-page-node-id="ESpuF7ZRxfuVX4iwolTsfF">—— 太乙真人以莲藕重塑其身</div>
                </div>

                <div class="controls" data-page-node-id="x7iCel3USXs5ffQZpY1Ozb">
                    <button class="ctrl-btn" id="prevBtn" type="button" data-page-node-id="rdIE98k2JZV05tAi1Q0TqU">
                        <span class="ico" data-page-node-id="YYQOgJBtIcqNJSYbbidi21">←</span><span class="label" data-page-node-id="qer9jt355MyRyTQXOhavu7">上一句</span>
                    </button>
                    <button class="ctrl-btn accent" id="nextBtn" type="button" data-page-node-id="h084CCCZvE4IDbKsSFVEKO">下一句 →</button>
                    <button class="ctrl-btn" id="replayBtn" type="button" data-page-node-id="ZXCGQ0eXYGwrFqrc1gDrBs">
                        <span class="ico" data-page-node-id="zyvkVKe6U6e2UHYZUiKLzu">↻</span><span class="label" data-page-node-id="9K7BMh5cI3TazJ83rDgvKH">重播</span>
                    </button>
                    <button class="ctrl-btn" id="autoBtn" type="button" data-page-node-id="yrcEFUPOZ2jKP1rvV6hg7P">
                        <span class="ico" data-page-node-id="lra21sTa8LFymgptInfued">▶</span><span class="label" data-page-node-id="qtggAyv5qOdELwyP7KiMfg">自动连播</span>
                    </button>
                    <div class="progress" id="progress" data-page-node-id="n8JEiD7OwmhaMPdpbTCVXd"><button class="dot" type="button" title="第 1 句" data-page-node-id="UcyE3Thok1V51QM9yWaWrN"></button><button class="dot active" type="button" title="第 2 句" data-page-node-id="MFIkqIb60r5OrtkPTnYKgY"></button><button class="dot" type="button" title="第 3 句" data-page-node-id="Wq9n6s1nZRVbrUImVExfBx"></button><button class="dot" type="button" title="第 4 句" data-page-node-id="Rzt0RefIpTZlGsfGfa8ZQC"></button><button class="dot" type="button" title="第 5 句" data-page-node-id="deGinOg3DvYawO1b9f8B11"></button><span class="count" data-page-node-id="yZs5JW5Y5VMfGIymGEHbT2">2 / 5</span></div>
                </div>

                <p class="key-hint" data-page-node-id="OGpIz7OiTu1qnEJIvN2Jo7">
                    快捷键：<kbd data-page-node-id="BXpE4EImBTR1nkPLXEp6WI">←</kbd><kbd data-page-node-id="mSWfJqf89TMC2obDdh7lF6">→</kbd> 翻页 · <kbd data-page-node-id="Z1lU15XskQBvPjXw7xfqzN">空格</kbd> 下一句 · <kbd data-page-node-id="QxlALcwg9xcK82hPLcvKOU">R</kbd> 重播
                </p>

                <p class="voice-tip hide" id="voiceTip" data-page-node-id="lXO1L6d2QbCUXsTGkXJZnC">🔊 若暂时没有声音，点击页面任意处即可开启语音朗读</p>
            </section>

        </main>
    </div>

    <script src="js/bg.js" data-page-node-id="FBFaVCgPAg4NjMJLwWw2AU"></script>
    <script src="js/characters.js" data-page-node-id="Usw6GDZy1BmPsIHvNtAJ7p"></script>
    <script src="js/story.js" data-page-node-id="8xPTFOJTaeBrcHsMGU1BQ4"></script>



</body></html>
````


---

## 附：非 HTML 文件一览

这些文件不含 HTML，但上面的页面依赖它们，一并列出便于对照：

| 目录 | 文件 |
|---|---|
| `css/` | style.css（首页 / 对话页）、login.css、characters.css、tale.css（六故事页共用，主题色走 CSS 变量） |
| `js/` | auth.js、login.js、passkey.js、bg.js、index.js、characters.js、story.js、select.js、tales.js、tale.js |
| `assets/` | avatar-nezha/wukong/erlang/change/kuafu/jingwei.svg（占位头像）、avatars/（140px 头像目录） |