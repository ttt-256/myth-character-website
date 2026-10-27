/* ============================================================
   第二页 · 神话人物馆（角色选择）
   ------------------------------------------------------------
   卡片由下面的 characters 数组生成，顺序即页面顺序。
   点击 → 头像亮起该人物的专属光色 → 进入他的故事页。
   ============================================================ */
(function () {
    'use strict';

    /**
     * =============================================
     *        👇 在此处自定义您的图片和颜色 👇
     * =============================================
     *  id          人物 id（同时用于读取本地换过的头像 avatar_<id>）
     *  name        名字
     *  desc        名字下的小字
     *  page        点击后进入的故事页
     *  avatar      头像路径：把图片按同名放进 assets/avatars/ 即可，如 nezha.jpg
     *  fallback    图片不存在时用的站内占位头像（不用改）
     *  borderColor 点击时头像发光的颜色
     */
    var characters = [
        {
            id: 'nezha',
            name: '哪吒',
            desc: '莲花化身 · 少年战神',
            page: 'nezha.html',
            avatar: 'assets/avatars/nezha.jpg',
            fallback: 'assets/avatar-nezha.svg',
            borderColor: '#ff4b4b'      // 哪吒是红色系
        },
        {
            id: 'wukong',
            name: '孙悟空',
            desc: '齐天大圣 · 斗战胜佛',
            page: 'wukong.html',
            avatar: 'assets/avatars/wukong.jpg',
            fallback: 'assets/avatar-wukong.svg',
            borderColor: '#ffaa00'      // 悟空是橙金色
        },
        {
            id: 'erlang',
            name: '杨戬',
            desc: '二郎真君 · 天眼通幽',
            page: 'yangjian.html',
            avatar: 'assets/avatars/yangjian.jpg',
            fallback: 'assets/avatar-erlang.svg',
            borderColor: '#4b89ff'      // 杨戬是冰蓝色
        },
        {
            id: 'change',
            name: '嫦娥',
            desc: '月宫仙子 · 清辉千年',
            page: 'change.html',
            avatar: 'assets/avatars/change.jpg',
            fallback: 'assets/avatar-change.svg',
            borderColor: '#c84bdc'      // 嫦娥是紫粉色
        },
        {
            id: 'kuafu',
            name: '夸父',
            desc: '逐日巨人 · 志在光明',
            page: 'kuafu.html',
            avatar: 'assets/avatars/kuafu.jpg',
            fallback: 'assets/avatar-kuafu.svg',
            borderColor: '#ff7b00'      // 夸父是烈火橙
        },
        {
            id: 'jingwei',
            name: '精卫',
            desc: '衔石填海 · 执念不渝',
            page: 'jingwei.html',
            avatar: 'assets/avatars/jingwei.jpg',
            fallback: 'assets/avatar-jingwei.svg',
            borderColor: '#00c4b3'      // 精卫是海洋绿
        }
    ];
    /**
     * =============================================
     *        👆 修改完毕，以下代码无需改动 👆
     * =============================================
     */

    var grid = document.getElementById('characters-grid');

    /* 取头像：故事页里换过的头像存在本地，这里沿用同一张 */
    function avatarOf(c) {
        var saved = null;
        try {
            saved = window.localStorage.getItem('avatar_' + c.id);
        } catch (e) { /* 隐私模式下不可用 */ }
        return saved || c.avatar;
    }

    /* 进入人物：先让光环亮一下，再跳转 */
    var jumping = false;

    function enter(card, c) {
        if (jumping) return;
        jumping = true;
        card.classList.add('active');
        setTimeout(function () {
            window.location.href = c.page;
        }, 260);
    }

    /* 动态生成卡片 */
    characters.forEach(function (c, index) {
        var card = document.createElement('div');
        card.className = 'card';
        card.tabIndex = 0;
        card.setAttribute('role', 'link');
        card.setAttribute('aria-label', c.name + ' · ' + c.desc);
        card.style.setProperty('--border-color', c.borderColor);

        /* 头像 */
        var box = document.createElement('div');
        box.className = 'avatar-box';

        var img = document.createElement('img');
        img.alt = c.name + '头像';
        img.src = avatarOf(c);

        // 图片缺失时退回站内 SVG 占位头像，不出现裂图
        img.addEventListener('error', function () {
            var cur = img.getAttribute('src') || '';
            if (cur.indexOf('assets/avatars/') === 0) {
                img.setAttribute('src', c.fallback);
            }
        });

        box.appendChild(img);

        /* 文字 */
        var text = document.createElement('div');
        text.className = 'card-text';

        var h2 = document.createElement('h2');
        h2.textContent = c.name;

        var p = document.createElement('p');
        p.textContent = c.desc;

        text.appendChild(h2);
        text.appendChild(p);

        card.appendChild(box);
        card.appendChild(text);

        /* 点击 / 键盘进入 */
        card.addEventListener('click', function () {
            enter(card, c);
        });

        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                enter(card, c);
            }
        });

        grid.appendChild(card);
    });

    /* ---------------- 登录信息 / 退出登录 ---------------- */
    var info = document.getElementById('userInfo');
    if (info && window.MythoAuth) {
        window.MythoAuth.who().then(function (user) {
            if (user) info.textContent = '欢迎：' + user;
        });
    }

    function logout() {
        if (window.MythoAuth) {
            window.MythoAuth.logout();
        } else {
            window.location.href = 'login.html';
        }
    }

    window.logout = logout;

    /* 数字键 1-6 直达对应人物 */
    document.addEventListener('keydown', function (e) {
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.key >= '1' && e.key <= '6') {
            var idx = Number(e.key) - 1;
            var c = characters[idx];
            var card = grid.children[idx];
            if (!c || !card) return;
            enter(card, c);
        }
    });
})();
