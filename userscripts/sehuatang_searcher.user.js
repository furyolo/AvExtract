// ==UserScript==
// @name         SeHuaTang Forum Searcher Pro
// @namespace    https://github.com/qxinGitHub/searchAV
// @version      2.3
// @description  高级自动化SeHuaTang论坛搜索器 - 智能冷却期管理，Apple风格弹窗，成功后自动关闭页面
// @author       Advanced Developer
// @match        https://www.sehuatang.org/*
// @match        https://www.sehuatang.org/search.php*
// @grant        GM_getValue
// @grant        GM_deleteValue
// ==/UserScript==

(function() {
    'use strict';

    // 添加Apple风格的弹窗样式
    const appleStyleCSS = `
        .apple-alert-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(10px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease-out;
        }

        .apple-alert {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            padding: 30px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            animation: slideUp 0.3s ease-out;
        }

        .apple-alert-icon {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            color: white;
        }

        .apple-alert-icon.error {
            background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        }

        .apple-alert-title {
            font-size: 20px;
            font-weight: 600;
            color: #1d1d1f;
            margin-bottom: 10px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .apple-alert-message {
            font-size: 16px;
            color: #86868b;
            line-height: 1.4;
            margin-bottom: 25px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .apple-alert-button {
            background: #007aff;
            color: white;
            border: none;
            border-radius: 12px;
            padding: 12px 30px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .apple-alert-button:hover {
            background: #0056cc;
            transform: translateY(-1px);
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
    `;

    // 注入CSS样式
    const styleElement = document.createElement('style');
    styleElement.textContent = appleStyleCSS;
    document.head.appendChild(styleElement);

    /**
     * 应用程序配置类
     * 负责管理所有配置项和常量
     */
    class AppConfig {
        constructor() {
            this.settings = {
                // 搜索配置
                search: {
                    keyword: '',
                    autoExecute: true,
                    timeout: 5000,
                    retryAttempts: 3
                },
                // 结果处理配置
                results: {
                    autoClick: true,
                    filterKeywords: ['高清中文字幕'],
                    priorityKeywords: ['无码破解'],
                    maxResults: 10
                },
                // 提取配置
                extraction: {
                    autoExtract: true,
                    copyToClipboard: false, // 禁用剪贴板复制
                    showAlert: false, // 默认静默处理，不显示弹窗
                    timeout: 3000,
                    silentMode: true, // 新增静默模式配置
                    autoCloseOnSuccess: false, // 成功后自动关闭页面
                    closeMode: 'smart', // 关闭模式：'smart'(智能-搜索页点击时关闭), 'current'(仅当前), 'none'(不关闭)
                    fallbackToHomepage: false // 无法关闭页面时跳转到首页
                },
                // 页面加载配置
                page: {
                    loadTimeout: 3000,
                    ageVerificationDelay: 1000,
                    searchDelay: 2000
                },
                // 调试配置
                debug: {
                    enabled: false, // 设置为true启用详细调试日志
                    logLevel: 'INFO' // ERROR, WARN, INFO, DEBUG
                },
                // API配置
                api: {
                    endpoint: 'http://localhost:3226/movies', // 后端API端点
                    timeout: 10000, // API请求超时时间（毫秒）
                    retryAttempts: 2 // 失败重试次数
                }
            };

            this.selectors = {
                // 年龄验证
                ageVerification: 'a.enter-btn',
                // 搜索相关
                searchInputs: [
                    '#search-input',
                    '.search-input',
                    'input[name="keyword"]',
                    'input[name="query"]',
                    'input[type="search"]',
                    'input[placeholder*="搜索"]',
                    'input[placeholder*="search"]'
                ],
                searchButtons: [
                    '#search-button',
                    '.search-button',
                    'input[type="submit"]',
                    'button[type="submit"]',
                    'input[value="搜索"]',
                    'input[value="Search"]'
                ],
                // 内容页面元素
                contentElements: {
                    threadSubject: '#thread_subject',
                    contentFeatures: ['.t_f', '.pcb', '.postmessage', '.postbody', '.content'],
                    threadStructure: ['.threadlist', '.viewthread', '#postlist', '.post']
                },
                // 磁力链接相关
                magnetElements: {
                    blockcode: '.blockcode',
                    magnetLinks: 'a[href*="magnet:?"], a[href*="magnet://"]',
                    downloadLinks: 'a[href*="download"], a[href*="torrent"], a[href*="bt"], a[class*="download"], a[class*="magnet"]'
                },
                // 搜索结果
                resultContainers: [
                    'li[class*="pbw"]',
                    'li[id]',
                    '.search-result',
                    '.result-item',
                    '.thread',
                    '.post',
                    '.item',
                    '[class*="result"]',
                    '[class*="item"]',
                    'p',
                    '.list',
                    '.row',
                    '.entry'
                ]
            };

            this.patterns = {
                magnetRegex: [
                    /(magnet:\?xt=urn:btih:[a-zA-Z0-9]+)/,
                    /(magnet:\?[^\s"']+)/
                ],
                urlPatterns: {
                    searchPage: 'search.php',
                    baseUrl: 'https://www.sehuatang.org'
                }
            };
        }

        get(path) {
            return this._getNestedValue(this.settings, path);
        }

        set(path, value) {
            this._setNestedValue(this.settings, path, value);
        }

        _getNestedValue(obj, path) {
            return path.split('.').reduce((current, key) => current?.[key], obj);
        }

        _setNestedValue(obj, path, value) {
            const keys = path.split('.');
            const lastKey = keys.pop();
            const target = keys.reduce((current, key) => current[key] = current[key] || {}, obj);
            target[lastKey] = value;
        }
    }

    /**
     * 日志管理器
     * 提供统一的日志记录功能
     */
    class Logger {
        constructor(prefix = 'SeHuaTang Searcher', config = null) {
            this.prefix = prefix;
            this.config = config;
            this.levels = {
                ERROR: 0,
                WARN: 1,
                INFO: 2,
                DEBUG: 3
            };
            this.currentLevel = this.levels.INFO;
        }

        error(message, ...args) {
            if (this.currentLevel >= this.levels.ERROR) {
                console.error(`[${this.prefix}] ERROR:`, message, ...args);
            }
        }

        warn(message, ...args) {
            if (this.currentLevel >= this.levels.WARN) {
                console.warn(`[${this.prefix}] WARN:`, message, ...args);
            }
        }

        info(message, ...args) {
            if (this.currentLevel >= this.levels.INFO) {
                console.log(`[${this.prefix}] INFO:`, message, ...args);
            }
        }

        debug(message, ...args) {
            // 检查是否启用debug模式
            const debugEnabled = this.config ? this.config.get('debug.enabled') : false;
            if (debugEnabled && this.currentLevel >= this.levels.DEBUG) {
                console.log(`[${this.prefix}] DEBUG:`, message, ...args);
            }
        }

        setLevel(level) {
            this.currentLevel = typeof level === 'string' ? this.levels[level.toUpperCase()] : level;
        }
    }

    /**
     * DOM工具类
     * 提供DOM操作的便捷方法
     */
    class DOMUtils {
        static querySelector(selectors, context = document) {
            if (Array.isArray(selectors)) {
                for (const selector of selectors) {
                    const element = context.querySelector(selector);
                    if (element) return element;
                }
                return null;
            }
            return context.querySelector(selectors);
        }

        static querySelectorAll(selectors, context = document) {
            if (Array.isArray(selectors)) {
                const results = [];
                for (const selector of selectors) {
                    results.push(...context.querySelectorAll(selector));
                }
                return results;
            }
            return Array.from(context.querySelectorAll(selectors));
        }

        static waitForElement(selector, timeout = 5000, context = document) {
            return new Promise((resolve, reject) => {
                const element = this.querySelector(selector, context);
                if (element) {
                    resolve(element);
                    return;
                }

                const observer = new MutationObserver((_, obs) => {
                    const element = this.querySelector(selector, context);
                    if (element) {
                        obs.disconnect();
                        resolve(element);
                    }
                });

                observer.observe(context, {
                    childList: true,
                    subtree: true
                });

                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Element ${selector} not found within ${timeout}ms`));
                }, timeout);
            });
        }

        static async delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        static simulateKeyPress(element, key) {
            const event = new KeyboardEvent('keydown', {
                key: key,
                code: key === 'Enter' ? 'Enter' : key,
                keyCode: key === 'Enter' ? 13 : key.charCodeAt(0),
                which: key === 'Enter' ? 13 : key.charCodeAt(0),
                bubbles: true
            });
            element.dispatchEvent(event);
        }

        static getTextContent(element) {
            return element ? (element.textContent || element.innerText || '').trim() : '';
        }

        // Apple风格弹窗
        static showAppleAlert(title, message, type = 'error') {
            return new Promise((resolve) => {
                // 创建遮罩层
                const overlay = document.createElement('div');
                overlay.className = 'apple-alert-overlay';

                // 创建弹窗容器
                const alert = document.createElement('div');
                alert.className = 'apple-alert';

                // 创建图标
                const icon = document.createElement('div');
                icon.className = `apple-alert-icon ${type}`;
                icon.innerHTML = type === 'error' ? '✕' : '✓';

                // 创建标题
                const titleElement = document.createElement('div');
                titleElement.className = 'apple-alert-title';
                titleElement.textContent = title;

                // 创建消息
                const messageElement = document.createElement('div');
                messageElement.className = 'apple-alert-message';
                messageElement.textContent = message;

                // 创建按钮
                const button = document.createElement('button');
                button.className = 'apple-alert-button';
                button.textContent = '确定';

                // 组装弹窗
                alert.appendChild(icon);
                alert.appendChild(titleElement);
                alert.appendChild(messageElement);
                alert.appendChild(button);
                overlay.appendChild(alert);

                // 添加到页面
                document.body.appendChild(overlay);

                // 绑定事件
                const closeAlert = () => {
                    overlay.style.animation = 'fadeOut 0.3s ease-out';
                    setTimeout(() => {
                        if (overlay.parentNode) {
                            overlay.parentNode.removeChild(overlay);
                        }
                        resolve();
                    }, 300);
                };

                button.addEventListener('click', closeAlert);
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        closeAlert();
                    }
                });

                // ESC键关闭
                const handleKeydown = (e) => {
                    if (e.key === 'Escape') {
                        document.removeEventListener('keydown', handleKeydown);
                        closeAlert();
                    }
                };
                document.addEventListener('keydown', handleKeydown);
            });
        }

        // 页面关闭功能
        static closePage() {
            // 尝试关闭当前标签页
            try {
                window.close();
            } catch (error) {
                // 如果无法关闭，尝试返回上一页
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    // 如果都不行，跳转到首页
                    window.location.href = 'https://www.sehuatang.org/';
                }
            }
        }
    }

    /**
     * 页面类型枚举
     */
    const PageType = {
        SEARCH_HOME: 'search_home',
        SEARCH_RESULTS: 'search_results',
        CONTENT: 'content',
        OTHER: 'other'
    };

    /**
     * 页面检测器
     * 负责识别当前页面类型
     */
    class PageDetector {
        constructor(config, logger) {
            this.config = config;
            this.logger = logger;
        }

        detectPageType() {
            this.logger.debug('开始检测页面类型');

            // 添加详细的页面状态调试信息
            const currentUrl = window.location.href;
            const currentTitle = document.title;

            this.logger.debug('页面状态信息:', {
                url: currentUrl,
                title: currentTitle,
                hasSearchParams: this._hasSearchParams(currentUrl),
                hasSearchResultElements: this._hasSearchResultElements(),
                hasThreadSubject: !!DOMUtils.querySelector(this.config.selectors.contentElements.threadSubject),
                hasSearchForm: !!DOMUtils.querySelector(this.config.selectors.searchInputs),
                isViewThread: currentUrl.includes('viewthread'),
                isForumPage: currentUrl.includes('forum.php')
            });

            // 优先检测内容页面（最重要的检测）
            if (this.isContentPage()) {
                this.logger.info('检测到内容页面');
                return PageType.CONTENT;
            }

            // 然后检测搜索结果页面
            if (this.isSearchResultPage()) {
                this.logger.info('检测到搜索结果页面');
                return PageType.SEARCH_RESULTS;
            }

            if (this.isSearchHomePage()) {
                this.logger.info('检测到搜索主页');
                return PageType.SEARCH_HOME;
            }

            this.logger.info('检测到其他页面类型');
            return PageType.OTHER;
        }

        isSearchHomePage() {
            const url = window.location.href;

            // 如果已经有搜索结果，就不是搜索主页
            if (this._hasSearchResultElements() || this._hasResultContainers()) {
                return false;
            }

            // 如果URL包含搜索参数，也不是搜索主页
            if (this._hasSearchParams(url)) {
                return false;
            }

            // URL判断：是搜索页面但没有搜索参数
            const isSearchPageWithoutParams = this._isSearchPageWithoutParams(url);

            // 页面标题判断（更严格）
            const isSearchPageTitle = document.title.includes('搜索 -') &&
                                     !document.title.includes('搜索结果') &&
                                     !document.title.includes('结果');

            // 页面元素判断
            const hasSearchForm = !!DOMUtils.querySelector(this.config.selectors.searchInputs);
            const hasNoSearchResults = !this._hasSearchResultElements() && !this._hasResultContainers();

            // 搜索主页必须同时满足：
            // 1. URL是搜索页面且无参数，或者标题显示搜索页面
            // 2. 有搜索表单
            // 3. 没有搜索结果
            const result = (isSearchPageWithoutParams || isSearchPageTitle) &&
                          hasSearchForm &&
                          hasNoSearchResults;

            this.logger.debug('搜索主页检测结果:', {
                url,
                isSearchPageWithoutParams,
                isSearchPageTitle,
                hasSearchForm,
                hasNoSearchResults,
                hasSearchParams: this._hasSearchParams(url),
                hasSearchResultElements: this._hasSearchResultElements(),
                hasResultContainers: this._hasResultContainers(),
                result
            });

            return result;
        }

        isSearchResultPage() {
            const url = window.location.href;

            // 排除内容页面：如果URL包含viewthread，不是搜索结果页面
            if (url.includes('viewthread') || url.includes('mod=viewthread')) {
                this.logger.debug('排除内容页面URL');
                return false;
            }

            // 排除内容页面：如果有帖子标题元素，不是搜索结果页面
            if (DOMUtils.querySelector(this.config.selectors.contentElements.threadSubject)) {
                this.logger.debug('排除有帖子标题的页面');
                return false;
            }

            // 检查URL是否包含搜索参数
            const hasSearchParams = this._hasSearchParams(url);

            // 检查页面内容是否显示搜索结果
            const hasSearchResultElements = this._hasSearchResultElements();

            // 检查页面标题
            const hasSearchResultTitle = this._hasSearchResultTitle();

            // 检查是否有搜索结果容器（更具体的检测）
            const hasResultContainers = this._hasResultContainers();

            // 检查URL路径是否明确表示搜索结果（排除内容页面）
            const isSearchResultUrl = url.includes('search.php') &&
                                     !url.includes('viewthread') &&
                                     (hasSearchParams || url.includes('searchid'));

            // 搜索结果页面的判断条件（必须满足以下条件之一，且不是内容页面）：
            // 1. URL明确表示搜索结果
            // 2. 有搜索结果元素且有搜索参数
            // 3. 有搜索结果标题且有搜索参数
            const result = isSearchResultUrl ||
                          (hasSearchResultElements && hasSearchParams) ||
                          (hasSearchResultTitle && hasSearchParams);

            this.logger.debug('搜索结果页面检测结果:', {
                url,
                hasSearchParams,
                hasSearchResultElements,
                hasSearchResultTitle,
                hasResultContainers,
                isSearchResultUrl,
                hasThreadSubject: !!DOMUtils.querySelector(this.config.selectors.contentElements.threadSubject),
                isViewThread: url.includes('viewthread'),
                result
            });

            return result;
        }

        isContentPage() {
            const url = window.location.href;

            // 强特征检测：如果URL包含viewthread，很可能是内容页面
            const isViewThreadUrl = url.includes('viewthread') || url.includes('mod=viewthread');

            // 强特征检测：如果有帖子标题元素，肯定是内容页面
            const hasThreadSubject = !!DOMUtils.querySelector(this.config.selectors.contentElements.threadSubject);

            // 如果有强特征，直接返回true
            if (isViewThreadUrl || hasThreadSubject) {
                this.logger.debug('内容页面强特征检测通过:', {
                    isViewThreadUrl,
                    hasThreadSubject
                });
                return true;
            }

            // 排除明确的搜索页面
            const isSearchPageUrl = url.includes('search.php') && !url.includes('viewthread');
            const isSearchPageTitle = document.title.includes('搜索 -') &&
                                     !document.title.includes('搜索结果') &&
                                     !isViewThreadUrl;

            if (isSearchPageUrl || isSearchPageTitle) {
                this.logger.debug('排除搜索页面:', {
                    isSearchPageUrl,
                    isSearchPageTitle
                });
                return false;
            }

            // 检查内容页面特征
            const hasContentFeatures = !!DOMUtils.querySelector(this.config.selectors.contentElements.contentFeatures);
            const hasThreadStructure = !!DOMUtils.querySelector(this.config.selectors.contentElements.threadStructure);
            const hasValidContentTitle = this._hasValidContentTitle();

            // 检查是否有帖子内容相关的元素
            const hasPostContent = !!document.querySelector('.postbody, .post-content, .message, .content');
            const hasPostList = !!document.querySelector('#postlist, .postlist, .post-list');

            const isContentPage = hasContentFeatures ||
                                 hasThreadStructure ||
                                 hasPostContent ||
                                 hasPostList ||
                                 (hasValidContentTitle && !this._hasSearchResultElements());

            this.logger.debug('内容页面检测结果:', {
                url,
                isViewThreadUrl,
                hasThreadSubject,
                hasContentFeatures,
                hasThreadStructure,
                hasValidContentTitle,
                hasPostContent,
                hasPostList,
                hasSearchResultElements: this._hasSearchResultElements(),
                isContentPage
            });

            return isContentPage;
        }

        _isSearchPageWithoutParams(url) {
            const baseSearchUrls = [
                'https://www.sehuatang.org/search.php',
                'https://www.sehuatang.org/search.php/',
                'https://www.sehuatang.org/search.php?'
            ];

            return baseSearchUrls.includes(url) ||
                   (url.includes('search.php') && !url.includes('='));
        }

        _hasSearchParams(url) {
            const searchParams = ['keyword', 'query', 'searchid', 'mod=forum', 'srchtxt'];
            return url.includes('search.php') &&
                   searchParams.some(param => url.includes(param));
        }

        _hasSearchResultElements() {
            const resultSelectors = [
                '.search_result',
                '.searchresult',
                '#searchresult',
                '.result-item',
                '[class*="result"]'
            ];
            return !!DOMUtils.querySelector(resultSelectors);
        }

        _hasSearchResultTitle() {
            return document.title.includes('搜索结果') ||
                   document.title.includes('Search Results') ||
                   (document.title.includes('搜索') && !document.title.includes('搜索 -'));
        }

        _hasValidContentTitle() {
            return document.title &&
                   !document.title.includes('搜索') &&
                   !document.title.includes('Search') &&
                   !document.title.includes('首页') &&
                   !document.title.includes('Home') &&
                   (document.title.includes('98堂') ||
                    document.title.includes('色花堂') ||
                    document.title.includes('SeHuaTang'));
        }

        _hasResultContainers() {
            const containers = DOMUtils.querySelectorAll(this.config.selectors.resultContainers);
            // 检查是否有实际的搜索结果容器（不只是空的容器）
            const validContainers = containers.filter(container => {
                const text = DOMUtils.getTextContent(container);
                // 容器应该有实际内容，且不只是导航或其他页面元素
                return text.length > 20 &&
                       (text.includes('高清') || text.includes('字幕') || text.includes('下载') ||
                        text.includes('magnet') || text.includes('磁力') || text.includes('BT'));
            });

            this.logger.debug(`找到 ${containers.length} 个容器，其中 ${validContainers.length} 个有效结果容器`);
            return validContainers.length > 0;
        }
    }

    /**
     * 搜索处理器
     * 负责执行搜索操作
     */
    class SearchHandler {
        constructor(config, logger) {
            this.config = config;
            this.logger = logger;
        }

        async executeSearch() {
            try {
                this.logger.info('开始执行搜索');

                // 等待页面加载完成
                await DOMUtils.delay(this.config.get('page.searchDelay'));

                // 查找搜索框
                const searchInput = await this._findSearchInput();
                if (!searchInput) {
                    throw new Error('未找到搜索框');
                }

                // 获取搜索关键词
                const searchTerm = await this._getSearchKeyword();
                if (!searchTerm) {
                    this.logger.warn('用户取消了搜索');
                    return false;
                }

                // 执行搜索
                await this._performSearch(searchInput, searchTerm);

                this.logger.info('搜索执行完成');
                return true;

            } catch (error) {
                this.logger.error('搜索执行失败:', error);
                return false;
            }
        }

        async _findSearchInput() {
            this.logger.debug('查找搜索框');

            const searchInput = DOMUtils.querySelector(this.config.selectors.searchInputs);

            if (searchInput) {
                this.logger.debug('找到搜索框:', searchInput);
                return searchInput;
            }

            // 尝试等待搜索框出现
            try {
                const waitedInput = await DOMUtils.waitForElement(
                    this.config.selectors.searchInputs,
                    this.config.get('search.timeout')
                );
                this.logger.debug('等待后找到搜索框:', waitedInput);
                return waitedInput;
            } catch (error) {
                this.logger.error('等待搜索框超时:', error);
                return null;
            }
        }

        async _getSearchKeyword() {
            // 检查多种方式传入的番号数据
            let fanghao = null;
            let timestamp = null;
            let dataSource = '';

            // 方式1: 检查URL hash (最可靠)
            try {
                const hash = window.location.hash;
                if (hash && hash.includes('sehuatang_data=')) {
                    const dataMatch = hash.match(/sehuatang_data=([^&]+)/);
                    if (dataMatch) {
                        const encodedData = dataMatch[1];
                        const decodedData = JSON.parse(atob(encodedData));

                        this.logger.info('检查URL hash:', {
                            fanghao: decodedData.fanghao,
                            timestamp: decodedData.timestamp,
                            timestampDate: decodedData.timestamp ? new Date(decodedData.timestamp).toLocaleString() : null
                        });

                        if (decodedData.fanghao && decodedData.timestamp) {
                            fanghao = decodedData.fanghao;
                            timestamp = decodedData.timestamp;
                            dataSource = 'URL hash';
                        }
                    }
                }
            } catch (error) {
                this.logger.error('检查URL hash时出错:', error);
            }

            // 方式2: 检查GM_getValue (跨域共享)
            if (!fanghao) {
                try {
                    const gmFanghao = GM_getValue('sehuatang_search_fanghao');
                    const gmTimestamp = GM_getValue('sehuatang_search_timestamp');

                    this.logger.info('检查GM_getValue:', {
                        fanghao: gmFanghao,
                        timestamp: gmTimestamp,
                        timestampDate: gmTimestamp ? new Date(parseInt(gmTimestamp)).toLocaleString() : null
                    });

                    if (gmFanghao && gmTimestamp) {
                        fanghao = gmFanghao;
                        timestamp = parseInt(gmTimestamp);
                        dataSource = 'GM_getValue';
                    }
                } catch (error) {
                    this.logger.error('检查GM_getValue时出错:', error);
                }
            }



            // 如果找到了数据，验证有效期
            if (fanghao && timestamp) {
                const now = Date.now();
                const fiveMinutes = 5 * 60 * 1000; // 5分钟有效期

                if (now - timestamp < fiveMinutes) {
                    // 数据有效，使用传入的番号
                    this.config.set('search.keyword', fanghao);
                    this.logger.info(`使用${dataSource}传入的搜索关键词:`, fanghao);
                    this.logger.info('传入数据时间戳:', new Date(timestamp).toLocaleString());

                    // 清理所有存储的数据，避免重复使用
                    this._cleanupSearchData();

                    return fanghao;
                } else {
                    // 数据过期
                    this.logger.info(`${dataSource}传入的数据已过期，时间戳:`, new Date(timestamp).toLocaleString());
                    this._cleanupSearchData();
                }
            }

            // 没有传入番号，直接返回null，不显示弹窗
            this.logger.info('没有检测到传入的番号，跳过搜索');
            return null;
        }

        // 清理所有存储的搜索数据
        _cleanupSearchData() {
            try {
                // 清理URL hash
                if (window.location.hash) {
                    const newUrl = window.location.pathname + window.location.search;
                    window.history.replaceState({}, document.title, newUrl);
                }

                // 清理GM存储（备用）
                GM_deleteValue('sehuatang_search_fanghao');
                GM_deleteValue('sehuatang_search_timestamp');
                GM_deleteValue('sehuatang_search_data');

                this.logger.info('已清理搜索数据');
            } catch (error) {
                this.logger.error('清理搜索数据时出错:', error);
            }
        }

        async _performSearch(searchInput, searchTerm) {
            this.logger.debug('执行搜索操作');

            // 设置搜索关键词
            searchInput.value = searchTerm;
            searchInput.focus();

            // 查找搜索按钮
            const searchButton = DOMUtils.querySelector(this.config.selectors.searchButtons);

            if (searchButton) {
                this.logger.debug('点击搜索按钮');
                searchButton.click();
            } else {
                this.logger.debug('按回车键执行搜索');
                DOMUtils.simulateKeyPress(searchInput, 'Enter');
            }

            // 等待搜索结果
            await DOMUtils.delay(this.config.get('search.timeout'));
        }
    }

    /**
     * 结果过滤器
     * 负责过滤和选择搜索结果
     */
    class ResultFilter {
        constructor(config, logger) {
            this.config = config;
            this.logger = logger;
        }

        async filterAndSelectResult() {
            try {
                this.logger.info('开始过滤搜索结果');

                // 等待搜索结果加载
                await DOMUtils.delay(this.config.get('page.loadTimeout'));

                // 获取所有结果容器
                const resultContainers = this._getResultContainers();
                if (resultContainers.length === 0) {
                    throw new Error('未找到搜索结果容器');
                }

                this.logger.info(`开始过滤 ${resultContainers.length} 个搜索结果容器`);

                // 过滤包含目标关键词的结果
                const filteredResults = this._filterByKeywords(resultContainers);
                if (filteredResults.length === 0) {
                    const filterKeywords = this.config.get('results.filterKeywords');
                    const message = `未找到包含"${filterKeywords.join('" 或 "')}"的搜索结果`;

                    this.logger.info(`结果过滤失败: ${message}`);
                    throw new Error(message);
                }

                // 选择最佳结果
                const selectedResult = this._selectBestResult(filteredResults);
                if (!selectedResult) {
                    throw new Error('未找到合适的搜索结果');
                }

                // 点击选中的结果
                await this._clickResult(selectedResult);

                this.logger.info('结果过滤和选择完成');
                return true;

            } catch (error) {
                this.logger.error('结果过滤失败:', error);
                return false;
            }
        }

        _getResultContainers() {
            const containers = DOMUtils.querySelectorAll(this.config.selectors.resultContainers);
            this.logger.debug(`找到 ${containers.length} 个可能的搜索结果容器`);
            return containers;
        }

        _filterByKeywords(containers) {
            const filterKeywords = this.config.get('results.filterKeywords');

            // 严格过滤：只查找包含目标关键词的结果
            const filtered = containers.filter(container => {
                const text = DOMUtils.getTextContent(container);
                return filterKeywords.some(keyword => text.includes(keyword));
            });

            this.logger.info(`严格过滤结果: 找到 ${filtered.length} 个包含"${filterKeywords.join('", "')}"的搜索结果`);

            // 如果没有找到匹配的结果，记录详细信息
            if (filtered.length === 0) {
                this.logger.info('未找到包含目标关键词的搜索结果，停止处理');
                this.logger.debug('搜索结果预览:', containers.slice(0, 3).map(container => {
                    const text = DOMUtils.getTextContent(container);
                    return text.substring(0, 100) + (text.length > 100 ? '...' : '');
                }));
            }

            return filtered;
        }

        _selectBestResult(results) {
            const priorityKeywords = this.config.get('results.priorityKeywords');

            // 优先选择包含优先级关键词的结果
            for (const keyword of priorityKeywords) {
                for (const container of results) {
                    const h3Element = container.querySelector('h3.xs3');
                    if (h3Element) {
                        const h3Text = DOMUtils.getTextContent(h3Element);
                        if (h3Text.includes(keyword)) {
                            this.logger.debug(`找到包含优先级关键词"${keyword}"的结果`);
                            return { container, element: h3Element };
                        }
                    }
                }
            }

            // 如果没有找到优先级结果，选择第一个
            const firstContainer = results[0];
            const h3Element = firstContainer.querySelector('h3.xs3');

            this.logger.debug('使用第一个过滤结果');
            return { container: firstContainer, element: h3Element };
        }

        async _clickResult(selectedResult) {
            const { container, element } = selectedResult;

            // 查找链接
            let link = null;
            if (element) {
                link = element.querySelector('a[href]');
            }

            if (!link && container) {
                link = container.querySelector('a[href]');
            }

            if (!link) {
                throw new Error('未找到可点击的链接');
            }

            this.logger.info('点击目标链接:', {
                url: link.href,
                text: DOMUtils.getTextContent(link)
            });

            // 延迟以确保页面稳定
            await DOMUtils.delay(1000);

            // 🆕 最佳方案：直接导航而不是点击链接，这样可以在同一标签页中跳转
            this.logger.info('直接导航到目标页面（而不是点击链接）');

            // 设置一个标记，表示这是从搜索页面导航过来的
            sessionStorage.setItem('sehuatang_from_search', 'true');

            // 直接导航到目标页面
            window.location.href = link.href;

            // 等待页面跳转
            await DOMUtils.delay(500);
        }
    }

    /**
     * API通信处理器
     * 负责与后端API进行数据交互
     */
    class APIHandler {
        constructor(config, logger) {
            this.config = config;
            this.logger = logger;
            this.apiEndpoint = this.config.get('api.endpoint');
            this.timeout = this.config.get('api.timeout');
            this.retryAttempts = this.config.get('api.retryAttempts');
        }

        /**
         * 清理标题中的标记
         * @param {string} title - 原始标题
         * @returns {string} - 清理后的标题
         */
        cleanTitle(title) {
            if (!title) return title;

            // 定义需要移除的标记模式（支持方括号和中文方括号）
            const patterns = [
                /\[自提征用\]/g,
                /【自提征用】/g,
                /\[无码破解\]/g,
                /【无码破解】/g,
                /\[高清中文字幕\]/g,
                /【高清中文字幕】/g,
                /\[.*?破解.*?\]/g,
                /【.*?破解.*?】/g,
                /\[.*?征用.*?\]/g,
                /【.*?征用.*?】/g
            ];

            let cleanedTitle = title;
            patterns.forEach(pattern => {
                cleanedTitle = cleanedTitle.replace(pattern, '');
            });

            // 清理多余的空格
            cleanedTitle = cleanedTitle.replace(/\s+/g, ' ').trim();

            this.logger.debug('标题清理结果:', {
                original: title,
                cleaned: cleanedTitle
            });

            return cleanedTitle;
        }

        /**
         * 验证数据完整性
         * @param {Object} data - 要验证的数据
         * @returns {boolean} - 验证结果
         */
        validateData(data) {
            const { code, title, magnet_link } = data;

            if (!code || !code.trim()) {
                this.logger.error('数据验证失败: 番号为空');
                return false;
            }

            if (!title || !title.trim()) {
                this.logger.error('数据验证失败: 标题为空');
                return false;
            }

            if (!magnet_link || !magnet_link.trim()) {
                this.logger.error('数据验证失败: 磁力链接为空');
                return false;
            }

            if (!magnet_link.startsWith('magnet:')) {
                this.logger.error('数据验证失败: 磁力链接格式无效');
                return false;
            }

            return true;
        }

        /**
         * 创建带超时的fetch请求
         * @param {string} url - 请求URL
         * @param {Object} options - fetch选项
         * @param {number} timeout - 超时时间（毫秒）
         * @returns {Promise} - fetch Promise
         */
        async fetchWithTimeout(url, options, timeout) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            try {
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                return response;
            } catch (error) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    throw new Error(`请求超时 (${timeout}ms)`);
                }
                throw error;
            }
        }

        /**
         * 提交数据到后端API（带重试机制）
         * @param {string} fanHao - 番号
         * @param {string} title - 标题
         * @param {string} magnetLink - 磁力链接
         * @returns {Promise<boolean>} - 提交结果
         */
        async submitData(fanHao, title, magnetLink) {
            // 清理标题
            const cleanedTitle = this.cleanTitle(title);

            // 准备数据（匹配API期望的字段名）
            const data = {
                code: fanHao.trim(),
                title: cleanedTitle,
                magnet_link: magnetLink.trim()
            };

            // 验证数据
            if (!this.validateData(data)) {
                return false;
            }

            this.logger.info('准备提交数据到API:', data);

            // 重试机制
            for (let attempt = 1; attempt <= this.retryAttempts + 1; attempt++) {
                try {
                    this.logger.debug(`API提交尝试 ${attempt}/${this.retryAttempts + 1}`);

                    // 发送HTTP请求（带超时）
                    const response = await this.fetchWithTimeout(this.apiEndpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(data)
                    }, this.timeout);

                    // 检查响应状态
                    if (response.status === 409) {
                        // 409 Conflict 表示数据已存在，这也算成功
                        this.logger.info('数据已存在于数据库中，视为提交成功');
                        return true;
                    } else if (!response.ok) {
                        throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
                    }

                    const result = await response.json();
                    this.logger.info('API提交成功:', result);
                    return true;

                } catch (error) {
                    this.logger.warn(`API提交尝试 ${attempt} 失败:`, error.message);

                    // 如果是最后一次尝试，记录详细错误
                    if (attempt === this.retryAttempts + 1) {
                        this.logger.error('所有API提交尝试都失败了:', error);

                        // 根据错误类型提供更详细的错误信息
                        if (error.name === 'TypeError' && error.message.includes('fetch')) {
                            this.logger.error('网络连接错误，请检查API服务是否运行');
                        } else if (error.name === 'SyntaxError') {
                            this.logger.error('API响应格式错误');
                        } else if (error.message.includes('超时')) {
                            this.logger.error('API请求超时，请检查网络连接或增加超时时间');
                        }

                        return false;
                    }

                    // 等待一段时间后重试
                    if (attempt < this.retryAttempts + 1) {
                        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // 指数退避，最大5秒
                        this.logger.debug(`等待 ${delay}ms 后重试`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }

            return false;
        }
    }

    /**
     * 磁力链接提取器
     * 负责从内容页面提取标题和磁力链接
     */
    class MagnetExtractor {
        constructor(config, logger, stateManager) {
            this.config = config;
            this.logger = logger;
            this.stateManager = stateManager;
            this.apiHandler = new APIHandler(config, logger);
            this.extractionStrategies = [
                this._extractFromBlockcode.bind(this),
                this._extractFromMagnetLinks.bind(this),
                this._extractFromPageText.bind(this),
                this._extractFromDownloadLinks.bind(this),
                this._extractFromCodeBlocks.bind(this),
                this._extractFromPreElements.bind(this),
                this._extractFromTextNodes.bind(this),
                this._extractWithLooseRegex.bind(this)
            ];
        }

        async extractTitleAndMagnet() {
            try {
                this.logger.info('开始提取标题和磁力链接');

                // 在提取过程中暂时重置页面卸载状态
                if (this.stateManager) {
                    this.stateManager.state.isPageUnloading = false;
                    this.stateManager.saveState();
                }

                // 添加页面信息调试
                this.logger.debug('页面信息:', {
                    url: window.location.href,
                    title: document.title,
                    bodyLength: document.body.textContent.length,
                    hasBlockcode: !!document.querySelector('.blockcode'),
                    hasMagnetLinks: !!document.querySelector('a[href*="magnet"]'),
                    hasCodeElements: !!document.querySelector('code, .code, pre')
                });

                // 等待页面加载完成
                await DOMUtils.delay(this.config.get('extraction.timeout'));

                // 提取标题
                const title = this._extractTitle();

                // 提取磁力链接
                const magnetLink = await this._extractMagnetLink();

                if (!magnetLink) {
                    // 提供更详细的失败信息
                    this.logger.warn('所有提取策略都失败了，页面可能不包含磁力链接');
                    this.logger.debug('页面内容预览:', document.body.textContent.substring(0, 500));
                    throw new Error('未找到磁力链接');
                }

                // 处理提取结果
                await this._handleExtractionResult(title, magnetLink);

                // 标记提取完成
                if (this.stateManager) {
                    this.stateManager.markExtractionCompleted();
                }

                this.logger.info('标题和磁力链接提取完成');
                return { title, magnetLink };

            } catch (error) {
                this.logger.error('提取失败:', error);

                // 检查是否是页面卸载导致的错误（但要更严格的检查）
                if (this.stateManager && this.stateManager.isPageUnloading() &&
                    (document.hidden || !document.hasFocus())) {
                    this.logger.info('页面正在卸载，跳过错误处理');
                    return null;
                }

                await this._handleExtractionError();
                return null;
            }
        }

        _extractTitle() {
            this.logger.debug('提取页面标题');

            // 优先从指定元素提取
            const threadSubjectElement = DOMUtils.querySelector(this.config.selectors.contentElements.threadSubject);
            if (threadSubjectElement) {
                const title = DOMUtils.getTextContent(threadSubjectElement);
                this.logger.debug('从thread_subject提取标题:', title);
                return title;
            }

            // 回退到页面标题
            const title = document.title || document.querySelector('h1')?.textContent || '未知标题';
            this.logger.debug('从页面标题提取标题:', title);
            return title;
        }

        async _extractMagnetLink() {
            this.logger.debug('开始提取磁力链接');

            for (let i = 0; i < this.extractionStrategies.length; i++) {
                const strategy = this.extractionStrategies[i];
                const strategyName = strategy.name.replace('bound ', '');

                this.logger.debug(`尝试策略 ${i + 1}: ${strategyName}`);

                try {
                    const magnetLink = await strategy();
                    if (magnetLink) {
                        this.logger.info(`策略 ${i + 1} 成功提取磁力链接:`, magnetLink);
                        return magnetLink;
                    }
                } catch (error) {
                    this.logger.warn(`策略 ${i + 1} 失败:`, error);
                }
            }

            return null;
        }

        _extractFromBlockcode() {
            const blockcodeElements = DOMUtils.querySelectorAll(this.config.selectors.magnetElements.blockcode);
            this.logger.debug(`找到 ${blockcodeElements.length} 个blockcode元素`);

            for (const blockcode of blockcodeElements) {
                const codeElement = blockcode.querySelector('li');
                if (codeElement) {
                    const codeText = DOMUtils.getTextContent(codeElement);
                    if (codeText.startsWith('magnet:?')) {
                        return codeText.trim();
                    }
                }
            }

            return null;
        }

        _extractFromMagnetLinks() {
            const magnetLinks = DOMUtils.querySelectorAll(this.config.selectors.magnetElements.magnetLinks);
            this.logger.debug(`找到 ${magnetLinks.length} 个磁力链接元素`);

            if (magnetLinks.length > 0) {
                return magnetLinks[0].href;
            }

            return null;
        }

        _extractFromPageText() {
            const pageText = document.body.textContent || document.body.innerText;
            const magnetRegex = this.config.patterns.magnetRegex[0];
            const match = pageText.match(magnetRegex);

            if (match) {
                return match[1];
            }

            return null;
        }

        _extractFromDownloadLinks() {
            const downloadLinks = DOMUtils.querySelectorAll(this.config.selectors.magnetElements.downloadLinks);
            this.logger.debug(`找到 ${downloadLinks.length} 个下载链接元素`);

            for (const link of downloadLinks) {
                const href = link.href || link.getAttribute('href');
                const text = DOMUtils.getTextContent(link);

                if (href && (href.startsWith('magnet:') || text.includes('磁力') || text.includes('magnet'))) {
                    return href;
                }
            }

            return null;
        }

        _extractFromCodeBlocks() {
            // 查找 <code> 元素
            const codeElements = document.querySelectorAll('code, .code, [class*="code"]');
            this.logger.debug(`找到 ${codeElements.length} 个代码块元素`);

            for (const codeElement of codeElements) {
                const codeText = DOMUtils.getTextContent(codeElement);
                if (codeText.startsWith('magnet:?')) {
                    return codeText.trim();
                }
            }

            return null;
        }

        _extractFromPreElements() {
            // 查找 <pre> 元素
            const preElements = document.querySelectorAll('pre');
            this.logger.debug(`找到 ${preElements.length} 个预格式化文本元素`);

            for (const preElement of preElements) {
                const preText = DOMUtils.getTextContent(preElement);
                if (preText.includes('magnet:?')) {
                    const magnetRegex = /(magnet:\?[^\s\n\r]+)/;
                    const match = preText.match(magnetRegex);
                    if (match) {
                        return match[1];
                    }
                }
            }

            return null;
        }

        _extractFromTextNodes() {
            // 查找所有文本节点中的磁力链接
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            let node;
            while (node = walker.nextNode()) {
                const text = node.textContent;
                if (text && text.includes('magnet:?')) {
                    const magnetRegex = /(magnet:\?[^\s\n\r"'<>]+)/;
                    const match = text.match(magnetRegex);
                    if (match) {
                        this.logger.debug('从文本节点提取磁力链接');
                        return match[1];
                    }
                }
            }

            return null;
        }

        _extractWithLooseRegex() {
            const pageText = document.body.textContent || document.body.innerText;

            // 尝试多种正则表达式模式
            const patterns = [
                /(magnet:\?[^\s"'<>]+)/,
                /(magnet:\?xt=urn:btih:[a-zA-Z0-9]+[^\s"'<>]*)/,
                /(magnet:\?[^"'<>\s]+)/,
                /magnet:\?xt=urn:btih:[a-fA-F0-9]{40}/,
                /magnet:\?xt=urn:btih:[a-fA-F0-9]{32}/
            ];

            for (const pattern of patterns) {
                const match = pageText.match(pattern);
                if (match) {
                    this.logger.debug('宽松正则匹配成功:', pattern);
                    return match[1] || match[0];
                }
            }

            return null;
        }

        /**
         * 从URL或页面内容中提取番号
         * @returns {string|null} - 提取到的番号
         */
        _extractFanHao() {
            // 尝试从搜索关键词中获取番号
            const searchKeyword = this.config.get('search.keyword');
            if (searchKeyword && searchKeyword.trim()) {
                this.logger.debug('从搜索关键词提取番号:', searchKeyword);
                return searchKeyword.trim();
            }

            // 尝试从URL参数中提取
            const urlParams = new URLSearchParams(window.location.search);
            const keywordFromUrl = urlParams.get('keyword') || urlParams.get('query') || urlParams.get('srchtxt');
            if (keywordFromUrl) {
                this.logger.debug('从URL参数提取番号:', keywordFromUrl);
                return keywordFromUrl.trim();
            }

            // 尝试从页面标题中提取番号模式
            const title = document.title;
            const fanHaoPatterns = [
                /([A-Z]{2,6}-?\d{3,6})/i,  // 标准番号格式，如 SSIS-123, IPX123
                /([A-Z]{1,4}\d{3,6})/i,    // 简化格式，如 S123
                /(\d{6}_\d{3})/,           // 数字格式，如 123456_001
            ];

            for (const pattern of fanHaoPatterns) {
                const match = title.match(pattern);
                if (match) {
                    this.logger.debug('从页面标题提取番号:', match[1]);
                    return match[1].toUpperCase();
                }
            }

            // 尝试从页面内容中提取
            const pageText = document.body.textContent;
            for (const pattern of fanHaoPatterns) {
                const match = pageText.match(pattern);
                if (match) {
                    this.logger.debug('从页面内容提取番号:', match[1]);
                    return match[1].toUpperCase();
                }
            }

            this.logger.warn('无法提取番号');
            return null;
        }

        async _handleExtractionResult(title, magnetLink) {
            const result = `标题: ${title}\n磁力链接: ${magnetLink}`;

            this.logger.info('提取结果:', result);

            // 提取番号
            const fanHao = this._extractFanHao();

            let submitSuccess = false;

            // 静默处理API提交
            if (fanHao) {
                this.logger.info('开始静默提交数据到API');
                submitSuccess = await this.apiHandler.submitData(fanHao, title, magnetLink);

                if (submitSuccess) {
                    this.logger.info('数据已成功提交到后端API');

                    // 成功：自动关闭页面
                    if (this.config.get('extraction.autoCloseOnSuccess')) {
                        this.logger.info('数据提交成功，准备关闭页面');

                        // 延迟关闭，确保日志输出完成和API响应处理完毕
                        setTimeout(() => {
                            this.logger.info('开始执行页面关闭流程');
                            this._closeCurrentAndSearchPages();
                        }, 1500); // 增加延迟时间确保所有操作完成
                    }
                } else {
                    this.logger.error('数据提交到后端API失败');

                    // 失败：显示Apple风格弹窗
                    await DOMUtils.showAppleAlert(
                        '保存失败',
                        '无法将数据保存到数据库，请检查网络连接或联系管理员。',
                        'error'
                    );
                }
            } else {
                this.logger.warn('无法获取番号，跳过API提交');

                // 无法获取番号：显示Apple风格弹窗
                await DOMUtils.showAppleAlert(
                    '数据提取失败',
                    '无法获取番号信息，请检查页面内容或手动输入。',
                    'error'
                );
            }

            // 不再复制到剪贴板（根据用户要求）
            if (this.config.get('extraction.copyToClipboard')) {
                this.logger.info('已禁用剪贴板复制功能');
            }
        }

        // 关闭当前页面
        _closeCurrentAndSearchPages() {
            const closeMode = this.config.get('extraction.closeMode');
            this.logger.info('开始关闭页面流程，模式:', closeMode);

            if (closeMode === 'none') {
                this.logger.info('关闭模式为none，跳过页面关闭');
                return;
            }

            // 检查是否是从搜索页面导航过来的
            const fromSearch = sessionStorage.getItem('sehuatang_from_search');
            if (fromSearch) {
                this.logger.info('检测到从搜索页面导航过来，准备关闭当前页面');
            } else {
                this.logger.info('直接访问的内容页面，准备关闭当前页面');
            }

            // 尝试关闭页面，失败时不做任何处理
            try {
                this.logger.info('执行页面关闭尝试');
                this._attemptToCloseTab();
            } catch (error) {
                this.logger.error('页面关闭流程出错:', error);
                // 出错时不做任何处理
            }
        }

        // 注意：复杂的多标签页关闭方法已被移除，现在使用更简单的方案：
        // 在搜索页面点击链接时立即关闭搜索页面，内容页面只需关闭自己

        // 尝试关闭标签页
        _attemptToCloseTab() {
            try {
                this.logger.info('尝试关闭当前标签页');

                // 方法1: 标准的 window.close()
                this.logger.debug('尝试方法1: window.close()');
                window.close();

                // 检查是否成功关闭
                setTimeout(() => {
                    if (!window.closed) {
                        this.logger.info('window.close() 无法关闭标签页（浏览器限制）');

                        // 方法2: 尝试强制关闭
                        this._tryForceClose();
                    } else {
                        this.logger.info('标签页关闭成功');
                    }
                }, 500);

            } catch (error) {
                this.logger.warn('关闭标签页失败:', error);
                this._tryForceClose();
            }
        }

        // 尝试强制关闭
        _tryForceClose() {
            this.logger.debug('尝试强制关闭方法');

            try {
                // 方法2: 尝试使用 opener 关闭
                if (window.opener) {
                    this.logger.debug('尝试方法2: 通过 opener 关闭');
                    window.opener = null;
                    window.close();

                    setTimeout(() => {
                        if (!window.closed) {
                            this.logger.info('通过 opener 关闭也失败了');
                            this._tryAlternativeCloseMethods();
                        } else {
                            this.logger.info('通过 opener 关闭成功');
                        }
                    }, 300);
                } else {
                    this.logger.debug('没有 opener，直接进入完成处理');
                    this._tryAlternativeCloseMethods();
                }
            } catch (error) {
                this.logger.warn('强制关闭失败:', error);
                this._tryAlternativeCloseMethods();
            }
        }

        // 尝试其他关闭方法
        _tryAlternativeCloseMethods() {
            this.logger.info('页面关闭失败，不进行任何处理');

            // 清除搜索标记
            const fromSearch = sessionStorage.getItem('sehuatang_from_search');
            if (fromSearch) {
                sessionStorage.removeItem('sehuatang_from_search');
            }

            // 关闭失败时不做任何处理，直接结束
        }

        // 显示任务完成状态
        _showTaskCompletedStatus() {
            this.logger.info('任务已完成，数据已成功保存到数据库');

            // 显示成功提示
            this._showSuccessIndicator();

            // 记录完成状态到控制台，方便查看
            console.log('✅ SeHuaTang Searcher: 任务完成');
            console.log('📊 数据已成功保存到数据库');
            console.log('🔒 页面保持打开状态（无法自动关闭）');
        }

        // 显示成功指示器
        _showSuccessIndicator() {
            try {
                // 创建一个简单的成功提示
                const indicator = document.createElement('div');
                indicator.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #4CAF50;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10001;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    animation: slideInRight 0.3s ease-out;
                `;
                indicator.textContent = '✅ 数据已成功保存到数据库';

                // 添加动画样式
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes slideInRight {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes slideOutRight {
                        from { transform: translateX(0); opacity: 1; }
                        to { transform: translateX(100%); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
                document.body.appendChild(indicator);

                // 5秒后自动消失
                setTimeout(() => {
                    indicator.style.animation = 'slideOutRight 0.3s ease-out';
                    setTimeout(() => {
                        if (indicator.parentNode) {
                            indicator.parentNode.removeChild(indicator);
                        }
                        if (style.parentNode) {
                            style.parentNode.removeChild(style);
                        }
                    }, 300);
                }, 5000);

            } catch (error) {
                this.logger.warn('显示成功指示器失败:', error);
            }
        }

        async _handleExtractionError() {
            // 更严格的页面卸载检测
            const isReallyUnloading = this.stateManager &&
                                     this.stateManager.isPageUnloading() &&
                                     (document.hidden || !document.hasFocus());

            if (isReallyUnloading) {
                this.logger.info('页面正在卸载，跳过错误处理');
                return;
            }

            // 检查是否已经完成过提取
            if (this.stateManager && this.stateManager.hasExtractionCompleted()) {
                this.logger.info('已完成过提取，跳过错误提示');
                return;
            }

            // 检查是否启用静默模式
            const silentMode = this.config.get('extraction.silentMode');
            if (silentMode) {
                this.logger.info('静默模式：跳过错误弹窗显示');

                // 🆕 静默模式下也要执行关闭页面逻辑
                const autoClose = this.config.get('extraction.autoCloseOnSuccess');
                if (autoClose) {
                    this.logger.info('静默模式下提取失败，但仍然关闭页面');
                    setTimeout(() => {
                        this._closeCurrentAndSearchPages();
                    }, 1000);
                }
                return;
            }

            // 如果页面可见且有焦点，说明是真正的提取失败
            const message = '未找到磁力链接\n\n提示: 请检查页面是否包含磁力链接，或手动查找下载按钮。';

            if (this.config.get('extraction.showAlert')) {
                // 延迟显示，确保页面稳定
                setTimeout(() => {
                    // 再次检查页面状态
                    const stillVisible = !document.hidden && document.hasFocus();
                    const notUnloading = !this.stateManager || !this.stateManager.isPageUnloading();

                    if (stillVisible && notUnloading) {
                        alert(message);
                    } else {
                        this.logger.info('页面状态已改变，跳过错误提示');
                    }
                }, 500);
            }

            this.logger.error('提取错误处理完成');
        }
    }

    /**
     * 年龄验证处理器
     * 负责处理网站的年龄验证
     */
    class AgeVerificationHandler {
        constructor(config, logger) {
            this.config = config;
            this.logger = logger;
        }

        async handleAgeVerification() {
            this.logger.debug('检查年龄验证');

            const enterButton = DOMUtils.querySelector(this.config.selectors.ageVerification);
            if (enterButton) {
                this.logger.info('发现年龄验证按钮，准备点击');

                // 添加延迟确保页面完全加载
                await DOMUtils.delay(this.config.get('page.ageVerificationDelay'));

                enterButton.click();
                this.logger.info('已点击年龄验证按钮');

                // 等待页面跳转
                await DOMUtils.delay(this.config.get('page.loadTimeout'));
            }
        }
    }

    /**
     * 执行状态管理器
     * 防止重复执行和状态冲突
     */
    class ExecutionStateManager {
        constructor() {
            this.state = {
                isRunning: false,
                lastExecutionTime: 0,
                executionCount: 0,
                currentPageUrl: '',
                lastAction: '',
                isPageUnloading: false,
                extractionCompleted: false,
                searchResultsProcessed: false,
                pageLoadTime: Date.now() // 添加页面加载时间
            };

            // 使用sessionStorage来跨页面保持状态
            this.storageKey = 'sehuatang_searcher_state';
            this.loadState();

            // 智能状态清理：检测页面刷新或新访问
            this._performSmartStateCleanup();

            // 监听页面卸载事件
            this.setupPageUnloadHandlers();
        }

        loadState() {
            try {
                const saved = sessionStorage.getItem(this.storageKey);
                if (saved) {
                    this.state = { ...this.state, ...JSON.parse(saved) };
                }
            } catch (error) {
                console.warn('Failed to load execution state:', error);
            }
        }

        saveState() {
            try {
                sessionStorage.setItem(this.storageKey, JSON.stringify(this.state));
            } catch (error) {
                console.warn('Failed to save execution state:', error);
            }
        }

        canExecute(action, cooldownMs = 5000) {
            const now = Date.now();
            const currentUrl = window.location.href;

            // 如果URL改变了，重置状态
            if (this.state.currentPageUrl !== currentUrl) {
                this.logger?.debug('URL changed, resetting state:', {
                    oldUrl: this.state.currentPageUrl,
                    newUrl: currentUrl
                });
                this.state.isRunning = false;
                this.state.currentPageUrl = currentUrl;
                this.state.lastAction = '';
                this.state.extractionCompleted = false;
                this.state.searchResultsProcessed = false; // 重置搜索结果处理状态
                this.saveState();
            }

            // 如果当前正在运行，不允许执行
            if (this.state.isRunning) {
                this.logger?.debug('Application is currently running, cannot execute');
                return false;
            }

            // 智能冷却期判断
            const timeSinceLastExecution = now - this.state.lastExecutionTime;
            let requiredCooldown = cooldownMs;

            // 检测是否为首页或搜索页面
            const isHomePage = this._isHomePage(currentUrl);
            const isSearchPage = this._isSearchPage(currentUrl);

            // 根据页面类型和动作类型智能调整冷却期
            if (action === 'start') {
                if (isHomePage || isSearchPage) {
                    // 首页和搜索页面的启动动作使用很短的冷却期
                    requiredCooldown = 1000; // 1秒

                    // 如果是首次访问或长时间未执行，直接允许
                    if (!this.state.lastExecutionTime || timeSinceLastExecution > 60000) {
                        this.logger?.debug('First visit or long time since last execution, allowing immediate execution');
                        return true;
                    }
                } else {
                    // 其他页面的启动动作使用较短的冷却期
                    requiredCooldown = 2000; // 2秒
                }
            } else if (this.state.lastAction === action) {
                // 相同动作的冷却期根据页面类型调整
                if (isHomePage || isSearchPage) {
                    requiredCooldown = 10000; // 首页重复操作10秒冷却
                } else {
                    requiredCooldown = 30000; // 其他页面重复操作30秒冷却
                }
            }

            // 检查是否在冷却期内
            if (timeSinceLastExecution < requiredCooldown) {
                this.logger?.debug('In cooldown period:', {
                    action,
                    timeSinceLastExecution,
                    requiredCooldown,
                    lastAction: this.state.lastAction,
                    isHomePage,
                    isSearchPage,
                    currentUrl
                });
                return false;
            }

            this.logger?.debug('Can execute:', {
                action,
                timeSinceLastExecution,
                requiredCooldown,
                isHomePage,
                isSearchPage
            });

            return true;
        }

        // 检测是否为首页
        _isHomePage(url) {
            return url.includes('sehuatang.org') && (
                url.endsWith('/') ||
                url.includes('index.php') ||
                url.split('/').length <= 4 ||
                url.match(/sehuatang\.org\/?$/)
            );
        }

        // 检测是否为搜索页面
        _isSearchPage(url) {
            return url.includes('search.php') || url.includes('/search');
        }

        startExecution(action) {
            this.state.isRunning = true;
            this.state.lastExecutionTime = Date.now();
            this.state.executionCount++;
            this.state.lastAction = action;
            this.saveState();
        }

        endExecution() {
            this.state.isRunning = false;
            this.saveState();
        }

        setupPageUnloadHandlers() {
            // 监听页面卸载事件（最可靠的检测）
            window.addEventListener('beforeunload', () => {
                this.state.isPageUnloading = true;
                this.saveState();
            });

            // 监听页面隐藏事件，但增加延迟避免误判
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    // 延迟设置，避免短暂的页面隐藏被误判
                    setTimeout(() => {
                        if (document.hidden) {
                            this.state.isPageUnloading = true;
                            this.saveState();
                        }
                    }, 2000); // 增加到2秒延迟
                }
            });

            // 移除blur事件监听，因为它太容易误判
            // 页面失去焦点不一定意味着要卸载
        }

        isPageUnloading() {
            return this.state.isPageUnloading;
        }

        markExtractionCompleted() {
            this.state.extractionCompleted = true;
            this.saveState();
        }

        hasExtractionCompleted() {
            return this.state.extractionCompleted;
        }

        markSearchResultsProcessed() {
            this.state.searchResultsProcessed = true;
            this.saveState();
        }

        hasSearchResultsProcessed() {
            return this.state.searchResultsProcessed;
        }

        // 智能状态清理
        _performSmartStateCleanup() {
            const currentUrl = window.location.href;
            const now = Date.now();

            // 检测页面刷新：如果页面加载时间很近，可能是刷新
            const timeSincePageLoad = now - (this.state.pageLoadTime || 0);
            const isPageRefresh = timeSincePageLoad < 5000; // 5秒内认为是刷新

            // 检测首页或搜索页面访问
            const isHomePage = this._isHomePage(currentUrl);
            const isSearchPage = this._isSearchPage(currentUrl);

            // 如果是首页/搜索页面的新访问或刷新，清理某些状态
            if ((isHomePage || isSearchPage) && (isPageRefresh || !this.state.lastExecutionTime)) {
                this.logger?.debug('检测到首页/搜索页面访问，执行智能状态清理');

                // 清理运行状态，但保留其他有用信息
                this.state.isRunning = false;
                this.state.isPageUnloading = false;

                // 如果是很久之前的执行记录，清理动作状态
                const timeSinceLastExecution = now - (this.state.lastExecutionTime || 0);
                if (timeSinceLastExecution > 300000) { // 5分钟
                    this.state.lastAction = '';
                    this.state.extractionCompleted = false;
                    this.state.searchResultsProcessed = false;
                }

                this.state.pageLoadTime = now;
                this.saveState();
            }
        }

        reset() {
            this.state = {
                isRunning: false,
                lastExecutionTime: 0,
                executionCount: 0,
                currentPageUrl: window.location.href,
                lastAction: '',
                isPageUnloading: false,
                extractionCompleted: false,
                searchResultsProcessed: false,
                pageLoadTime: Date.now()
            };
            this.saveState();
        }
    }

    /**
     * 主应用程序类
     * 负责协调所有组件的工作
     */
    class SeHuaTangSearcher {
        constructor() {
            this.config = new AppConfig();
            this.logger = new Logger('SeHuaTang Searcher Pro', this.config);
            this.stateManager = new ExecutionStateManager();

            // 为状态管理器设置logger引用
            this.stateManager.logger = this.logger;

            // 初始化各个处理器
            this.pageDetector = new PageDetector(this.config, this.logger);
            this.ageVerificationHandler = new AgeVerificationHandler(this.config, this.logger);
            this.searchHandler = new SearchHandler(this.config, this.logger);
            this.resultFilter = new ResultFilter(this.config, this.logger);
            this.magnetExtractor = new MagnetExtractor(this.config, this.logger, this.stateManager);

            this.logger.info('SeHuaTang Searcher Pro 初始化完成');

            // 如果启用了debug模式，显示提示
            if (this.config.get('debug.enabled')) {
                this.logger.info('Debug模式已启用 - 将显示详细调试信息');
            }
        }

        // 查看当前状态的便捷方法
        getStatus() {
            const now = Date.now();
            const state = this.stateManager.state;
            const currentUrl = window.location.href;
            const isHomePage = this.stateManager._isHomePage(currentUrl);
            const isSearchPage = this.stateManager._isSearchPage(currentUrl);

            const status = {
                当前时间: new Date(now).toLocaleString(),
                当前页面: currentUrl,
                页面类型: isHomePage ? '首页' : (isSearchPage ? '搜索页' : '其他页面'),
                运行状态: state.isRunning ? '运行中' : '空闲',
                上次执行时间: state.lastExecutionTime ? new Date(state.lastExecutionTime).toLocaleString() : '无',
                距离上次执行: state.lastExecutionTime ? Math.round((now - state.lastExecutionTime) / 1000) + '秒' : '无',
                上次动作: state.lastAction || '无',
                执行次数: state.executionCount,
                提取完成: state.extractionCompleted ? '是' : '否',
                搜索结果已处理: state.searchResultsProcessed ? '是' : '否',
                可以执行: this.stateManager.canExecute('start') ? '是' : '否'
            };

            console.table(status);
            return status;
        }

        // 启用debug模式的便捷方法
        enableDebug() {
            this.config.set('debug.enabled', true);
            this.logger.info('Debug模式已启用');
        }

        // 禁用debug模式的便捷方法
        disableDebug() {
            this.config.set('debug.enabled', false);
            this.logger.info('Debug模式已禁用');
        }

        // 计算剩余冷却时间
        _calculateRemainingCooldown(timeSinceLastExecution, isHomePage, isSearchPage) {
            const lastAction = this.stateManager.state.lastAction;
            let requiredCooldown;

            if (lastAction === 'start') {
                if (isHomePage || isSearchPage) {
                    requiredCooldown = 1000; // 1秒
                } else {
                    requiredCooldown = 2000; // 2秒
                }
            } else {
                if (isHomePage || isSearchPage) {
                    requiredCooldown = 10000; // 10秒
                } else {
                    requiredCooldown = 30000; // 30秒
                }
            }

            const remaining = Math.max(0, Math.ceil((requiredCooldown - timeSinceLastExecution) / 1000));
            return remaining;
        }

        async start() {
            try {
                this.logger.info('SeHuaTang Searcher Pro 启动');

                // 重置页面卸载状态和运行状态
                this.stateManager.state.isPageUnloading = false;
                this.stateManager.state.isRunning = false; // 确保运行状态被重置

                // 智能重置：如果当前页面是搜索结果页面，但状态显示已处理，可能是返回的情况
                const currentPageType = this.pageDetector.detectPageType();
                if (currentPageType === PageType.SEARCH_RESULTS &&
                    this.stateManager.hasSearchResultsProcessed()) {
                    const timeSinceLastExecution = Date.now() - this.stateManager.state.lastExecutionTime;
                    if (timeSinceLastExecution > 30000) { // 30秒后重置
                        this.logger.info('检测到返回搜索结果页面，重置处理状态');
                        this.stateManager.state.searchResultsProcessed = false;
                    }
                }

                this.stateManager.saveState();

                // 添加状态调试信息
                this.logger.debug('当前执行状态:', {
                    isRunning: this.stateManager.state.isRunning,
                    lastExecutionTime: this.stateManager.state.lastExecutionTime,
                    lastAction: this.stateManager.state.lastAction,
                    currentPageUrl: this.stateManager.state.currentPageUrl,
                    timeSinceLastExecution: Date.now() - this.stateManager.state.lastExecutionTime
                });

                // 检查是否可以执行
                if (!this.stateManager.canExecute('start')) {
                    // 获取详细信息用于调试
                    const timeSinceLastExecution = Date.now() - this.stateManager.state.lastExecutionTime;
                    const currentUrl = window.location.href;

                    // 使用新的智能页面检测方法
                    const isHomePage = this.stateManager._isHomePage(currentUrl);
                    const isSearchPage = this.stateManager._isSearchPage(currentUrl);

                    this.logger.info('执行检查详情:', {
                        currentUrl,
                        isHomePage,
                        isSearchPage,
                        timeSinceLastExecution: Math.round(timeSinceLastExecution / 1000) + '秒',
                        lastExecutionTime: this.stateManager.state.lastExecutionTime ?
                            new Date(this.stateManager.state.lastExecutionTime).toLocaleString() : '无',
                        isRunning: this.stateManager.state.isRunning,
                        lastAction: this.stateManager.state.lastAction
                    });

                    // 更智能的强制重置逻辑
                    let shouldReset = false;
                    let resetReason = '';

                    if (isHomePage || isSearchPage) {
                        // 首页和搜索页面：15秒后重置
                        if (timeSinceLastExecution > 15000) {
                            shouldReset = true;
                            resetReason = '首页/搜索页面长时间未执行';
                        }
                    } else {
                        // 其他页面：2分钟后重置
                        if (timeSinceLastExecution > 120000) {
                            shouldReset = true;
                            resetReason = '其他页面长时间未执行';
                        }
                    }

                    if (shouldReset) {
                        this.logger.info('智能重置状态:', {
                            reason: resetReason,
                            timeSinceLastExecution: Math.round(timeSinceLastExecution / 1000) + '秒'
                        });
                        this.stateManager.reset();

                        // 重置后再次检查
                        if (!this.stateManager.canExecute('start')) {
                            this.logger.warn('重置后仍无法执行，可能存在其他问题');
                            return;
                        }
                    } else {
                        // 提供更友好的跳过信息
                        const remainingCooldown = this._calculateRemainingCooldown(timeSinceLastExecution, isHomePage, isSearchPage);
                        this.logger.info(`应用程序在冷却期内，跳过执行 (剩余约${remainingCooldown}秒)`);
                        return;
                    }
                }

                this.stateManager.startExecution('start');

                // 处理年龄验证
                await this.ageVerificationHandler.handleAgeVerification();

                // 等待页面稳定
                await DOMUtils.delay(this.config.get('page.loadTimeout'));

                // 检测页面类型并执行相应操作
                await this._handlePageType();

                this.stateManager.endExecution();

            } catch (error) {
                this.logger.error('应用程序运行出错:', error);
                this.stateManager.endExecution();
            }
        }

        async _handlePageType() {
            const pageType = this.pageDetector.detectPageType();

            switch (pageType) {
                case PageType.SEARCH_HOME:
                    await this._handleSearchHomePage();
                    break;

                case PageType.SEARCH_RESULTS:
                    await this._handleSearchResultsPage();
                    break;

                case PageType.CONTENT:
                    await this._handleContentPage();
                    break;

                default:
                    await this._handleOtherPage();
                    break;
            }
        }

        async _handleSearchHomePage() {
            this.logger.info('处理搜索主页');

            if (this.config.get('search.autoExecute')) {
                const success = await this.searchHandler.executeSearch();
                if (success) {
                    // 搜索成功后，等待并处理搜索结果
                    await DOMUtils.delay(this.config.get('search.timeout'));
                    await this._handleSearchResultsPage();
                }
            }
        }

        async _handleSearchResultsPage() {
            this.logger.info('处理搜索结果页面');

            // 再次验证确实是搜索结果页面
            const pageType = this.pageDetector.detectPageType();
            if (pageType !== PageType.SEARCH_RESULTS) {
                this.logger.warn(`页面类型验证失败: 期望搜索结果页面，实际为 ${pageType}`);
                return;
            }

            // 检查是否已经处理过搜索结果（但要考虑时间因素）
            const timeSinceLastExecution = Date.now() - this.stateManager.state.lastExecutionTime;
            if (this.stateManager.hasSearchResultsProcessed() && timeSinceLastExecution < 60000) {
                this.logger.info('搜索结果最近已处理过，跳过重复执行');
                return;
            } else if (this.stateManager.hasSearchResultsProcessed() && timeSinceLastExecution >= 60000) {
                this.logger.info('搜索结果处理时间较久，重置状态并重新处理');
                this.stateManager.state.searchResultsProcessed = false;
                this.stateManager.saveState();
            }

            if (this.config.get('results.autoClick')) {
                const success = await this.resultFilter.filterAndSelectResult();
                if (success) {
                    // 标记搜索结果已处理
                    this.stateManager.markSearchResultsProcessed();

                    // 不在这里处理内容页面，让新页面自己处理
                    this.logger.info('已点击目标链接，等待新页面加载');
                } else {
                    // 搜索结果过滤失败：显示Apple风格弹窗
                    const filterKeywords = this.config.get('results.filterKeywords');
                    await DOMUtils.showAppleAlert(
                        '搜索结果过滤失败',
                        `未找到包含"${filterKeywords.join('" 或 "')}"的搜索结果，请尝试使用其他关键词搜索。`,
                        'error'
                    );
                }
            }
        }

        async _handleContentPage() {
            this.logger.info('处理内容页面');

            // 再次验证确实是内容页面
            const pageType = this.pageDetector.detectPageType();
            if (pageType !== PageType.CONTENT) {
                this.logger.warn(`页面类型验证失败: 期望内容页面，实际为 ${pageType}`);
                return;
            }

            // 检查是否已经提取过
            if (this.stateManager.hasExtractionCompleted()) {
                this.logger.info('已完成过提取，跳过重复执行');
                return;
            }

            if (this.config.get('extraction.autoExtract')) {
                await this.magnetExtractor.extractTitleAndMagnet();
            }
        }

        async _handleOtherPage() {
            this.logger.info('处理其他页面类型，执行搜索');

            if (this.config.get('search.autoExecute')) {
                await this.searchHandler.executeSearch();
            }
        }
    }

    /**
     * 应用程序启动器
     * 负责初始化和启动应用程序
     */
    class AppLauncher {
        static async launch() {
            try {
                // 创建应用程序实例
                const app = new SeHuaTangSearcher();

                // 将应用实例暴露到全局，便于调试
                window.SeHuaTangSearcherApp = app;

                // 等待页面完全加载
                if (document.readyState === 'loading') {
                    await new Promise(resolve => {
                        document.addEventListener('DOMContentLoaded', resolve);
                    });
                }

                // 启动应用程序
                await app.start();

            } catch (error) {
                console.error('[SeHuaTang Searcher Pro] 启动失败:', error);
            }
        }
    }

    // 启动应用程序
    AppLauncher.launch();

    // 暴露debug控制方法到全局
    window.SeHuaTangDebug = {
        enable: () => {
            if (window.SeHuaTangSearcherApp) {
                window.SeHuaTangSearcherApp.enableDebug();
            } else {
                console.log('应用程序尚未初始化');
            }
        },
        disable: () => {
            if (window.SeHuaTangSearcherApp) {
                window.SeHuaTangSearcherApp.disableDebug();
            } else {
                console.log('应用程序尚未初始化');
            }
        },
        status: () => {
            if (window.SeHuaTangSearcherApp) {
                const enabled = window.SeHuaTangSearcherApp.config.get('debug.enabled');
                console.log(`Debug模式: ${enabled ? '已启用' : '已禁用'}`);
                return enabled;
            } else {
                console.log('应用程序尚未初始化');
                return false;
            }
        }
    };

    // 暴露配置控制方法到全局
    window.SeHuaTangConfig = {
        setApiEndpoint: (endpoint) => {
            if (window.SeHuaTangSearcherApp) {
                window.SeHuaTangSearcherApp.config.set('api.endpoint', endpoint);
                console.log(`API端点已设置为: ${endpoint}`);
            } else {
                console.log('应用程序尚未初始化');
            }
        },
        getApiEndpoint: () => {
            if (window.SeHuaTangSearcherApp) {
                const endpoint = window.SeHuaTangSearcherApp.config.get('api.endpoint');
                console.log(`当前API端点: ${endpoint}`);
                return endpoint;
            } else {
                console.log('应用程序尚未初始化');
                return null;
            }
        },
        setSilentMode: (enabled) => {
            if (window.SeHuaTangSearcherApp) {
                window.SeHuaTangSearcherApp.config.set('extraction.silentMode', enabled);
                window.SeHuaTangSearcherApp.config.set('extraction.showAlert', !enabled);
                console.log(`静默模式: ${enabled ? '已启用' : '已禁用'}`);
            } else {
                console.log('应用程序尚未初始化');
            }
        },
        getSilentMode: () => {
            if (window.SeHuaTangSearcherApp) {
                const enabled = window.SeHuaTangSearcherApp.config.get('extraction.silentMode');
                console.log(`静默模式: ${enabled ? '已启用' : '已禁用'}`);
                return enabled;
            } else {
                console.log('应用程序尚未初始化');
                return null;
            }
        },
        showConfig: () => {
            if (window.SeHuaTangSearcherApp) {
                const config = {
                    apiEndpoint: window.SeHuaTangSearcherApp.config.get('api.endpoint'),
                    apiTimeout: window.SeHuaTangSearcherApp.config.get('api.timeout'),
                    apiRetryAttempts: window.SeHuaTangSearcherApp.config.get('api.retryAttempts'),
                    silentMode: window.SeHuaTangSearcherApp.config.get('extraction.silentMode'),
                    debugEnabled: window.SeHuaTangSearcherApp.config.get('debug.enabled')
                };
                console.log('当前配置:', config);
                return config;
            } else {
                console.log('应用程序尚未初始化');
                return null;
            }
        },
        testApi: async () => {
            if (window.SeHuaTangSearcherApp) {
                console.log('开始测试API连接...');
                const apiHandler = window.SeHuaTangSearcherApp.magnetExtractor.apiHandler;

                try {
                    const result = await apiHandler.submitData('TEST-001', '测试标题', 'magnet:?xt=urn:btih:test123456789');
                    console.log('API测试结果:', result ? '成功' : '失败');
                    return result;
                } catch (error) {
                    console.error('API测试失败:', error);
                    return false;
                }
            } else {
                console.log('应用程序尚未初始化');
                return false;
            }
        },
        getStatus: () => {
            if (window.SeHuaTangSearcherApp) {
                return window.SeHuaTangSearcherApp.getStatus();
            } else {
                console.log('应用程序尚未初始化');
                return null;
            }
        },
        setAutoClose: (enabled) => {
            if (window.SeHuaTangSearcherApp) {
                window.SeHuaTangSearcherApp.config.set('extraction.autoCloseOnSuccess', enabled);
                console.log(`成功后自动关闭页面: ${enabled ? '已启用' : '已禁用'}`);
            } else {
                console.log('应用程序尚未初始化');
            }
        },
        getAutoClose: () => {
            if (window.SeHuaTangSearcherApp) {
                const enabled = window.SeHuaTangSearcherApp.config.get('extraction.autoCloseOnSuccess');
                console.log(`成功后自动关闭页面: ${enabled ? '已启用' : '已禁用'}`);
                return enabled;
            } else {
                console.log('应用程序尚未初始化');
                return null;
            }
        },
        setCloseMode: (mode) => {
            if (window.SeHuaTangSearcherApp) {
                const validModes = ['smart', 'current', 'none'];
                if (validModes.includes(mode)) {
                    window.SeHuaTangSearcherApp.config.set('extraction.closeMode', mode);
                    const descriptions = {
                        'smart': '智能关闭（搜索页点击时关闭，内容页处理完关闭）',
                        'current': '仅关闭当前页面',
                        'none': '不自动关闭页面'
                    };
                    console.log(`页面关闭模式: ${descriptions[mode]}`);
                } else {
                    console.log(`无效的关闭模式。有效选项: ${validModes.join(', ')}`);
                }
            } else {
                console.log('应用程序尚未初始化');
            }
        },
        getCloseMode: () => {
            if (window.SeHuaTangSearcherApp) {
                const mode = window.SeHuaTangSearcherApp.config.get('extraction.closeMode');
                const descriptions = {
                    'smart': '智能关闭（搜索页点击时关闭，内容页处理完关闭）',
                    'current': '仅关闭当前页面',
                    'none': '不自动关闭页面'
                };
                console.log(`页面关闭模式: ${descriptions[mode] || mode}`);
                return mode;
            } else {
                console.log('应用程序尚未初始化');
                return null;
            }
        },
        setFallbackToHomepage: (enabled) => {
            if (window.SeHuaTangSearcherApp) {
                window.SeHuaTangSearcherApp.config.set('extraction.fallbackToHomepage', enabled);
                console.log(`无法关闭页面时跳转首页: ${enabled ? '已启用' : '已禁用'}`);
            } else {
                console.log('应用程序尚未初始化');
            }
        },
        getFallbackToHomepage: () => {
            if (window.SeHuaTangSearcherApp) {
                const enabled = window.SeHuaTangSearcherApp.config.get('extraction.fallbackToHomepage');
                console.log(`无法关闭页面时跳转首页: ${enabled ? '已启用' : '已禁用'}`);
                return enabled;
            } else {
                console.log('应用程序尚未初始化');
                return null;
            }
        },
        clearState: () => {
            if (window.SeHuaTangSearcherApp) {
                window.SeHuaTangSearcherApp.stateManager.reset();
                console.log('✅ 扩展状态已清除');
            } else {
                // 即使应用程序未初始化，也可以清除sessionStorage
                sessionStorage.removeItem('sehuatang_searcher_state');
                console.log('✅ 存储状态已清除');
            }
        },
        testPageClose: () => {
            if (window.SeHuaTangSearcherApp) {
                console.log('🧪 测试页面关闭功能...');
                const extractor = window.SeHuaTangSearcherApp.magnetExtractor;
                if (extractor) {
                    extractor._closeCurrentAndSearchPages();
                } else {
                    console.log('❌ 磁力链接提取器未初始化');
                }
            } else {
                console.log('❌ 应用程序尚未初始化');
            }
        },
        forceClose: () => {
            console.log('🚀 强制关闭页面...');
            try {
                // 尝试关闭页面
                window.close();

                setTimeout(() => {
                    if (!window.closed) {
                        console.log('❌ window.close() 失败，页面无法关闭（浏览器限制）');
                        console.log('✅ 任务已完成，页面保持打开状态');

                        // 清除搜索标记
                        sessionStorage.removeItem('sehuatang_from_search');

                        // 发送完成通知
                        const event = new CustomEvent('sehuatang_task_completed', {
                            detail: { message: '测试完成，页面无法关闭', success: false }
                        });
                        window.dispatchEvent(event);
                    } else {
                        console.log('✅ 页面关闭成功');
                    }
                }, 500);
            } catch (error) {
                console.error('强制关闭失败:', error);
            }
        }
    };

})();