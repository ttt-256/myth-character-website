/* ============================================================
   登录态 · Supabase Auth（邮箱 + 密码）
   ------------------------------------------------------------
   本站的账号体系已从「自己服务器的用户名密码」换成 Supabase 托管：
     注册 / 登录都由 Supabase Auth 完成，密码不会经过本站后端
     会话保存在浏览器（supabase-js 自动续期），不再需要 HttpOnly Cookie
     全站守卫改为读取 Supabase 会话，因此站点可以纯静态部署

   ⚠️ 唯一需要你填的地方：下面 CONFIG.anonKey
      在 Supabase 后台 → Project Settings → API Keys 复制 Publishable key
      （sb_publishable_ 开头那一长串，公钥，放在前端是安全的）
      没填之前：站点会进入「免登录预览」模式，底部有提示条

   对外接口（都返回 Promise，形状与上一版保持一致）：
     MythoAuth.ready()             → { ok, username, email }
     MythoAuth.who()               → 显示名（邮箱 @ 前面那截）或 ''
     MythoAuth.require()           → 页面守卫：未登录跳登录页
     MythoAuth.login(mail, pwd)    → 登录
     MythoAuth.register(mail, pwd) → 注册
     MythoAuth.logout()            → 登出并回登录页

     成功：{ ok: true,  username, email }
     失败：{ ok: false, code, message, offline }
   ============================================================ */
