/* ============================================================
   「上古纪事」登录服务
   ------------------------------------------------------------
   零依赖，只用 Node 内置模块。启动：
       node server.js            （默认 http://127.0.0.1:3000）
       PORT=8080 node server.js

   它做两件事：
     1. 托管本目录下的静态站点（HTML / CSS / JS / 图片）
     2. 提供 /api/register、/api/login、/api/logout、/api/me

   账号存 data/users.json，密码用 scrypt 加盐哈希，不存明文。
   会话是无状态签名 Cookie（HttpOnly + SameSite=Lax），重启不掉线。
   ============================================================ */
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const SITE_ROOT = __dirname;
const DATA_DIR = path.join(SITE_ROOT, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SECRET_FILE = path.join(DATA_DIR, '.session-secret');

const SESSION_COOKIE = 'mytho_sid';
const SESSION_DAYS = 7;

/* 登录失败限流：同一 IP 在窗口内失败次数过多就先拒绝 */
const FAIL_WINDOW_MS = 5 * 60 * 1000;
const FAIL_LIMIT = 8;
const fails = new Map(); // ip -> { count, since }

/* ------------------------------------------------------------
   一、存储与加密
   ------------------------------------------------------------ */

function randomId(bytes) {
    return crypto.randomBytes(bytes).toString('base64url');
}

/* 会话签名密钥：首次启动生成，落盘保存，重启后旧 Cookie 仍然有效 */
let secret = null;
function loadSecret() {
    if (secret) return secret;
    fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(SECRET_FILE)) {
        secret = Buffer.from(fs.readFileSync(SECRET_FILE, 'utf8').trim(), 'base64url');
    }
    if (!secret || secret.length < 32) {
        secret = crypto.randomBytes(32);
        fs.writeFileSync(SECRET_FILE, secret.toString('base64url'), { mode: 0o600 });
        console.log('[auth] 已生成新的会话签名密钥 data/.session-secret');
    }
    return secret;
}

/* 用户库：整体读入内存，写入时串行化，避免并发覆盖 */
let users = null;
let writeQueue = Promise.resolve();

async function loadUsers() {
    if (users) return users;
    await fsp.mkdir(DATA_DIR, { recursive: true });
    try {
        users = JSON.parse(await fsp.readFile(USERS_FILE, 'utf8')) || {};
    } catch (e) {
        if (e.code !== 'ENOENT') console.warn('[auth] users.json 读取失败，按空库处理：', e.message);
        users = {};
    }
    return users;
}

function saveUsers() {
    const snapshot = JSON.stringify(users, null, 2);
    writeQueue = writeQueue.then(async () => {
        const tmp = USERS_FILE + '.tmp';
        await fsp.writeFile(tmp, snapshot, { mode: 0o600 });
        await fsp.rename(tmp, USERS_FILE);
    }).catch((e) => console.error('[auth] 用户库写入失败：', e.message));
    return writeQueue;
}

function scrypt(password, salt) {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, key) => {
            err ? reject(err) : resolve(key);
        });
    });
}

async function hashPassword(password) {
    const salt = crypto.randomBytes(16);
    const key = await scrypt(password, salt);
    return { salt: salt.toString('base64'), hash: key.toString('base64') };
}

