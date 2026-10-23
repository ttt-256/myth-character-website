/* ============================================================
   登录 / 注册交互（Supabase Auth 版）
   ------------------------------------------------------------
   账号由 Supabase 托管，邮箱 + 密码直接交给 supabase-js：
     auth.signUp()             —— 注册（关掉邮箱验证时直接返回会话）
     auth.signInWithPassword() —— 登录
   前端不碰任何密码存储，会话由 supabase-js 自己维持与续期。

   提示文案沿用原来的说法；连不上 / 未配置时给出明确解释。
   ============================================================ */
(function () {
    'use strict';

    var $ = function (id) { return document.getElementById(id); };

    var loginForm = $('loginForm');
    var registerForm = $('registerForm');
    var tabLogin = $('tabLogin');
    var tabRegister = $('tabRegister');

    /* ---------------- 提示 ---------------- */
    function clearMsg() {
        for (var i = 0; i < arguments.length; i++) {
            var el = arguments[i];
            if (!el) continue;
            el.textContent = '';
            el.classList.remove('ok');
        }
    }

    function say(el, text, ok) {
        if (!el) return;
        el.textContent = text;
        el.classList.toggle('ok', !!ok);
    }

    /* ---------------- 面板切换 ---------------- */
    function showLogin() {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        tabLogin.setAttribute('aria-selected', 'true');
        tabRegister.setAttribute('aria-selected', 'false');
        clearMsg($('msg'), $('msg2'));
    }

    function showRegister() {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        tabLogin.setAttribute('aria-selected', 'false');
        tabRegister.setAttribute('aria-selected', 'true');
        clearMsg($('msg'), $('msg2'));
    }

    /* ---------------- 按钮忙碌态 ---------------- */
    function busy(form, on, text) {
        var btn = form.querySelector('.auth-submit');
        if (!btn) return;
        if (on) {
            btn.dataset.label = btn.dataset.label || btn.textContent;
            btn.disabled = true;
            if (text) btn.textContent = text;
        } else {
            btn.disabled = false;
            if (btn.dataset.label) btn.textContent = btn.dataset.label;
        }
    }

    /* ---------------- 跳转目标 ---------------- */
    function nextPage() {
        var next = new URLSearchParams(window.location.search).get('next');
        // 只接受站内相对地址，防止被 next 参数带去外站
        var safe = next && /^[^/\\]*\.html(\?|$)/.test(next.replace(/^\//, ''));
        return safe ? next.replace(/^\//, '') : 'index.html';
    }

    /* ---------------- 邮箱简单校验 ---------------- */
    function looksLikeEmail(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }

    /* ---------------- 注册 ---------------- */
    function register() {
        var email = $('regUser').value.trim();
        var pwd = $('regPwd').value;
        var pwd2 = $('regPwd2').value;
        var msgDom = $('msg2');

        if (!email || !pwd) { say(msgDom, '邮箱和密码不能为空'); return; }
        if (!looksLikeEmail(email)) { say(msgDom, '邮箱格式不正确，例如 name@qq.com'); return; }
        if (pwd.length < 6) { say(msgDom, '密码至少 6 位'); return; }
        if (pwd !== pwd2) { say(msgDom, '两次密码不一致'); return; }

        busy(registerForm, true, '注册中…');

        window.MythoAuth.register(email, pwd).then(function (r) {
            if (!r.ok) {
                busy(registerForm, false);
                say(msgDom, r.message);
                return;
            }

            if (r.needsConfirm) {
                busy(registerForm, false);
                say(msgDom, '注册成功！请去邮箱点确认链接后再登录', true);
                return;
            }

            // 关掉邮箱验证时注册即登录，直接进站
            say(msgDom, '注册成功，正在进入首页…', true);
            setTimeout(function () {
                window.location.href = nextPage();
            }, 700);
        });
    }

    /* ---------------- 登录 ---------------- */
    function login() {
        var email = $('loginUser').value.trim();
        var pwd = $('loginPwd').value;
        var msgDom = $('msg');

        if (!email || !pwd) { say(msgDom, '邮箱和密码不能为空'); return; }
        if (!looksLikeEmail(email)) { say(msgDom, '邮箱格式不正确，例如 name@qq.com'); return; }

        busy(loginForm, true, '登录中…');

        window.MythoAuth.login(email, pwd).then(function (r) {
            if (!r.ok) {
                busy(loginForm, false);
                say(msgDom, r.message);
                return;
            }

            say(msgDom, '登录成功，正在进入…', true);
            window.location.href = nextPage();
        });
    }

    /* ---------------- 打开页面时的状态 ---------------- */
    // 未配置 Publishable key：直接在两个表单上说明，别让人白试
    if (window.MythoAuth && !window.MythoAuth.isConfigured()) {
        say($('msg'), '登录暂未启用：请把 Supabase 的 Publishable key 填进 js/auth.js 的 CONFIG.anonKey');
    }

    // 已登录则给个直达提示
    if (window.MythoAuth) {
        window.MythoAuth.ready().then(function (r) {
            if (!r.ok) return;
            var note = document.querySelector('.auth-note');
            if (!note) return;
            var tip = document.createElement('p');
            tip.className = 'auth-msg ok';
            tip.style.marginTop = '0';
            var safeName = String(r.email || r.username || '').replace(/[<>&]/g, '');
            tip.innerHTML = '当前已登录：<b>' + safeName +
                '</b> · <a href="' + nextPage() + '" style="color:inherit;text-decoration:underline">直接进入 →</a>';
            note.parentNode.insertBefore(tip, note);
        });
    }

    /* ---------------- 事件绑定 ---------------- */
    tabLogin.addEventListener('click', showLogin);
    tabRegister.addEventListener('click', showRegister);

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        login();
    });

    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        register();
    });

    // 兼容可能存在的内联调用
    window.showLogin = showLogin;
    window.showRegister = showRegister;
    window.login = login;
    window.register = register;

    setTimeout(function () {
        var el = $('loginUser');
        if (el && loginForm.style.display !== 'none') el.focus();
    }, 120);
})();
