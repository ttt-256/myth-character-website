/* ============================================================
   通行密钥登录（WebAuthn / Passkey）· 可选增强
   ------------------------------------------------------------
   设计原则：
     1. 没有配置 apiBase 时整个模块静默退出，密码登录完全不受影响；
     2. 浏览器不支持时不报错，只是不显示入口；
     3. 验签必须由服务端完成 —— 前端只负责取凭据和转发。

   启用方式：把下面 CONFIG.apiBase 改成你的后端地址（同域可留空字符串
   以外的相对路径，如 '/api'）。接口契约见 README「通行密钥」一节。

   需要的后端接口：
     POST {apiBase}/auth/passkey/options   → 返回 PublicKeyCredentialRequestOptions
     POST {apiBase}/auth/passkey/verify    → 校验凭据，返回 { ok, user }
   ============================================================ */
(function () {
    'use strict';

    /* ---------------- 配置 ---------------- */
    var CONFIG = {
        // 留空 = 关闭通行密钥登录。可填 '/api' 或 'https://api.example.com'
        apiBase: '',
        optionsPath: '/auth/passkey/options',
        verifyPath: '/auth/passkey/verify',
        // 验证成功后的落地页（与密码登录保持一致）
        redirect: 'index.html',
        // 是否启用「输入框自动填充」的条件式调用
        autofill: true
    };

    // 允许页面在引入本文件前用 window.PASSKEY_CONFIG 覆盖
    if (window.PASSKEY_CONFIG) {
        for (var k in window.PASSKEY_CONFIG) {
            if (Object.prototype.hasOwnProperty.call(window.PASSKEY_CONFIG, k)) {
                CONFIG[k] = window.PASSKEY_CONFIG[k];
            }
        }
    }

    /* ---------------- Base64URL 工具 ---------------- */
    function base64urlToBuffer(base64url) {
        var base64 = String(base64url).replace(/-/g, '+').replace(/_/g, '/');
        var pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
        var binary = window.atob(base64 + pad);
        var bytes = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes.buffer;
    }

    function bufferToBase64url(buffer) {
        var bytes = new Uint8Array(buffer);
        var binary = '';
        for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    function serializeCredential(cred) {
        var r = cred.response;
        return {
            id: cred.id,
            rawId: bufferToBase64url(cred.rawId),
            type: cred.type,
            authenticatorAttachment: cred.authenticatorAttachment || null,
            response: {
                clientDataJSON: bufferToBase64url(r.clientDataJSON),
                authenticatorData: bufferToBase64url(r.authenticatorData),
                signature: bufferToBase64url(r.signature),
                userHandle: r.userHandle ? bufferToBase64url(r.userHandle) : null
            },
            clientExtensionResults: cred.getClientExtensionResults
                ? cred.getClientExtensionResults()
                : {}
        };
    }

    /* ---------------- DOM ---------------- */
    var box, btn, msgEl, controller = null, busy = false;

    function say(text, ok) {
        if (!msgEl) return;
        msgEl.textContent = text || '';
        msgEl.classList.toggle('ok', !!ok);
    }

    /* ---------------- 能力检测 ---------------- */
    function isSupported() {
        return typeof window.PublicKeyCredential !== 'undefined' &&
            !!(navigator.credentials && navigator.credentials.get);
    }

    function canAutofill() {
        return typeof window.PublicKeyCredential.isConditionalMediationAvailable === 'function';
    }

    /* ---------------- 取选项 ---------------- */
    function fetchOptions() {
        return fetch(CONFIG.apiBase + CONFIG.optionsPath, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // 带上会话 Cookie，服务端可能把 challenge 存在会话里
            credentials: 'include',
            body: JSON.stringify({})   // 不传 username，走 discoverable credential 流程
        }).then(function (res) {
            if (!res.ok) throw new Error('options ' + res.status);
            return res.json();
        }).then(function (options) {
            options.challenge = base64urlToBuffer(options.challenge);
            options.allowCredentials = [];   // 空数组 = 让浏览器自己发现可用通行密钥
            return options;
        });
    }

    /* ---------------- 验签并落地 ---------------- */
    function verify(credential) {
        return fetch(CONFIG.apiBase + CONFIG.verifyPath, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(serializeCredential(credential))
        }).then(function (res) {
            return res.json().catch(function () { return {}; })
                .then(function (data) {
                    return { ok: res.ok, data: data };
                });
        });
    }

    function enterSite(data) {
        // 本站门禁读服务端会话：验签成功的响应必须已带上会话 Cookie，
        // 这里再探测一次 /api/me 确认，探不通就提示改用密码登录
        say('验证通过，正在进入首页…', true);

        if (!window.MythoAuth) {
            window.location.href = CONFIG.redirect;
            return;
        }
        window.MythoAuth.ready().then(function (r) {
            if (r.ok) window.location.href = CONFIG.redirect;
            else say('通行密钥已验证，但服务端未建立会话，请改用密码登录');
        });
    }

    /* ---------------- 主流程 ---------------- */
    function loginWithPasskey(opts) {
        if (busy) return;
        busy = true;
        if (btn) btn.disabled = true;
        say('');

        fetchOptions().then(function (publicKey) {
            var request = { publicKey: publicKey };
            if (opts && opts.conditional) {
                // 条件式：显示在输入框的自动填充里，Promise 会一直挂着等用户选
                request.mediation = 'conditional';
            }
            controller = window.AbortController ? new AbortController() : null;
            if (controller) request.signal = controller.signal;

            return navigator.credentials.get(request).then(function (credential) {
                if (!credential) return null;
                say('正在校验…');
                return verify(credential).then(function (result) {
                    if (result.ok) {
                        enterSite(result.data);
                        return true;
                    }
                    say('通行密钥验证失败，请改用密码登录');
                    return false;
                });
            });
        }).catch(function (err) {
            // 条件式调用被 abort 掉（用户转去输密码）属正常
            if (err && err.name === 'AbortError') return false;
            if (err && err.name === 'NotAllowedError') return false;   // 用户取消
            console.warn('[passkey]', err);
            say('通行密钥暂时不可用，请改用密码登录');
            return false;
        }).then(function (done) {
            busy = false;
            if (btn) btn.disabled = false;
            return done;
        });
    }

    /* 用户改用密码时，把挂起的条件式请求收掉，避免浏览器还显示自动填充 */
    function abort() {
        if (controller) {
            try { controller.abort(); } catch (e) { /* noop */ }
            controller = null;
        }
    }

    /* ---------------- 启动 ---------------- */
    function init() {
        box = document.getElementById('passkeyBox');
        btn = document.getElementById('passkeyBtn');
        msgEl = document.getElementById('passkeyMsg');

        if (!CONFIG.apiBase || !isSupported() || !box || !btn) {
            if (box) box.hidden = true;   // 未配置 / 不支持 → 不露入口
            return;
        }

        box.hidden = false;

        btn.addEventListener('click', function () {
            loginWithPasskey({ conditional: false });
        });

        // 用户点密码登录时，先收起通行密钥的自动填充
        var loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', abort, true);
        }

        // 条件式自动填充：输入框里直接出现「使用通行密钥」候选
        if (CONFIG.autofill && canAutofill()) {
            window.PublicKeyCredential.isConditionalMediationAvailable()
                .then(function (available) {
                    if (available) loginWithPasskey({ conditional: true });
                })
                .catch(function () { /* 不支持就算了 */ });
        }

        window.PasskeyLogin = {
            login: function () { return loginWithPasskey({ conditional: false }); },
            abort: abort,
            isSupported: isSupported
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