async function verifyPassword(password, rec) {
    const salt = Buffer.from(rec.salt, 'base64');
    const expected = Buffer.from(rec.hash, 'base64');
    const actual = await scrypt(password, salt);
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

/* 账号名归一化：大小写不敏感，避免 Alice / alice 被当成两个人 */
function userKey(name) {
    return String(name || '').trim().toLowerCase();
}

/* ------------------------------------------------------------
   二、会话 Cookie（无状态，签名防篡改）
   ------------------------------------------------------------ */

function sign(payload) {
    return crypto.createHmac('sha256', loadSecret()).update(payload).digest('base64url');
}

function makeSessionToken(username) {
    const body = Buffer.from(JSON.stringify({
        u: username,
        exp: Date.now() + SESSION_DAYS * 864e5
    })).toString('base64url');
    return body + '.' + sign(body);
}

function readSessionToken(token) {
    if (!token || token.indexOf('.') < 0) return null;
    const [body, mac] = token.split('.');
    if (!body || !mac) return null;

    const expect = sign(body);
    const a = Buffer.from(mac);
    const b = Buffer.from(expect);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    try {
        const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
        if (!data || !data.u || !data.exp || data.exp < Date.now()) return null;
        return data;
    } catch (e) {
        return null;
    }
}

function parseCookies(header) {
    const out = {};
    (header || '').split(';').forEach(function (part) {
        const i = part.indexOf('=');
        if (i < 0) return;
        const k = part.slice(0, i).trim();
        const v = part.slice(i + 1).trim();
        if (k) out[k] = decodeURIComponent(v);
    });
    return out;
}

function cookieHeader(value, maxAgeSec) {
    const parts = [
        SESSION_COOKIE + '=' + encodeURIComponent(value),
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        'Max-Age=' + maxAgeSec
    ];
    return parts.join('; ');
}

function currentUser(req) {
    const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
    const session = readSessionToken(token);
    return session ? session.u : null;
}

/* ------------------------------------------------------------
   三、请求/响应小工具
   ------------------------------------------------------------ */

function sendJSON(res, status, body, extraHeaders) {
    const data = JSON.stringify(body);
    const headers = Object.assign({
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
    }, extraHeaders || {});
    res.writeHead(status, headers);
    res.end(data);
}

function readJSONBody(req, limitBytes) {
    const limit = limitBytes || 8 * 1024;
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];
        req.on('data', (c) => {
            size += c.length;
            if (size > limit) {
                reject(Object.assign(new Error('body too large'), { status: 413 }));
                req.destroy();
                return;
            }
            chunks.push(c);
        });
        req.on('end', () => {
            if (!chunks.length) return resolve({});
            try {
                resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
            } catch (e) {
                reject(Object.assign(new Error('invalid json'), { status: 400 }));
            }
        });
        req.on('error', reject);
    });
}

function clientIP(req) {
    return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function tooManyFails(ip) {
    const rec = fails.get(ip);
    if (!rec) return false;
    if (Date.now() - rec.since > FAIL_WINDOW_MS) {
        fails.delete(ip);
        return false;
    }
    return rec.count >= FAIL_LIMIT;
}

function noteFail(ip) {
    const rec = fails.get(ip);
    if (!rec || Date.now() - rec.since > FAIL_WINDOW_MS) {
        fails.set(ip, { count: 1, since: Date.now() });
    } else {
        rec.count += 1;
    }
}

function clearFails(ip) {
    fails.delete(ip);
}

/* ------------------------------------------------------------
   四、接口
   ------------------------------------------------------------ */

const USERNAME_RE = /^[\u4e00-\u9fa5A-Za-z0-9_.-]{2,24}$/;
const PASSWORD_MIN = 6;

function checkCredentials(username, password) {
    if (!username || !password) return '用户名密码不能为空';
    if (!USERNAME_RE.test(username)) {
        return '用户名需 2-24 位，可用中英文、数字、下划线、点、短横线';
    }
    if (password.length < PASSWORD_MIN) return '密码至少 ' + PASSWORD_MIN + ' 位';
    return null;
}

async function handleRegister(req, res) {
    const body = await readJSONBody(req);
    const username = String(body.username || '').trim();
    const password = String(body.password || '');

    const bad = checkCredentials(username, password);
    if (bad) return sendJSON(res, 400, { error: 'invalid', message: bad });

    await loadUsers();
    const key = userKey(username);
    if (users[key]) return sendJSON(res, 409, { error: 'exists', message: '用户名已存在' });

    const rec = await hashPassword(password);
    users[key] = {
        username: username,
        salt: rec.salt,
        hash: rec.hash,
        createdAt: new Date().toISOString()
    };
    await saveUsers();

    console.log('[auth] 新用户注册：' + username);
    return sendJSON(res, 201, { ok: true, username: username });
}

async function handleLogin(req, res) {
    const ip = clientIP(req);
    if (tooManyFails(ip)) {
        return sendJSON(res, 429, {
            error: 'too_many',
            message: '尝试次数过多，请 5 分钟后再试'
        });
    }

    const body = await readJSONBody(req);
    const username = String(body.username || '').trim();
    const password = String(body.password || '');

    if (!username || !password) {
        return sendJSON(res, 400, { error: 'empty', message: '用户名密码不能为空' });
    }

    await loadUsers();
    const rec = users[userKey(username)];
    if (!rec) {
        noteFail(ip);
        return sendJSON(res, 401, { error: 'user_not_found', message: '用户不存在' });
    }

    const ok = await verifyPassword(password, rec);
    if (!ok) {
        noteFail(ip);
        return sendJSON(res, 401, { error: 'bad_password', message: '密码错误' });
    }

    clearFails(ip);
    const token = makeSessionToken(rec.username);
    console.log('[auth] 登录成功：' + rec.username + ' (' + ip + ')');
    return sendJSON(res, 200, { ok: true, username: rec.username }, {
        'Set-Cookie': cookieHeader(token, SESSION_DAYS * 86400)
    });
}

function handleLogout(req, res) {
    sendJSON(res, 200, { ok: true }, {
        'Set-Cookie': cookieHeader('', 0)
    });
}

function handleMe(req, res) {
    const user = currentUser(req);
    if (!user) return sendJSON(res, 401, { error: 'unauthorized', message: '未登录' });
    return sendJSON(res, 200, { ok: true, username: user });
}

/* ------------------------------------------------------------
   五、静态文件
   ------------------------------------------------------------ */

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.txt': 'text/plain; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8'
};

