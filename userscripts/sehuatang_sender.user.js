// ==UserScript==
// @name         色花堂番号发送器
// @namespace    https://github.com/qxinGitHub/searchAV
// @version      1.3.6
// @description  检测网页上的番号并提供发送到色花堂搜索的功能，支持自动传递和一键搜索，新增30秒全局冷却功能，支持自动下载封面图片到本地
// @author       色花堂
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAABLdJREFUWEftmG2IVGUUx3//O6MZapIftJTeKAqDiqiPGllZSdqHXsw3KmNnpm1LzYqgAleoMAJLw2xmdtsKqS3BkIy0QDSS6FNIkAgRilhUkPjGprtzTzx3d2fv3L0z986upB+6X+855/6e5znnf55zZWYTOY8fOUBJJ85HxoDtf8BRHM2odtAM0cF0fC6oMnicpoUjEjYKrqpr04DWxTjOsNQ8Chg3AWNiQHoR++RTZCybtYx/RgqbGtA6mej3sVziRaCZqj9h0O79xga109csaCpAK3KDiW7g+mY/ELL/WcZCFfipmRiJgFZinsFHwMXNBK5je1SwSHl2po3VENBKzDWjG3FRQkCXY8chsBvX0NY4LrFQeb5KA1kX0Dq5zip8DVweE8gHDkis5Qxb1cbJQRvbyASyLDHxPHBNLIRxQD53qpUjSZCxgE4+/BKfSDwSE+CU4FlydDSSEmsn61/KCok1wPhoHIP3vRwtSXIUD1jkbhNbYwIPy6FgMWWeE8wyY3emwFthGHuP+SY2x6TJUXnMVwt7G+3iMED3QSuzBXgw4tgjn6V6MgAfEtIOJpvPLgg0cZ887lALf9fYlGkzC8BrNNOgnMmTbw6wzFVuJ6K5V+9ILA1g/ZQ5pF5mqY3D9SCH72CRxSY+BLJD28RxwX0q8N2wXEoB6HysyEyDLyNHfXpAdj5PDVgp8aYIKjD8/KBe7gpXa7Vq0wLW2g2t3ViTKdCeGtAv8xnGwzU5BB9k8iwLLgdF5iGuGHzve1won2cQl2EcNo93PJ+e0O4fosB2V61+iS+AeTWxjY2ZAk+nByyxA7gnArg+k2elFbnaFFTd1CT9Cr2vFk6lxNuCFRHfnV6ee88OYH8BuTycdhYBt3t55qcGrJToEjxe4yC2eDkWBMnewWQqNX15UqBzMAPYL2MpcKzqn+HooOz4DU4nPWCRdonVEYdYfRsETtLBwG4jl9gY9gDXhmML2pTn3dSAFt9FegQLlGf7iGWmzKNmdNbIF5yS8YAKQc+PfYbr4CamWCYQandk4We3xjA3ejtOJdT9EuMgbonE3K8Kt6uVP1MDOsNKkdckXoo4+WZs8PKsCjf4GkDjR8FsFYZycODisU5iOeBFJOb1TIGXGxVc/GWhzAwzvgGmR5x7DVZ7OdbWQJaZis8EQgUR5F1/i3tV4oWY2eWgKsxWKwebBgx2scQawSvRVQPuLrhNWQp6gr/qHs0mplsmyLk5MTH6XLdSnvVJclX/wtrFOOvlU+D+OkF6gV2CbjJ8Tx99ZMnSxywTi4GZdSa+wXB7VGFBo/zrP4UGfxbMFYzHDsTNSSsd4ftEyOShqZNp5rMN49YRQiS5NYRMBAy22c3EleCWk4vJpyQA994NVa4YnEjXVPKAc13IVICDBFbmRrMgsW9LCeoK6lsZrfzOL/401rnO0QxkU4BV0E1M8bM8Jp9FiCuBSQMfdUDHMA66mcar0BWe3IJBqknIEQGmOdP6nSHQxljhjjvu/xwwJOB1IcPD1DkBTAG5VyeZo1X0nDPARpAmPs7kWJIo1KPJtbS+A/36DYmVQedxF44KD+kpfj0vAKvK4P7pjGW8cvxRe+MZaHVpV3wu7P4FjSUI5qMsu14AAAAASUVORK5CYII=
// @license      MIT
// @match        *://javbus.com/*
// @match        *://*.javbus.com/*
// @require      https://update.greasyfork.org/scripts/447533/1214813/findAndReplaceDOMText%20v%20046.js
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_openInTab
// @grant        GM_download
// @grant        GM_xmlhttpRequest
// @connect      *
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // 检查是否在色花堂网站，如果是则不执行
    if (window.location.hostname.includes('sehuatang.org')) {
        return;
    }

    // 复用现有脚本的正则表达式
    // 一般发行番号
    var oRegExp = /(?<!\w|\/|www\.|=|col-|\d-|>|Jukujo-)(?!heyzo|SHINKI|JPNXXX|carib|vps)[a-zA-Z]{2,6}-\d{2,5}(?:-c|_c|-4k)?(?!\d|[A-Za-z]{2,}|-\d|\.com|\.\d)|(?<!\w|\/|\\|\.|【|-|#|@|=|www\.)(?!heyzo|SHINKI|JPNXXX|carib|and|vps|dvd)[a-zA-Z]{2,6}\s{0,2}\d{3,4}(?:-c|_c)?(?!\w|-|\.|\/|×|％|%|@|\s?天| 于| 发表| 發表|歳| 歲|小时|分|系列| Min| day|ml| time|cm| ppi|\.com)|(?<!\w)(?:PARATHD|3DSVR|STARSBD)[-\s]?\d{3,4}(?!\w)|(?<!\w)(?:HIMEMIX|CASMANI|MGSSLND)[-\s]?\d{3}(?!\w)|(?<!\w)(?:k|n)[01]\d{3}(?!\w|-)|(?<!\w|\d-|\/)[01]\d{5}[-_](?:1)?\d{2,3}(?!\w|-\d)|(?<!\w)(?:carib|1pondo)[-_]\d{6}[-_]\d{2,3}(?!\w)|(?<!\w|\d-)\d{6}[-_]\d{2,3}(?:-1pon|-carib|-paco)(?!\w)|(?<!\w|\d-)\d{6}_(?:1)?\d{3}_0[12](?!\w|-\d)|HEYZO[_-\s]?(?:hd_)?\d{4}/gi;
    
    // 一些素人、无码番号
    var oRegExp_wuma = /(?<!\w|-|\/)\d{3}[a-zA-Z]{2,5}[-\s]?\d{3,4}(?!\w|-|.torrent|年)|(?<!\w|\/)FC2[^\d]{0,5}\d{6,7}|HEYDOUGA[_-\s]?\d{4}-\d{3,5}|(?<!\w)T28-\d{3}|(?<!\w)T-2\d{4,5}(?!\w|-)|(?<!\w|-|\/)[01]\d{5}-[a-zA-Z]{2,7}(?!\w|-)|(?<!\w)MK(?:B)?D-S\d{2,3}(?!\w|-)|(?:SHINKI|KITAIKE)[-\s]?\d{3}(?!\w|-)|JPNXXX[-\s]?\d{5}(?!\w|-)|xxx-av[-\s]\d{4,5}(?!\w|-)|(?<!\w)crazyasia\d{5}(?!\w|-)|(?<!\w)PEWORLD\d{5}(?!\w|-)|(?<!\w)[01]\d{5}[-_]?_01(?=-10mu)?|Jukujo-Club-\d{3}/gi;
    
    // 排除规则
    var oRegExp_Exclude_ID = /^(?:fx-?([^0]\d{2}|\d{4})|[a-zA-Z]+-?0{2,6}$|pg-13|crc-32|ea211|fs[\s-]?140|trc-20|erc-20|rs[\s-]?(232|422|485)|(sg|ae|kr|tw|ph|vn|kh|ru|uk|ua|tr|th|fr|in|de|sr)[\s-]\d{2}|(gm|ga)-\d{4}|cd[\s-]?\d{2,4}|seed[\s-]?\d{3}$|pc005|moc-\d{5}|wd-40|rtd[\s-]?\d{4}|cm\d{4}|rk\d{4})|^ns[\s-]?\d{3,4}$/i;
    var oRegExp_Exclude_en = /^(?:about|ac|actg|aes|again|agm|ah|aim|all|ak|akko|apex|aptx|au|ax|avhd|avx|bej|bgm|chrome|bd|bm|build|(?:fc|p)?[blp]ga|by|bzk|cc|ccie|cctv|cea|ckg|class|cny|covid|cpu|code|debian|df|ds|dw|dx|ea|er|ecma|eia|emui|eof|ep|error|ez|fc|file|flash|flyme|fps|for|fork|from|fuck|fx|gbx|get|github|glm|gnz|gp|groupr|gt|gts|gtx|guest|hao|hd|her|hdr|hk|https?|hp|IEEE|il|ilc|ilce|imx|index|intel|inteli|ip|ipad|is|ISBN|iso|issue|issues|it|jav|javdb|joy|jp|jr|jsr|jt|jukujo|just|kc|keccak|kv[bd]|Kirin|lancet|line|linux|lk|lolrng|lpl|lt|lumia|lg|macos|math|md|mh|miui|mipc|mnvr|mm|mnvr|model|mv|mvp|ms|nas|nature|nc|next|ngff|note|number|ok|only|os|osx|pa|page|pch|phl|ppv|pmw|png|qbz|qsz|raid|rfc|ripemd|rmb|rng|rog|row|rtx|rush|rx|sale|scp|scte|sdm|sdr|server|sha|shp|sonnet|spent|sql|sn|snh|Socket|ssd|status|steam|su|swipe|tcp|the|to|top|than|thread|ts|type|uh|uhd|under|us|usa|usc|utf|utc|via|video|vkffsc|vol|vr|vs|vv|web|win|with|width|wikis|wta|xdr|xfx|xiaomi|yah)$/i;
    var oRegExp_Special_en = /^(?:ace|akb|api|am|anime|at|be|best|bt|bl|cp|crc|exynos|dl|dp|dq|gb|girl|jd|ha|has|hc|hours|iq|in|mk|mini|mhz|mx|no|open|of|over|part|pd|pdd|porn|pt|sb|sex|tv|tb|ty|ver|vip|zd|zip)$/i;
    var oRegExp_Special_num = /^(?:007|101|110|115|123|128|256|360|365|370|404|512|520|911|996|\d{1,2}00|19[789]\d|20[012]\d|720|1080|1024|2048|[056789]\d{3}|(\d)\1{2,3})$/;
    var oRegExp_Exclude_wuma = /^(?:512gb)/i;

    // 排除特定className（移除负向后瞻以提高兼容性）
    var RE_Exclude_className = /name|auth|user|code|^pstatus$|editor|time|sav-id|sidebar|menu|TbwUpd|sehuatang-sender/gi;

    // 全局冷却时间配置
    const COOLDOWN_DURATION = 30 * 1000; // 30秒冷却时间
    const COOLDOWN_KEY = 'sehuatang_sender_cooldown';
    const COOLDOWN_START_KEY = 'sehuatang_sender_cooldown_start';

    // 全局冷却状态管理
    let globalCooldownTimer = null;

    // 检查是否在冷却期间
    function isInCooldown() {
        try {
            const cooldownStart = localStorage.getItem(COOLDOWN_START_KEY);
            if (!cooldownStart) return false;

            const startTime = parseInt(cooldownStart);
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;

            return elapsed < COOLDOWN_DURATION;
        } catch (error) {
            console.error('检查冷却状态失败:', error);
            return false;
        }
    }

    // 获取剩余冷却时间（毫秒）
    function getRemainingCooldown() {
        try {
            const cooldownStart = localStorage.getItem(COOLDOWN_START_KEY);
            if (!cooldownStart) return 0;

            const startTime = parseInt(cooldownStart);
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const remaining = COOLDOWN_DURATION - elapsed;

            return Math.max(0, remaining);
        } catch (error) {
            console.error('获取剩余冷却时间失败:', error);
            return 0;
        }
    }

    // 开始冷却
    function startCooldown() {
        try {
            const currentTime = Date.now();
            localStorage.setItem(COOLDOWN_START_KEY, currentTime.toString());
            localStorage.setItem(COOLDOWN_KEY, 'true');

            // 更新所有按钮状态
            updateAllButtonsState();

            // 设置定时器在冷却结束时清理
            if (globalCooldownTimer) {
                clearTimeout(globalCooldownTimer);
            }

            globalCooldownTimer = setTimeout(() => {
                endCooldown();
            }, COOLDOWN_DURATION);

            console.log('色花堂发送器: 开始30秒冷却期');
        } catch (error) {
            console.error('开始冷却失败:', error);
        }
    }

    // 结束冷却
    function endCooldown() {
        try {
            console.log('色花堂发送器: 开始结束冷却流程');

            // 删除localStorage数据，这会触发其他页面的storage事件
            localStorage.removeItem(COOLDOWN_START_KEY);
            localStorage.removeItem(COOLDOWN_KEY);

            console.log('色花堂发送器: 已删除localStorage冷却数据');

            // 更新所有按钮状态
            updateAllButtonsState();

            // 清理定时器
            if (globalCooldownTimer) {
                clearTimeout(globalCooldownTimer);
                globalCooldownTimer = null;
            }

            console.log('色花堂发送器: 冷却期结束完成');
        } catch (error) {
            console.error('结束冷却失败:', error);
        }
    }

    // 更新所有按钮状态
    function updateAllButtonsState() {
        const buttons = document.querySelectorAll('.sehuatang-sender-btn');
        const inCooldown = isInCooldown();

        buttons.forEach(button => {
            if (inCooldown) {
                button.classList.add('cooldown');
                button.style.pointerEvents = 'none';
                button.style.opacity = '0.5';
                button.innerHTML = '🕐冷却中';
                button.title = '冷却期间，请稍候...';
            } else {
                button.classList.remove('cooldown');
                button.style.pointerEvents = 'auto';
                button.style.opacity = '1';
                if (!button.classList.contains('sending') && !button.classList.contains('success')) {
                    button.innerHTML = '🌸色花堂';
                    const fanghao = button.dataset.fanghao;
                    button.title = `发送番号 ${fanghao} 到色花堂搜索\n点击后将自动打开色花堂搜索页面`;
                }
            }
        });
    }



    // 格式化番号, 添加中间的横杠
    function formatAVID(otext) {
        otext = otext.replace(/\s+|-c|_c|-4k|carib[-_]|1pondo[-_]|-1pon|-paco|-carib|hd_/ig, "");
        if (otext.match((/^[a-z|A-Z]{2,8}\d{2,5}$/i))) {
            var oindex = otext.search(/\d/);
            if (oindex > 0) {
                otext = otext.slice(0, oindex) + "-" + otext.slice(oindex);
            }
        }
        return otext.toUpperCase();
    }

    // 格式化无码番号
    function formatWuma(otext) {
        otext = otext.replace(/\s+|carib[-_]|1pondo[-_]|-1pon|-paco|-carib|hd_/ig, "");
        // 不再分 "FC2PPV-" 和 "FC2-" 统一为 "FC2-"
        if (otext.match(/fc2/i)) {
            var oindex = otext.search(/(?<!fc)\d/i);
            otext = otext.slice(0, oindex) + "-" + otext.slice(oindex);
            otext = otext.replace(/fc2[^0-9]*/ig, "FC2-");
        }
        return otext.toUpperCase();
    }

    // 检查番号是否需要排除
    function IDcheck(otext) {
        var oOnlyText = otext.replace(/[^a-zA-Z]/gi, "");    // 番号中的英文
        var oOnlyNum = otext.replace(/[^0-9]/ig, "");    // 番号中的数字

        // 排除特别的番号
        if (otext.match(oRegExp_Exclude_ID)) {
            return true;
        }

        // 排除特定英文关键词
        if (oOnlyText.match(oRegExp_Exclude_en)) {
            return true;
        }

        // 没有横杠的情况下，排除特定关键词
        if (!otext.includes('-')) {
            if (oOnlyText.match(oRegExp_Special_en) || oOnlyNum.match(oRegExp_Special_num)) {
                return true;
            }
        }

        return false;
    }

    // 检查无码番号是否需要排除
    function IDcheckWuma(otext) {
        if (otext.match(/\d{3}[a-zA-Z]{2,5}[-\s]?\d{3,4}/i)) {
            if (otext.replace(/[^a-zA-Z]/gi, "").match(/^cm$/i)) {
                return true;
            }
        }
        
        if (otext.match(oRegExp_Exclude_wuma)) {
            return true;
        }
        
        return false;
    }

    // 添加样式
    GM_addStyle(`
        .sehuatang-sender-btn {
            margin-left: 4px;
            padding: 3px 10px;
            background: linear-gradient(135deg, #ff6b9d, #c44569);
            color: white;
            border-radius: 15px;
            cursor: pointer;
            font-size: 11px;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 8px rgba(255, 107, 157, 0.3);
            user-select: none;
            font-weight: 600;
            border: none;
            outline: none;
            position: relative;
            overflow: hidden;
            white-space: nowrap;
            vertical-align: middle;
            line-height: 1.2;
        }
        .sehuatang-sender-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }
        .sehuatang-sender-btn:hover {
            background: linear-gradient(135deg, #ff8fab, #d55a7a);
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 6px 16px rgba(255, 107, 157, 0.4);
        }
        .sehuatang-sender-btn:hover::before {
            left: 100%;
        }
        .sehuatang-sender-btn:active {
            transform: translateY(-1px) scale(1.02);
            box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
            transition: all 0.1s ease;
        }
        .sehuatang-sender-btn.sending {
            background: linear-gradient(135deg, #ffa726, #ff9800);
            animation: pulse 1s infinite;
            pointer-events: none;
        }
        .sehuatang-sender-btn.success {
            background: linear-gradient(135deg, #66bb6a, #4caf50);
            animation: bounce 0.6s ease;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        @keyframes bounce {
            0%, 20%, 60%, 100% { transform: translateY(-2px) scale(1.05); }
            40%, 80% { transform: translateY(-4px) scale(1.1); }
        }
        .sehuatang-toast {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            z-index: 10000;
            font-size: 14px;
            font-weight: 600;
            animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            max-width: 300px;
            word-wrap: break-word;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
        }
        .sehuatang-toast.error {
            background: linear-gradient(135deg, #f44336, #d32f2f);
        }
        .sehuatang-toast.warning {
            background: linear-gradient(135deg, #ff9800, #f57c00);
        }
        .sehuatang-toast.info {
            background: linear-gradient(135deg, #2196f3, #1976d2);
        }
        .sehuatang-toast::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: rgba(255,255,255,0.3);
            border-radius: 12px 12px 0 0;
            animation: progress 3s linear;
        }
        @keyframes slideIn {
            from {
                transform: translateX(100%) scale(0.8);
                opacity: 0;
            }
            to {
                transform: translateX(0) scale(1);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0) scale(1);
                opacity: 1;
            }
            to {
                transform: translateX(100%) scale(0.8);
                opacity: 0;
            }
        }
        @keyframes progress {
            from { width: 100%; }
            to { width: 0%; }
        }
        .sehuatang-sender-btn.cooldown {
            background: linear-gradient(135deg, #9e9e9e, #757575) !important;
            cursor: not-allowed !important;
            transform: none !important;
            box-shadow: none !important;
        }
        .sehuatang-sender-btn.cooldown:hover {
            background: linear-gradient(135deg, #9e9e9e, #757575) !important;
            transform: none !important;
            box-shadow: none !important;
        }
    `);

    // 创建色花堂发送按钮
    function createSehuatangButton(avID) {
        const button = document.createElement('span');
        button.className = 'sehuatang-sender-btn';
        button.innerHTML = '🌸色花堂';
        button.title = `发送番号 ${avID} 到色花堂搜索\n点击后将自动打开色花堂搜索页面`;
        button.dataset.fanghao = avID;

        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            // 检查是否在冷却期间
            if (isInCooldown()) {
                const remaining = Math.ceil(getRemainingCooldown() / 1000);
                showToast(`冷却中，请等待 ${remaining} 秒后再试`, 'warning');
                return;
            }

            // 防止重复点击
            if (button.classList.contains('sending') || button.classList.contains('cooldown')) {
                return;
            }

            // 添加发送状态
            button.classList.add('sending');
            button.innerHTML = '📤发送中...';
            button.title = '正在发送，请稍候...';

            try {
                await sendToSehuatang(avID, button);
            } catch (error) {
                // 恢复按钮状态
                button.classList.remove('sending');
                button.innerHTML = '🌸色花堂';
                button.title = `发送番号 ${avID} 到色花堂搜索`;
            }
        });

        // 添加右键菜单
        button.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e, avID);
        });

        // 检查并设置初始冷却状态
        if (isInCooldown()) {
            button.classList.add('cooldown');
            button.style.pointerEvents = 'none';
            button.style.opacity = '0.5';
            button.innerHTML = '🕐冷却中';
            button.title = '冷却期间，请稍候...';
        }

        return button;
    }

    // 下载页面封面图片
    async function downloadCoverImage(avID) {
        try {
            // 查找页面中的封面图片
            const coverImage = document.querySelector('.bigImage img, .screencap img, img[src*="/pics/cover/"]');
            if (!coverImage) {
                throw new Error('未找到封面图片');
            }

            let imageUrl = coverImage.src;

            // 如果是相对路径，转换为绝对路径
            if (imageUrl.startsWith('/')) {
                imageUrl = window.location.origin + imageUrl;
            }

            // 先使用HEAD请求获取文件信息
            GM_xmlhttpRequest({
                method: 'HEAD',
                url: imageUrl,
                onload: function(response) {
                    try {
                        // 从响应头获取正确的文件类型
                        let extension = 'jpg'; // 默认扩展名

                        // 尝试从Content-Type获取扩展名
                        const contentType = response.responseHeaders.match(/content-type:\s*image\/(\w+)/i);
                        if (contentType && contentType[1]) {
                            extension = contentType[1].toLowerCase();
                            // 处理特殊情况
                            if (extension === 'jpeg') extension = 'jpg';
                        } else {
                            // 从URL获取扩展名作为备选
                            const urlMatch = imageUrl.match(/\.(\w+)(?:\?|$)/);
                            if (urlMatch && urlMatch[1]) {
                                extension = urlMatch[1].toLowerCase();
                                if (extension === 'jpeg') extension = 'jpg';
                            }
                        }

                        const fileName = `${avID}.${extension}`;

                        // 使用GM_xmlhttpRequest下载图片数据
                        GM_xmlhttpRequest({
                            method: 'GET',
                            url: imageUrl,
                            responseType: 'blob',
                            headers: {
                                'User-Agent': navigator.userAgent,
                                'Referer': window.location.href
                            },
                            onload: function(response) {
                                try {
                                    // 创建blob URL
                                    const blob = response.response;
                                    const blobUrl = URL.createObjectURL(blob);

                                    // 创建隐藏的下载链接
                                    const downloadLink = document.createElement('a');
                                    downloadLink.href = blobUrl;
                                    downloadLink.download = fileName;
                                    downloadLink.style.display = 'none';

                                    // 添加到页面并自动点击下载
                                    document.body.appendChild(downloadLink);
                                    downloadLink.click();

                                    // 清理资源
                                    setTimeout(() => {
                                        document.body.removeChild(downloadLink);
                                        URL.revokeObjectURL(blobUrl);
                                    }, 100);

                                    showToast(`封面图片下载完成: ${fileName}`, 'success');

                                } catch (error) {
                                    console.error('下载处理失败:', error);
                                    showToast(`下载处理失败: ${error.message}`, 'error');
                                }
                            },
                            onerror: function(error) {
                                console.error('下载失败:', error);
                                showToast('下载图片失败，请检查网络连接', 'error');
                            }
                        });

                        showToast(`开始下载封面图片: ${fileName}`, 'info');

                    } catch (error) {
                        console.error('处理HEAD响应失败:', error);
                        showToast(`处理下载失败: ${error.message}`, 'error');
                    }
                },
                onerror: function(error) {
                    console.error('获取图片信息失败:', error);
                    // 如果HEAD请求失败，直接尝试下载
                    const urlMatch = imageUrl.match(/\.(\w+)(?:\?|$)/);
                    let extension = 'jpg';
                    if (urlMatch && urlMatch[1]) {
                        extension = urlMatch[1].toLowerCase();
                        if (extension === 'jpeg') extension = 'jpg';
                    }

                    const fileName = `${avID}.${extension}`;

                    // 直接使用blob下载
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: imageUrl,
                        responseType: 'blob',
                        headers: {
                            'User-Agent': navigator.userAgent,
                            'Referer': window.location.href
                        },
                        onload: function(response) {
                            try {
                                const blob = response.response;
                                const blobUrl = URL.createObjectURL(blob);

                                const downloadLink = document.createElement('a');
                                downloadLink.href = blobUrl;
                                downloadLink.download = fileName;
                                downloadLink.style.display = 'none';

                                document.body.appendChild(downloadLink);
                                downloadLink.click();

                                setTimeout(() => {
                                    document.body.removeChild(downloadLink);
                                    URL.revokeObjectURL(blobUrl);
                                }, 100);

                                showToast(`封面图片下载完成: ${fileName}`, 'success');

                            } catch (error) {
                                console.error('下载处理失败:', error);
                                showToast(`下载处理失败: ${error.message}`, 'error');
                            }
                        },
                        onerror: function(error) {
                            console.error('下载失败:', error);
                            showToast('下载失败，请检查网络连接和权限设置', 'error');
                        }
                    });

                    showToast(`开始下载封面图片: ${fileName}`, 'info');
                }
            });

        } catch (error) {
            console.error('下载封面图片失败:', error);
            showToast(`下载图片失败: ${error.message}`, 'error');
        }
    }

    // 发送番号到色花堂并下载图片
    async function sendToSehuatang(avID, button = null) {
        try {
            // 数据验证
            if (!avID || typeof avID !== 'string' || avID.trim().length === 0) {
                throw new Error('无效的番号');
            }

            const cleanedID = avID.trim().toUpperCase();
            const timestamp = Date.now();

            // 检查localStorage是否可用
            if (typeof(Storage) === "undefined") {
                throw new Error('浏览器不支持localStorage');
            }



            // 异步下载封面图片
            downloadCoverImage(cleanedID).catch(error => {
                console.error('异步下载图片失败:', error);
            });

            // 打开色花堂搜索页面，通过URL hash传递数据（不会被重定向清除）
            const encodedData = btoa(JSON.stringify({
                fanghao: cleanedID,
                timestamp: timestamp
            }));
            const sehuatangUrl = `https://www.sehuatang.org/search.php#sehuatang_data=${encodedData}`;
            GM_openInTab(sehuatangUrl, true);

            // 更新按钮状态
            if (button) {
                button.classList.remove('sending');
                button.classList.add('success');
                button.innerHTML = '✅已发送';
                button.title = `番号 ${cleanedID} 已成功发送到色花堂并开始下载图片`;

                // 3秒后恢复按钮状态
                setTimeout(() => {
                    button.classList.remove('success');
                    button.innerHTML = '🌸色花堂';
                    button.title = `发送番号 ${cleanedID} 到色花堂搜索`;
                }, 3000);
            }

            // 显示成功提示
            showToast(`番号 ${cleanedID} 已发送到色花堂`, 'success');

            // 启动冷却期
            startCooldown();

            // 记录发送成功
            console.log('色花堂发送器: 发送成功', cleanedID);

            // 设置5分钟后自动清理过期数据
            setTimeout(() => {
                cleanupExpiredData();
            }, 5 * 60 * 1000);

        } catch (error) {
            // 更新按钮状态
            if (button) {
                button.classList.remove('sending');
                button.innerHTML = '❌失败';
                button.title = `发送失败: ${error.message}`;

                // 3秒后恢复按钮状态
                setTimeout(() => {
                    button.innerHTML = '🌸色花堂';
                    button.title = `发送番号 ${avID} 到色花堂搜索`;
                }, 3000);
            }

            // 记录错误
            console.error('色花堂发送器: 发送失败', error.message);

            // 显示用户友好的错误提示
            let errorMessage = '发送失败';
            if (error.message.includes('localStorage')) {
                errorMessage = '浏览器存储不可用，请检查隐私设置';
            } else if (error.message.includes('无效')) {
                errorMessage = '番号格式无效，请检查';
            } else if (error.message.includes('网络')) {
                errorMessage = '网络连接失败，请重试';
            } else {
                errorMessage = `发送失败: ${error.message}`;
            }

            showToast(errorMessage, 'error');

            // 清理可能的不完整数据
            try {
                localStorage.removeItem('sehuatang_search_fanghao');
                localStorage.removeItem('sehuatang_search_timestamp');
                localStorage.removeItem('sehuatang_search_data');
            } catch (cleanupError) {
                console.error('清理失败的数据时出错:', cleanupError);
            }
        }
    }

    // 清理过期数据
    function cleanupExpiredData() {
        try {
            const storedTimestamp = localStorage.getItem('sehuatang_search_timestamp');
            if (storedTimestamp) {
                const timestamp = parseInt(storedTimestamp);
                const now = Date.now();
                const fiveMinutes = 5 * 60 * 1000;

                if (now - timestamp > fiveMinutes) {
                    localStorage.removeItem('sehuatang_search_fanghao');
                    localStorage.removeItem('sehuatang_search_timestamp');
                    localStorage.removeItem('sehuatang_search_data');
                }
            }
        } catch (error) {
            console.error('色花堂发送器: 清理过期数据失败', error);
        }
    }

    // 获取存储的数据状态（调试用）
    function getStorageStatus() {
        try {
            const fanghao = localStorage.getItem('sehuatang_search_fanghao');
            const timestamp = localStorage.getItem('sehuatang_search_timestamp');
            const data = localStorage.getItem('sehuatang_search_data');

            if (fanghao && timestamp) {
                const age = Date.now() - parseInt(timestamp);
                const ageMinutes = Math.floor(age / (1000 * 60));

                return {
                    fanghao: fanghao,
                    timestamp: new Date(parseInt(timestamp)).toLocaleString(),
                    age: `${ageMinutes}分钟前`,
                    isExpired: age > (5 * 60 * 1000),
                    hasExtendedData: !!data
                };
            }
            return null;
        } catch (error) {
            console.error('获取存储状态失败:', error);
            return null;
        }
    }

    // 显示右键菜单
    function showContextMenu(event, avID) {
        // 移除已存在的菜单
        const existingMenu = document.querySelector('.sehuatang-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const menu = document.createElement('div');
        menu.className = 'sehuatang-context-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${event.clientY}px;
            left: ${event.clientX}px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            padding: 8px 0;
            min-width: 150px;
            font-size: 14px;
        `;

        const menuItems = [
            { text: `复制番号: ${avID}`, action: () => copyToClipboard(avID) },
            { text: '发送到色花堂', action: () => sendToSehuatang(avID) },
            { text: '下载封面图片', action: () => downloadCoverImage(avID) },
            { text: '查看存储状态', action: () => showStorageStatus() },
            { text: '清理存储数据', action: () => clearStorageData() }
        ];

        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.textContent = item.text;
            menuItem.style.cssText = `
                padding: 8px 16px;
                cursor: pointer;
                transition: background 0.2s;
            `;
            menuItem.addEventListener('mouseenter', () => {
                menuItem.style.background = '#f5f5f5';
            });
            menuItem.addEventListener('mouseleave', () => {
                menuItem.style.background = 'transparent';
            });
            menuItem.addEventListener('click', () => {
                item.action();
                menu.remove();
            });
            menu.appendChild(menuItem);
        });

        document.body.appendChild(menu);

        // 点击其他地方关闭菜单
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 100);
    }

    // 复制到剪贴板
    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showToast(`已复制: ${text}`, 'info');
            }).catch(() => {
                fallbackCopyToClipboard(text);
            });
        } else {
            fallbackCopyToClipboard(text);
        }
    }

    // 备用复制方法
    function fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            showToast(`已复制: ${text}`, 'info');
        } catch (err) {
            showToast('复制失败', 'error');
        }

        document.body.removeChild(textArea);
    }

    // 显示存储状态
    function showStorageStatus() {
        const status = getStorageStatus();
        if (status) {
            showToast(`存储状态: ${status.fanghao} (${status.age})`, 'info');
        } else {
            showToast('当前没有存储的番号数据', 'info');
        }
    }

    // 清理存储数据
    function clearStorageData() {
        try {
            localStorage.removeItem('sehuatang_search_fanghao');
            localStorage.removeItem('sehuatang_search_timestamp');
            localStorage.removeItem('sehuatang_search_data');
            showToast('存储数据已清理', 'success');
        } catch (error) {
            showToast('清理失败', 'error');
        }
    }

    // 显示提示消息
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `sehuatang-toast ${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 400);
        }, 3000);
    }

    // 简化版检测方法（备选方案）
    function simpleDetection() {
        console.log('色花堂发送器: 使用简化检测方法');

        const fanghaoRegex = /[A-Z]{2,6}-\d{2,5}|FC2-\d{6,7}|HEYDOUGA-\d{4}-\d{3,5}/gi;
        const textNodes = [];
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        while (node = walker.nextNode()) {
            if (node.nodeValue.trim() && !node.parentElement.querySelector('.sehuatang-sender-btn')) {
                textNodes.push(node);
            }
        }

        let detectedCount = 0;
        textNodes.forEach(textNode => {
            const text = textNode.nodeValue;
            const matches = text.match(fanghaoRegex);

            if (matches) {
                matches.forEach(match => {
                    const fanghao = match.trim().toUpperCase();

                    // 创建包装元素
                    const wrapper = document.createElement('span');
                    wrapper.innerHTML = text.replace(match, match + ' ');

                    // 添加按钮
                    const button = createSehuatangButton(fanghao);
                    wrapper.appendChild(button);

                    // 替换原文本节点
                    textNode.parentNode.replaceChild(wrapper, textNode);

                    detectedCount++;
                    console.log('色花堂发送器: 检测到番号', fanghao);
                });
            }
        });

        console.log('色花堂发送器: 简化检测完成，共检测到', detectedCount, '个番号');
        return detectedCount;
    }

    // 开始番号检测和替换
    function startDetection() {
        // 检查 findAndReplaceDOMText 库是否可用
        if (typeof findAndReplaceDOMText === 'undefined') {
            console.warn('色花堂发送器: findAndReplaceDOMText库未加载，使用备选检测方法');
            return simpleDetection();
        }

        console.log('色花堂发送器: 使用findAndReplaceDOMText库进行检测');



        // 使用 findAndReplaceDOMText 进行番号检测和替换
        findAndReplaceDOMText(document.body, {
            find: oRegExp,
            replace: function(portion, match) {
                const avID = match[0].trim();

                // 检查是否需要排除
                if (IDcheck(avID)) {
                    return match[0];
                }

                // 格式化番号
                const formattedID = formatAVID(avID);

                // 创建包装元素
                const wrapper = document.createElement('span');
                wrapper.innerHTML = portion.text;

                // 添加色花堂发送按钮
                const button = createSehuatangButton(formattedID);
                wrapper.appendChild(button);

                return wrapper;
            },
            filterElements: function(el) {
                // 排除特定元素
                if (el.className && el.className.match && el.className.match(RE_Exclude_className)) {
                    return false;
                }
                // 排除已经处理过的元素
                if (el.querySelector && el.querySelector('.sehuatang-sender-btn')) {
                    return false;
                }
                return true;
            }
        });

        // 检测无码番号
        findAndReplaceDOMText(document.body, {
            find: oRegExp_wuma,
            replace: function(portion, match) {
                const avID = match[0].trim();

                // 检查是否需要排除
                if (IDcheckWuma(avID)) {
                    return match[0];
                }

                // 格式化番号
                const formattedID = formatWuma(avID);

                // 创建包装元素
                const wrapper = document.createElement('span');
                wrapper.innerHTML = portion.text;

                // 添加色花堂发送按钮
                const button = createSehuatangButton(formattedID);
                wrapper.appendChild(button);

                return wrapper;
            },
            filterElements: function(el) {
                // 排除特定元素
                if (el.className && el.className.match && el.className.match(RE_Exclude_className)) {
                    return false;
                }
                // 排除已经处理过的元素
                if (el.querySelector && el.querySelector('.sehuatang-sender-btn')) {
                    return false;
                }
                return true;
            }
        });
    }



    // 跨页面状态同步
    function setupCrossPageSync() {
        // 监听 localStorage 变化，实现跨页面同步
        window.addEventListener('storage', (e) => {
            if (e.key === COOLDOWN_START_KEY || e.key === COOLDOWN_KEY) {
                // 清理当前定时器
                if (globalCooldownTimer) {
                    clearTimeout(globalCooldownTimer);
                    globalCooldownTimer = null;
                }

                // 如果冷却数据被删除（newValue为null），立即结束冷却
                if (e.newValue === null) {
                    updateAllButtonsState();
                } else {
                    // 重新初始化状态
                    initializeCooldownState();
                }
            }
        });
    }

    // 初始化冷却状态
    function initializeCooldownState() {
        // 先清理所有现有定时器
        if (globalCooldownTimer) {
            clearTimeout(globalCooldownTimer);
            globalCooldownTimer = null;
        }

        if (isInCooldown()) {
            const remaining = getRemainingCooldown();
            // 更新按钮状态
            updateAllButtonsState();
            // 设置定时器在剩余时间结束时清理
            globalCooldownTimer = setTimeout(() => {
                endCooldown();
            }, remaining);
        } else {
            // 确保按钮状态正确
            updateAllButtonsState();
        }
    }

    // 页面加载完成后开始检测
    function initializeScript() {
        setupCrossPageSync();
        initializeCooldownState();
        startDetection();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeScript);
    } else {
        initializeScript();
    }

    // 监听动态内容变化
    const observer = new MutationObserver(function(mutations) {
        let shouldReprocess = false;
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE && !node.querySelector('.sehuatang-sender-btn')) {
                        shouldReprocess = true;
                        break;
                    }
                }
            }
        });

        if (shouldReprocess) {
            setTimeout(startDetection, 500); // 延迟处理，避免频繁执行
        }
    });

    // 开始监听DOM变化
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 添加调试菜单命令
    if (typeof GM_registerMenuCommand !== 'undefined') {
        GM_registerMenuCommand('查看存储状态', function() {
            const status = getStorageStatus();
            if (status) {
                alert(`色花堂发送器存储状态:\n\n番号: ${status.fanghao}\n时间: ${status.timestamp}\n年龄: ${status.age}\n是否过期: ${status.isExpired ? '是' : '否'}\n扩展数据: ${status.hasExtendedData ? '有' : '无'}`);
            } else {
                alert('当前没有存储的番号数据');
            }
        });

        GM_registerMenuCommand('清理存储数据', function() {
            try {
                localStorage.removeItem('sehuatang_search_fanghao');
                localStorage.removeItem('sehuatang_search_timestamp');
                localStorage.removeItem('sehuatang_search_data');
                alert('存储数据已清理');
                console.log('色花堂发送器: 手动清理存储数据');
            } catch (error) {
                alert('清理失败: ' + error.message);
            }
        });

        GM_registerMenuCommand('测试通信机制', function() {
            const testID = 'TEST-001';
            sendToSehuatang(testID);
        });

        GM_registerMenuCommand('测试冷却功能', function() {
            if (isInCooldown()) {
                const remaining = Math.ceil(getRemainingCooldown() / 1000);
                alert(`当前正在冷却中，剩余时间: ${remaining} 秒`);
            } else {
                startCooldown();
                alert('已启动30秒冷却期，可以在其他页面测试同步效果');
            }
        });

        GM_registerMenuCommand('强制结束冷却', function() {
            endCooldown();
            alert('冷却期已强制结束');
        });

        GM_registerMenuCommand('测试下载图片', function() {
            const testID = 'TEST-001';
            downloadCoverImage(testID).catch(error => {
                alert('测试下载失败: ' + error.message);
            });
        });
    }

    // 页面加载时清理过期数据
    cleanupExpiredData();

    console.log('色花堂番号发送器已加载 - v1.3.6 (支持30秒全局冷却 + 自动下载封面图片)');

})();
