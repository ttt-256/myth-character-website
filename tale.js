/* ============================================================
   人物故事页 · 逐字浮现 + 读完弹窗
   ------------------------------------------------------------
   文本在 js/tales.js，页面用 <body data-char="nezha" data-story="nezha"> 指定。
   ============================================================ */
(function () {
    'use strict';

    var box = document.getElementById('storyBox');
    var mask = document.getElementById('mask');
    var dialog = document.getElementById('dialog');
    var talkBtn = document.getElementById('talkBtn');

    var charId = document.body.getAttribute('data-char');
    var storyId = document.body.getAttribute('data-story') || charId;

    var data = (window.TALES && window.TALES[charId]) || null;
    var fullText = data ? data.text : '';

    var idx = 0;
    var timer = null;
    var done = false;

    /* ---------------- 逐字书写 ---------------- */
    function type() {
        if (idx >= fullText.length) {
            finish();
            return;
        }
        // 一次上 3 个字，比原稿逐字更快，长文不至于读太久
        var step = 3;
        box.textContent += fullText.substr(idx, step);
        idx += step;

        // 每 60 字滚一次底，避免每字都重排
        if (idx % 60 < step) {
            window.scrollTo(0, document.body.scrollHeight);
        }
        timer = setTimeout(type, 45);
    }

    function finish() {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        done = true;
        box.classList.remove('typing');
        mask.style.display = 'block';
        dialog.style.display = 'block';
    }

    function start() {
        idx = 0;
        done = false;
        box.textContent = '';
        box.classList.add('typing');
        mask.style.display = 'none';
        dialog.style.display = 'none';
        window.scrollTo(0, 0);
        type();
    }

    /* ---------------- 人物头像：可更换，存在本地 ---------------- */
    var avatarBox = document.querySelector('.avatar-box');
    var avatarImg = avatarBox ? avatarBox.querySelector('img') : null;
    var avatarInput = document.getElementById('avatarUpload');

    if (avatarImg) {
        // 图片缺失时退回站内 SVG 占位头像，不出现裂图
        // （只对默认的 assets/avatars/*.jpg 生效，避免把用户换过的图覆盖掉）
        avatarImg.addEventListener('error', function () {
            var fb = avatarImg.getAttribute('data-fallback');
            var cur = avatarImg.getAttribute('src') || '';
            if (fb && cur.indexOf('assets/avatars/') === 0) {
                avatarImg.setAttribute('src', fb);
            }
        });
        // 换过头像就用本地那张
        var saved = null;
        try {
            saved = window.localStorage.getItem('avatar_' + charId);
        } catch (e) { /* 隐私模式下可能不可用 */ }
        if (saved) avatarImg.src = saved;
    }

    if (avatarInput && avatarImg) {
        avatarInput.addEventListener('change', function (e) {
            var file = e.target.files && e.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function (ev) {
                avatarImg.src = ev.target.result;
                try {
                    window.localStorage.setItem('avatar_' + charId, ev.target.result);
                } catch (err) {
                    // 图片过大超出存储配额时，只改当前页面显示
                    console.warn('头像已更换，但浏览器本地存储写入失败（可能超出容量）');
                }
            };
            reader.readAsDataURL(file);
        });
    }

    /* ---------------- 交互 ---------------- */
    window.restartStory = start;

    // 返回：优先回退，没有历史就回人物选择页
    window.taleGoBack = function () {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'characters.html';
        }
    };

    // 点击页面加速：一次性显示全文
    document.body.addEventListener('click', function (e) {
        if (e.target.closest('.dialog')) return;        // 弹窗里的按钮不触发
        if (e.target.closest('.upload-area')) return;   // 换头像不触发
        if (e.target.classList.contains('back')) return; // 返回按钮交给 onclick
        if (done) return;

        box.textContent = fullText;
        idx = fullText.length;
        finish();
    });

    // 空格 / Esc 也能跳过
    document.addEventListener('keydown', function (e) {
        if (done) return;
        if (e.key === ' ' || e.key === 'Escape') {
            e.preventDefault();
            box.textContent = fullText;
            idx = fullText.length;
            finish();
        }
    });

    // 弹窗里的「进入人物对话」
    if (talkBtn) {
        talkBtn.addEventListener('click', function () {
            window.location.href = 'story.html?c=' + encodeURIComponent(storyId);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