/* 这些不进静态托管：用户库、签名密钥、服务端源码、版本库 */
const BLOCKED = [/^\/data(\/|$)/i, /^\/server\.js$/i, /^\/package(-lock)?\.json$/i, /\/\./];

function serveStatic(req, res, urlPath) {
    let rel = decodeURIComponent(urlPath.split('?')[0]);
    if (rel === '/') rel = '/index.html';

    if (BLOCKED.some((re) => re.test(rel))) {
        return sendJSON(res, 404, { error: 'not_found' });
    }

    const abs = path.join(SITE_ROOT, path.normalize(rel));
    if (!abs.startsWith(SITE_ROOT)) {
        return sendJSON(res, 403, { error: 'forbidden' });
    }

    fs.stat(abs, (err, st) => {
        if (err || !st.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('404 Not Found');
        }
        const type = MIME[path.extname(abs).toLowerCase()] || 'application/octet-stream';
        res.writeHead(200, {
            'Content-Type': type,
            'Content-Length': st.size,
            'Cache-Control': 'no-cache',
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'same-origin'
        });
        if (req.method === 'HEAD') return res.end();
        fs.createReadStream(abs).pipe(res);
    });
}

/* ------------------------------------------------------------
   六、路由
   ------------------------------------------------------------ */

const server = http.createServer(async (req, res) => {
    const urlPath = req.url || '/';

    try {
        if (urlPath.startsWith('/api/')) {
            const route = urlPath.split('?')[0];

            if (route === '/api/register') {
                if (req.method !== 'POST') return sendJSON(res, 405, { error: 'method', message: '请用 POST' });
                return await handleRegister(req, res);
            }
            if (route === '/api/login') {
                if (req.method !== 'POST') return sendJSON(res, 405, { error: 'method', message: '请用 POST' });
                return await handleLogin(req, res);
            }
            if (route === '/api/logout') {
                if (req.method !== 'POST') return sendJSON(res, 405, { error: 'method', message: '请用 POST' });
                return handleLogout(req, res);
            }
            if (route === '/api/me') {
                return handleMe(req, res);
            }

            return sendJSON(res, 404, { error: 'not_found', message: '接口不存在' });
        }

        if (req.method !== 'GET' && req.method !== 'HEAD') {
            return sendJSON(res, 405, { error: 'method', message: '不支持的方法' });
        }

        serveStatic(req, res, urlPath);
    } catch (e) {
        const status = e.status || 500;
        if (status === 500) console.error('[server]', e);
        sendJSON(res, status, {
            error: 'server_error',
            message: status === 500 ? '服务端异常' : e.message
        });
    }
});

loadSecret();
loadUsers().then(() => {
    const n = Object.keys(users).length;
    server.listen(PORT, HOST, () => {
        console.log('--------------------------------------------------');
        console.log('  「上古纪事」已启动');
        console.log('  地址：http://' + HOST + ':' + PORT + '/login.html');
        console.log('  账号库：data/users.json（当前 ' + n + ' 个账号）');
        console.log('  停止：Ctrl + C');
        console.log('--------------------------------------------------');
    });
});