(function () {
    'use strict';

    /* ============ ① 这里填 Supabase 配置 ============ */
    var CONFIG = {
        url: 'https://jftlwzeynffxhjjwrdkr.supabase.co',
        anonKey: 'sb_publishable_1c9kqUua6WuKExLsS_dO9Q_Kc8prVzM'
    };
    /* ================================================ */

    var SDK_LOCAL = 'js/vendor/supabase.js';                              // 本地副本，优先
    var SDK_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'; // 本地文件缺失时兜底
    var CHECKING_CLASS = 'mytho-checking';
    var SDK_TIMEOUT = 8000;

    var client = null;        // supabase 客户端
    var sdkPending = null;    // SDK 加载中的 Promise
    var probePending = null;  // 会话探测中的 Promise
    var cachedUser = null;    // 已确认的 user 对象

    /* ---------------- 遮罩 ---------------- */
    (function injectGuardStyle() {
        var css = 'html.' + CHECKING_CLASS + ' body{visibility:hidden}';
        var style = document.createElement('style');
        style.id = 'mytho-guard-style';
        style.appendChild(document.createTextNode(css));
        (document.head || document.documentElement).appendChild(style);
    })();

    function setChecking(on) {
        var de = document.documentElement;
        if (!de) return;
        de.classList[on ? 'add' : 'remove'](CHECKING_CLASS);
    }

    /* ---------------- 配置 / SDK ---------------- */
    function isConfigured() {
        return /^https?:\/\//.test(CONFIG.url || '') &&
            (CONFIG.anonKey || '').length > 20 &&
            CONFIG.anonKey.indexOf('在这里') === -1;
    }

    function inject(src) {
        return new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = src;
            s.async = true;
            var timer = setTimeout(function () {
                reject(new Error('sdk-timeout'));
            }, SDK_TIMEOUT);

            s.onload = function () {
                clearTimeout(timer);
                if (window.supabase && window.supabase.createClient) resolve();
                else reject(new Error('sdk-missing'));
            };
            s.onerror = function () {
                clearTimeout(timer);
                reject(new Error('sdk-error'));
            };
            (document.head || document.documentElement).appendChild(s);
        });
    }

    function loadSdk() {
        if (window.supabase && window.supabase.createClient) return Promise.resolve();
        if (sdkPending) return sdkPending;

        // 先本地，再 CDN：国内网络下 jsDelivr 时常不稳，本地优先更可靠
        sdkPending = inject(SDK_LOCAL).catch(function () {
            return inject(SDK_CDN);
        });

        return sdkPending;
    }

    function getClient() {
        if (client) return Promise.resolve(client);
        if (!isConfigured()) return Promise.reject(new Error('not-configured'));

        return loadSdk().then(function () {
            if (!client) {
                client = window.supabase.createClient(CONFIG.url, CONFIG.anonKey, {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true,
                        detectSessionInUrl: true
                    }
                });
            }
            return client;
        });
    }

    /* ---------------- 降级提示条 ---------------- */
    function showDegradedBanner(reason) {
        window.MYTHO_AUTH_DEGRADED = true;

        function paint() {
            if (document.getElementById('mytho-degraded')) return;
            var bar = document.createElement('div');
            bar.id = 'mytho-degraded';
            bar.textContent = '登录未启用（' + reason + '）：当前为免登录预览';
            bar.style.cssText = [
                'position:fixed', 'left:50%', 'bottom:16px', 'transform:translateX(-50%)',
                'z-index:99999', 'padding:8px 18px', 'border-radius:20px',
                'background:rgba(20,20,26,.92)', 'color:#d9b36a',
                'border:1px solid rgba(212,175,55,.45)',
                'font:13px/1.5 "Microsoft YaHei",sans-serif',
                'letter-spacing:1px', 'box-shadow:0 6px 20px rgba(0,0,0,.35)',
                'pointer-events:none', 'white-space:nowrap'
            ].join(';');
            document.body.appendChild(bar);
        }

        if (document.body) paint();
        else document.addEventListener('DOMContentLoaded', paint);
    }

    /* ---------------- 错误文案 ---------------- */
    function mapError(err) {
        var raw = (err && (err.message || err.error_description || err.msg)) || '';
        var code = (err && (err.code || err.error_code)) || '';
        var low = String(raw).toLowerCase();

        if (low.indexOf('failed to fetch') > -1 || low.indexOf('network') > -1 ||
            low.indexOf('load failed') > -1 || code === 'sdk-error' || code === 'sdk-timeout' ||
            low.indexOf('sdk-') === 0) {
            return { code: 'offline', message: '连不上 Supabase，请检查网络后重试', offline: true };
        }
        if (low.indexOf('invalid login credentials') > -1) {
            return { code: 'bad-credentials', message: '邮箱或密码不正确' };
        }
        if (low.indexOf('email not confirmed') > -1) {
            return { code: 'not-confirmed', message: '邮箱还没验证，请先去邮箱点确认链接' };
        }
        if (low.indexOf('already registered') > -1 || low.indexOf('already been registered') > -1) {
            return { code: 'exists', message: '这个邮箱已经注册过了，直接登录即可' };
        }
        if (low.indexOf('password should be at least') > -1) {
            return { code: 'weak-password', message: '密码太短，至少 6 位' };
        }
        if (low.indexOf('unable to validate email') > -1 || low.indexOf('invalid email') > -1) {
            return { code: 'bad-email', message: '邮箱格式不正确' };
        }
        if (low.indexOf('rate limit') > -1 || low.indexOf('too many') > -1 ||
            low.indexOf('after 60 seconds') > -1) {
            return { code: 'rate-limit', message: '尝试太频繁，请稍等一会儿再试' };
        }
        if (low.indexOf('signups not allowed') > -1 || low.indexOf('signup is disabled') > -1) {
            return { code: 'signup-disabled', message: '该项目已关闭邮箱注册，请在 Supabase 后台开启' };
        }
        return { code: 'error', message: raw || '操作失败，请重试' };
    }

    /* ---------------- 显示名 ---------------- */
    function displayName(user) {
        var meta = (user && user.user_metadata) || {};
        var mail = (user && user.email) || '';
        return meta.name || meta.display_name || meta.full_name ||
            (mail ? mail.split('@')[0] : '');
    }

    /* ---------------- 会话探测 ---------------- */
    function probe() {
        if (probePending) return probePending;

        probePending = getClient()
            .then(function (c) { return c.auth.getSession(); })
            .then(function (res) {
                var session = res && res.data && res.data.session;
                if (session && session.user) {
                    cachedUser = session.user;
                    return {
                        ok: true,
                        username: displayName(session.user),
                        email: session.user.email || ''
                    };
                }
                cachedUser = null;
                return { ok: false, code: 'no-session', message: '未登录', offline: false };
            })
            .catch(function (err) {
                cachedUser = null;
                if (err && err.message === 'not-configured') {
                    return { ok: false, code: 'not-configured', message: '尚未配置 Supabase', degraded: true };
                }
                return { ok: false, code: 'offline', message: '连不上 Supabase', offline: true, degraded: true };
            });

        return probePending;
    }

    /* ---------------- 对外 ---------------- */
    var Auth = {
        config: CONFIG,

        isConfigured: isConfigured,

        ready: function () { return probe(); },

        who: function () {
            return probe().then(function (r) { return r.ok ? r.username : ''; });
        },

        email: function () {
            return probe().then(function (r) { return r.ok ? r.email : ''; });
        },

        isLoggedIn: function () {
            return !!cachedUser;
        },

        getUser: function () {
            return cachedUser;
        },

        /**
         * 页面守卫。
         * 正常：未登录 → 跳 login.html?next=当前页
         * 降级（未配置 / SDK 加载失败）：放行，并在页面底部显示提示条
         */
        require: function () {
            setChecking(true);
            var here = window.location.pathname + window.location.search;

            return probe().then(function (r) {
                if (r.ok) {
                    setChecking(false);
                    return true;
                }
                if (r.degraded) {
                    setChecking(false);
                    showDegradedBanner(r.code === 'not-configured' ? 'Supabase 未配置' : '连不上 Supabase');
                    return true;
                }
                // 已经在登录页就不再跳，避免自己套自己
                if (/login\.html$/.test(window.location.pathname)) {
                    setChecking(false);
                    return false;
                }
                window.location.replace('login.html?next=' + encodeURIComponent(here));
                return false;
            });
        },

        login: function (email, password) {
            return getClient()
                .then(function (c) {
                    return c.auth.signInWithPassword({
                        email: String(email || '').trim(),
                        password: String(password || '')
                    });
                })
                .then(function (res) {
                    if (res.error) {
                        var e = mapError(res.error);
                        e.ok = false;
                        return e;
                    }
                    cachedUser = res.data.user;
                    probePending = null;
                    return {
                        ok: true,
                        username: displayName(res.data.user),
                        email: res.data.user.email
                    };
                })
                .catch(function (err) {
                    if (err && err.message === 'not-configured') {
                        return {
                            ok: false,
                            code: 'not-configured',
                            message: '尚未配置 Supabase：请把 Publishable key 填进 js/auth.js'
                        };
                    }
                    var e = mapError(err);
                    e.ok = false;
                    return e;
                });
        },

        register: function (email, password) {
            return getClient()
                .then(function (c) {
                    return c.auth.signUp({
                        email: String(email || '').trim(),
                        password: String(password || '')
                    });
                })
                .then(function (res) {
                    if (res.error) {
                        var e = mapError(res.error);
                        e.ok = false;
                        return e;
                    }
                    // 关掉邮箱验证时，signUp 会直接带回 session：算登录成功
                    if (res.data && res.data.session) {
                        cachedUser = res.data.session.user;
                        probePending = null;
                        return {
                            ok: true,
                            username: displayName(res.data.session.user),
                            email: res.data.session.user.email
                        };
                    }
                    // 开着邮箱验证：等用户去点确认链接
                    return {
                        ok: true,
                        needsConfirm: true,
                        username: displayName(res.data && res.data.user),
                        email: (res.data && res.data.user && res.data.user.email) || String(email || '').trim()
                    };
                })
                .catch(function (err) {
                    if (err && err.message === 'not-configured') {
                        return {
                            ok: false,
                            code: 'not-configured',
                            message: '尚未配置 Supabase：请把 Publishable key 填进 js/auth.js'
                        };
                    }
                    var e = mapError(err);
                    e.ok = false;
                    return e;
                });
        },

        logout: function () {
            return getClient()
                .then(function (c) { return c.auth.signOut(); })
                .catch(function () { /* 未配置时也照样回登录页 */ })
                .then(function () {
                    cachedUser = null;
                    probePending = null;
                    window.location.href = 'login.html';
                });
        }
    };

    /* 旧版本残留的本地账号表（明文密码）清掉 */
    try {
        window.localStorage.removeItem('userList');
        window.localStorage.removeItem('mytho.auth.v1');
    } catch (e) { /* 隐私模式忽略 */ }

    window.MythoAuth = Auth;
})();
