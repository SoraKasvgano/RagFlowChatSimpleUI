// Sora产品助手JavaScript功能文件
// API 配置
const API_BASE_URL = 'http://localhost:8880';
const API_KEY = 'ragflow-key';

// 只加载本地marked.min.js文件
function loadMarkedLibrary() {
    return new Promise((resolve, reject) => {
        // 只加载本地文件
        const localScript = document.createElement('script');
        localScript.src = 'marked.min.js';
        localScript.onload = () => {
            console.log('✅ 本地marked.min.js加载成功');
            resolve();
        };
        localScript.onerror = () => {
            console.error('❌ 本地marked.min.js不存在，请确保文件存在');
            reject(new Error('本地marked.min.js文件不存在，无法加载marked库'));
        };
        document.head.appendChild(localScript);
    });
}

// Cookie操作函数
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

// 保存当前会话设置到cookie
function saveSessionSettings() {
    const settings = {
        sessionId: sessionId,
        datasetId: datasetSelect.value,
        assistantId: assistantSelect.value,
        showReferences: showReferencesCheckbox.checked,
        showKeywords: showKeywordsCheckbox.checked,
        timestamp: new Date().getTime()
    };
    setCookie('ragflow_session_settings', JSON.stringify(settings), 30);
    console.log('会话设置已保存到cookie');
}

// 从cookie加载会话设置
function loadSessionSettings() {
    const settingsCookie = getCookie('ragflow_session_settings');
    if (settingsCookie) {
        try {
            const settings = JSON.parse(settingsCookie);
            
            // 检查设置是否过期（超过7天）
            const now = new Date().getTime();
            const timeDiff = now - settings.timestamp;
            const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
            
            if (daysDiff > 7) {
                console.log('会话设置已过期，清除cookie');
                deleteCookie('ragflow_session_settings');
                return null;
            }
            
            return settings;
        } catch (error) {
            console.error('解析cookie设置失败:', error);
            deleteCookie('ragflow_session_settings');
            return null;
        }
    }
    return null;
}

// 更新显示当前会话信息
function updateSessionInfoDisplay() {
    const currentSessionInfo = document.getElementById('currentSessionInfo');
    const currentSessionIdSpan = document.getElementById('currentSessionId');
    
    if (sessionId) {
        currentSessionIdSpan.textContent = sessionId;
        currentSessionInfo.style.display = 'block';
    } else {
        currentSessionInfo.style.display = 'none';
    }
}

// 国际化文本
const i18n = {
    zh: {
        'knowledge-base-settings': '数据库设置',
        'select-knowledge-base': '选择数据库:',
        'loading': '加载中...',
        'refresh-knowledge-base': '刷新数据库',
        'assistant-settings': '助手设置',
        'select-assistant': '选择助手:',
        'refresh-assistant': '刷新助手',
        'display-options': '显示选项',
        'show-references': '显示参考资料',
        'show-keywords': '显示关键词分析',
        'session-management': '会话管理',
        'cleanup-idle-sessions': '清理闲置会话:',
        '30-minutes-ago': '30分钟前',
        '1-hour-ago': '1小时前',
        '3-hours-ago': '3小时前',
        '1-day-ago': '1天前',
        '3-days-ago': '3天前',
        '7-days-ago': '7天前',
        '14-days-ago': '14天前',
        '30-days-ago': '30天前',
        'cleanup-idle-sessions-btn': '清理闲置会话',
        'title': 'Sora产品助手',
        'welcome-message': '请选择一个数据库和助手开始对话。如果没有可用的助手，请联系管理员。',
        'input-placeholder': '输入您的消息...',
        'send': '发送',
        'no-available-datasets': '没有可用的数据库',
        'load-failed': '加载失败',
        'no-available-assistants': '没有可用的助手',
        'please-select-dataset': '请先选择一个数据库',
        'please-select-assistant': '请先选择一个助手',
        'searching': '搜索中，请稍候...',
        'no-reply': '没有收到回复内容',
        'error-occurred': '抱歉，发生了一个错误：',
        'reference-title': '参考资料:',
        'similarity': '相似度:',
        'unknown-document': '未知文档',
        'reference-image': '引用图片',
        'keyword-analysis': '关键词分析:',
        'please-select-assistant-first': '请先选择一个助手',
        'no-sessions-found': '没有找到会话',
        'no-idle-sessions': '没有找到闲置超过{time}的会话',
        'found-idle-sessions': '找到 {count} 个闲置会话，开始清理...',
        'successfully-deleted': '成功删除 {count} 个闲置会话',
        'delete-failed': '删除失败: {error}',
        'cleanup-complete': '清理完成！成功删除 {success} 个会话，失败 {error} 个会话',
        'cleanup-failed': '清理失败: {error}',
        'current-session-deleted': '当前会话已被清理，下次发送消息将创建新会话',
        'session-created': '已创建会话 ID: {id}',
        'please-select': '请选择一个{type}',
        'session-id-management': '会话ID管理',
        'enter-session-id': '输入会话ID:',
        'session-id-placeholder': '输入会话ID...',
        'load-session': '载入会话',
        'current-session-id': '当前会话ID:',
        'session-not-found': '找不到该会话ID，可能已被清理或不存在',
        'session-id-format-error': '会话ID格式错误，请检查输入',
        'session-loading': '正在载入会话历史...',
        'session-loaded': '已载入会话历史',
        'no-history-messages': '该会话没有历史消息，但可以继续对话',
        'invalid-session-id': '请输入有效的会话ID',
        'select-assistant-first': '请先选择一个助手',
        'assistant-welcome': '你好！ 我是你的助理，有什么可以帮到你的吗？',
        'http-error': 'HTTP错误! 状态码: {status}',
        'session-load-failed': '载入会话失败: {error}',
        'enter-valid-session-id': '请输入有效的会话ID',
        'session-id-invalid': '会话ID格式错误',
        'session-history-loaded': '已载入会话历史',
        'auto-loading-session': '正在自动载入上次的会话历史...',
        'auto-load-failed': '自动载入会话历史失败，但可以继续对话'
    },
    en: {
        'knowledge-base-settings': 'Knowledge Base Settings',
        'select-knowledge-base': 'Select Knowledge Base:',
        'loading': 'Loading...',
        'refresh-knowledge-base': 'Refresh Knowledge Base',
        'assistant-settings': 'Assistant Settings',
        'select-assistant': 'Select Assistant:',
        'refresh-assistant': 'Refresh Assistant',
        'display-options': 'Display Options',
        'show-references': 'Show References',
        'show-keywords': 'Show Keyword Analysis',
        'session-management': 'Session Management',
        'cleanup-idle-sessions': 'Cleanup Idle Sessions:',
        '30-minutes-ago': '30 minutes ago',
        '1-hour-ago': '1 hour ago',
        '3-hours-ago': '3 hours ago',
        '1-day-ago': '1 day ago',
        '3-days-ago': '3 days ago',
        '7-days-ago': '7 days ago',
        '14-days-ago': '14 days ago',
        '30-days-ago': '30 days ago',
        'cleanup-idle-sessions-btn': 'Cleanup Idle Sessions',
        'title': 'Sora Assistant',
        'welcome-message': 'Please select a knowledge base and assistant to start chatting. If no assistants are available, please contact your administrator.',
        'input-placeholder': 'Enter your message...',
        'send': 'Send',
        'no-available-datasets': 'No available knowledge bases',
        'load-failed': 'Load failed',
        'no-available-assistants': 'No available assistants',
        'please-select-dataset': 'Please select a knowledge base first',
        'please-select-assistant': 'Please select an assistant first',
        'searching': 'Searching, please wait...',
        'no-reply': 'No reply received',
        'error-occurred': 'Sorry, an error occurred: ',
        'reference-title': 'References:',
        'similarity': 'Similarity:',
        'unknown-document': 'Unknown document',
        'reference-image': 'Reference image',
        'keyword-analysis': 'Keyword Analysis:',
        'please-select-assistant-first': 'Please select an assistant first',
        'no-sessions-found': 'No sessions found',
        'no-idle-sessions': 'No idle sessions found older than {time}',
        'found-idle-sessions': 'Found {count} idle sessions, starting cleanup...',
        'successfully-deleted': 'Successfully deleted {count} idle sessions',
        'delete-failed': 'Delete failed: {error}',
        'cleanup-complete': 'Cleanup complete! Successfully deleted {success} sessions, failed {error} sessions',
        'cleanup-failed': 'Cleanup failed: {error}',
        'current-session-deleted': 'Current session has been deleted, a new session will be created on next message',
        'session-created': 'Session created with ID: {id}',
        'please-select': 'Please select a {type}',
        'session-id-management': 'Session ID Management',
        'enter-session-id': 'Enter Session ID:',
        'session-id-placeholder': 'Enter session ID...',
        'load-session': 'Load Session',
        'current-session-id': 'Current Session ID:',
        'session-not-found': 'Session ID not found, may have been cleaned up or does not exist',
        'session-id-format-error': 'Session ID format error, please check your input',
        'session-loading': 'Loading session history...',
        'session-loaded': 'Session history loaded',
        'no-history-messages': 'No history messages in this session, but you can continue the conversation',
        'invalid-session-id': 'Please enter a valid session ID',
        'select-assistant-first': 'Please select an assistant first',
        'assistant-welcome': 'Hello! I am your assistant, how can I help you today?',
        'http-error': 'HTTP error! status: {status}',
        'session-load-failed': 'Session load failed: {error}',
        'enter-valid-session-id': 'Please enter a valid session ID',
        'session-id-invalid': 'Session ID format error',
        'session-history-loaded': 'Session history loaded',
        'auto-loading-session': 'Automatically loading previous session history...',
        'auto-load-failed': 'Auto-load session history failed, but you can continue the conversation'
    }
};


// DOM 元素
const chatArea = document.getElementById('chatArea');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const datasetSelect = document.getElementById('datasetSelect');
const assistantSelect = document.getElementById('assistantSelect');
const refreshDatasetsBtn = document.getElementById('refreshDatasets');
const refreshAssistantsBtn = document.getElementById('refreshAssistants');
const showReferencesCheckbox = document.getElementById('showReferences');
const showKeywordsCheckbox = document.getElementById('showKeywords');
const idleTimeSelect = document.getElementById('idleTimeSelect');
const cleanupSessionsBtn = document.getElementById('cleanupSessions');
const languageSelect = document.getElementById('languageSelect');

// 聊天状态
let chatId = null;
let sessionId = null;
let currentLanguage = 'zh';

// 检测浏览器语言并自动设置
function detectLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('en')) {
        return 'en';
    } else if (browserLang.startsWith('zh')) {
        return 'zh';
    }
    return 'zh'; // 默认中文
}

// 切换语言
function switchLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    
    // 更新所有带有 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (i18n[lang][key]) {
            element.textContent = i18n[lang][key];
        }
    });
    
    // 更新带有 data-i18n-placeholder 属性的输入框
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (i18n[lang][key]) {
            element.placeholder = i18n[lang][key];
        }
    });
    
    // 更新语言选择器
    languageSelect.value = lang;
}

// 获取国际化文本
function t(key, params = {}) {
    let text = i18n[currentLanguage][key] || key;
    
    // 替换参数
    Object.keys(params).forEach(param => {
        text = text.replace(new RegExp(`{${param}}`, 'g'), params[param]);
    });
    
    return text;
}

// 页面加载完成后初始化
window.addEventListener('load', async () => {
    // 自动检测并设置语言
    const detectedLang = detectLanguage();
    switchLanguage(detectedLang);
    
    await loadDatasets();
    await loadAssistants();
    userInput.focus();
    
    // 默认不显示参考资料和关键词分析
    showReferencesCheckbox.checked = false;
    showKeywordsCheckbox.checked = false;
});

// 语言切换事件
languageSelect.addEventListener('change', (e) => {
    switchLanguage(e.target.value);
});

// 清理闲置会话 - 修正版本
async function cleanupIdleSessions() {
    const idleMinutes = parseInt(idleTimeSelect.value);
    const chatId = assistantSelect.value; // 注意：这里应该是chatId而不是assistantId
    
    if (!chatId) {
        addMessageToChat(t('please-select-assistant-first'), 'error');
        return;
    }

    // 禁用清理按钮
    cleanupSessionsBtn.disabled = true;
    cleanupSessionsBtn.textContent = t('cleanup-idle-sessions-btn') + '...';

    try {
        // 获取所有会话
        const sessions = await getSessions(chatId);
        
        console.log('=== 会话清理调试信息 ===');
        console.log('助手ID:', chatId);
        console.log('闲置时间（分钟）:', idleMinutes);
        console.log('获取到的会话数量:', sessions ? sessions.length : 0);
        console.log('会话数据结构示例:', sessions && sessions.length > 0 ? sessions[0] : '无会话');
        
        if (!sessions || sessions.length === 0) {
            addMessageToChat(t('no-sessions-found'), 'info');
            return;
        }

        addCleanupResult(`找到 ${sessions.length} 个会话，正在分析闲置状态...`, 'info');
        
        // 计算时间阈值
        const now = Date.now();
        const thresholdTimeMs = now - (idleMinutes * 60 * 1000);
        
        console.log('当前时间:', new Date(now));
        console.log('时间阈值（毫秒）:', thresholdTimeMs, new Date(thresholdTimeMs));

        // 筛选闲置会话 - 根据API文档中的字段
        const idleSessions = sessions.filter(session => {
            // 根据API文档，会话对象包含 create_time 和 update_time 字段
            const sessionTime = session.update_time || session.create_time;
            
            if (!sessionTime) {
                console.log(`会话 ${session.id}: 没有找到时间字段`, session);
                return false;
            }
            
            // 转换为数字
            let timeValue = parseInt(sessionTime);
            if (isNaN(timeValue) || timeValue <= 0) {
                console.log(`会话 ${session.id}: 无效的时间值 ${sessionTime}`);
                return false;
            }
            
            // 判断时间戳格式并比较
            // 根据API文档，时间戳是毫秒格式
            let isIdle = false;
            if (timeValue > 1000000000000) {
                // 毫秒格式
                isIdle = timeValue < thresholdTimeMs;
                console.log(`会话 ${session.id}: 时间 ${timeValue} (${new Date(timeValue)}), 闲置: ${isIdle}`);
            } else {
                // 如果是秒格式，转换为毫秒
                timeValue *= 1000;
                isIdle = timeValue < thresholdTimeMs;
                console.log(`会话 ${session.id}: 时间(秒转毫秒) ${timeValue} (${new Date(timeValue)}), 闲置: ${isIdle}`);
            }
            
            return isIdle;
        });

        console.log('筛选出的闲置会话数量:', idleSessions.length);
        console.log('闲置会话详情:', idleSessions);

        if (idleSessions.length === 0) {
            let timeText = '';
            if (idleMinutes < 60) {
                timeText = `${idleMinutes}分钟前`;
            } else if (idleMinutes < 1440) {
                timeText = `${Math.floor(idleMinutes / 60)}小时前`;
            } else {
                timeText = `${Math.floor(idleMinutes / 1440)}天前`;
            }
            
            addMessageToChat(`没有找到${timeText}的闲置会话`, 'info');
            return;
        }

        addCleanupResult(`找到 ${idleSessions.length} 个闲置会话，开始清理...`, 'info');

        // 分批删除，每批20个避免过大请求
        const batchSize = 20;
        let deletedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < idleSessions.length; i += batchSize) {
            const batch = idleSessions.slice(i, i + batchSize);
            const sessionIds = batch.map(s => s.id);
            
            console.log(`正在删除批次 ${Math.floor(i/batchSize) + 1}:`, sessionIds);
            
            try {
                const result = await deleteSessions(chatId, sessionIds);
                
                if (result && (result.code === 0 || result.code === undefined)) {
                    deletedCount += sessionIds.length;
                    addCleanupResult(`成功删除 ${sessionIds.length} 个会话`, 'success');
                    console.log(`批次 ${Math.floor(i/batchSize) + 1} 删除成功`);
                } else {
                    errorCount += sessionIds.length;
                    const errorMsg = result ? result.message : '未知错误';
                    addCleanupResult(`删除失败: ${errorMsg}`, 'error');
                    console.log(`批次 ${Math.floor(i/batchSize) + 1} 删除失败:`, errorMsg);
                }
            } catch (error) {
                errorCount += sessionIds.length;
                addCleanupResult(`删除异常: ${error.message}`, 'error');
                console.log(`批次 ${Math.floor(i/batchSize) + 1} 删除异常:`, error);
            }
            
            // 添加延迟避免请求过快
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        // 显示最终结果
        const finalMessage = `清理完成：成功删除 ${deletedCount} 个会话，失败 ${errorCount} 个`;
        addCleanupResult(finalMessage, errorCount === 0 ? 'success' : 'warning');
        console.log('清理完成:', finalMessage);

    } catch (error) {
        console.error('清理会话失败:', error);
        addCleanupResult(`清理失败: ${error.message}`, 'error');
    } finally {
        // 重新启用清理按钮
        cleanupSessionsBtn.disabled = false;
        cleanupSessionsBtn.textContent = t('cleanup-idle-sessions-btn');
    }
}

// 获取会话列表 - 修正版本
async function getSessions(chatId, page = 1, pageSize = 100) {
    try {
        const url = `${API_BASE_URL}/api/v1/chats/${chatId}/sessions?page=${page}&page_size=${pageSize}&orderby=create_time&desc=true`;
        console.log('正在获取会话列表，URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('获取会话列表失败:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('API 响应数据:', data);
        
        // 检查API返回的业务状态码
        if (data && data.code !== 0 && data.code !== undefined) {
            throw new Error(`API 错误: ${data.message || '未知错误'}`);
        }
        
        // 检查数据结构
        let sessions = [];
        if (data && data.data && Array.isArray(data.data)) {
            sessions = data.data;
        } else if (data && Array.isArray(data)) {
            sessions = data;
        }
        
        console.log('解析出的会话列表:', sessions);
        return sessions;
    } catch (error) {
        console.error('获取会话列表失败:', error);
        throw error;
    }
}

// 删除会话 - 改进版本
async function deleteSessions(chatId, sessionIds) {
    try {
        const url = `${API_BASE_URL}/api/v1/chats/${chatId}/sessions`;
        console.log('正在删除会话，URL:', url);
        console.log('要删除的会话ID:', sessionIds);
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                ids: sessionIds
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('删除请求失败:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        console.log('删除响应:', result);
        
        // 检查API返回的业务状态码
        if (result && result.code !== 0 && result.code !== undefined) {
            throw new Error(`API 错误: ${result.message || '未知错误'}`);
        }
        
        return result;
    } catch (error) {
        console.error('删除会话失败:', error);
        throw error;
    }
}

// 添加清理结果信息
function addCleanupResult(message, type = 'info') {
    const resultElement = document.createElement('div');
    resultElement.classList.add('cleanup-result');
    resultElement.classList.add(`cleanup-${type}`);
    resultElement.textContent = message;
    chatArea.appendChild(resultElement);
    
    // 滚动到底部
    chatArea.scrollTop = chatArea.scrollHeight;
    
    // 5秒后自动移除成功和信息的消息
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            if (chatArea.contains(resultElement)) {
                chatArea.removeChild(resultElement);
            }
        }, 5000);
    }
}

// 加载数据集列表
async function loadDatasets() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/datasets`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Datasets:', data);
        
        // 清空选择框
        datasetSelect.innerHTML = '';
        
        if (data.data && data.data.length > 0) {
            // 添加默认选项
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = t('please-select', {type: t('select-knowledge-base').replace(':', '')});
            datasetSelect.appendChild(defaultOption);
            
            // 添加数据集选项
            data.data.forEach(dataset => {
                const option = document.createElement('option');
                option.value = dataset.id;
                option.textContent = dataset.name;
                datasetSelect.appendChild(option);
            });
            
            // 启用选择框
            datasetSelect.disabled = false;
            
            // 尝试自动选择之前保存的数据集
            const savedSettings = loadSessionSettings();
            if (savedSettings && savedSettings.datasetId) {
                setTimeout(() => {
                    datasetSelect.value = savedSettings.datasetId;
                    console.log('自动选择数据集:', savedSettings.datasetId);
                }, 100);
            }
        } else {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = t('no-available-datasets');
            datasetSelect.appendChild(option);
            datasetSelect.disabled = true;
        }
    } catch (error) {
        console.error('Failed to load datasets:', error);
        datasetSelect.innerHTML = `<option value="">${t('load-failed')}</option>`;
        datasetSelect.disabled = true;
    }
}

// 加载助手列表
async function loadAssistants() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/chats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Chats:', data);
        
        // 清空选择框
        assistantSelect.innerHTML = '';
        
        if (data.data && data.data.length > 0) {
            // 添加默认选项
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = t('please-select', {type: t('select-assistant').replace(':', '')});
            assistantSelect.appendChild(defaultOption);
            
            // 添加助手选项
            data.data.forEach(assistant => {
                const option = document.createElement('option');
                option.value = assistant.id;
                option.textContent = assistant.name;
                assistantSelect.appendChild(option);
            });
            
            // 启用输入和发送按钮
            userInput.disabled = false;
            sendButton.disabled = false;
            
            // 尝试自动选择之前保存的助手
            const savedSettings = loadSessionSettings();
            if (savedSettings && savedSettings.assistantId) {
                setTimeout(() => {
                    assistantSelect.value = savedSettings.assistantId;
                    console.log('自动选择助手:', savedSettings.assistantId);
                }, 100);
            }
        } else {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = t('no-available-assistants');
            assistantSelect.appendChild(option);
            assistantSelect.disabled = true;
            userInput.disabled = true;
            sendButton.disabled = true;
        }
    } catch (error) {
        console.error('Failed to load assistants:', error);
        assistantSelect.innerHTML = `<option value="">${t('load-failed')}</option>`;
        assistantSelect.disabled = true;
        userInput.disabled = true;
        sendButton.disabled = true;
    }
}

// 创建会话
async function createSession() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/chats/${chatId}/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                name: 'Web Session'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Session creation response:', data);
        
        if (data.data && data.data.id) {
            sessionId = data.data.id;
            console.log('Created session with ID:', sessionId);
            
            // 显示会话信息
            addSessionInfo(t('session-created', {id: sessionId}));
        } else {
            throw new Error('Failed to create session: ' + JSON.stringify(data));
        }
    } catch (error) {
        console.error('Failed to create session:', error);
        throw error;
    }
}

// 显示会话信息
function addSessionInfo(message) {
    const infoElement = document.createElement('div');
    infoElement.classList.add('session-info');
    infoElement.textContent = message;
    chatArea.appendChild(infoElement);
    
    // 滚动到底部
    chatArea.scrollTop = chatArea.scrollHeight;
}

// 获取会话历史
async function getSessionHistory(chatId, sessionId) {
    try {
        console.log('获取会话历史:', {chatId, sessionId});
        
        const response = await fetch(`${API_BASE_URL}/api/v1/chats/${chatId}/sessions?id=${sessionId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(t('session-not-found'));
            } else if (response.status === 400) {
                throw new Error(t('session-id-invalid'));
            } else {
                throw new Error(t('http-error', {status: response.status}));
            }
        }

        const data = await response.json();
        console.log('会话历史响应:', data);
        
        if (data.code === 0 && data.data && data.data.length > 0) {
            const sessionData = data.data[0];
            console.log('找到会话数据:', sessionData);
            
            // 检查是否有消息历史
            if (sessionData.messages && sessionData.messages.length > 0) {
                return sessionData.messages;
            } else {
                return [];
            }
        } else {
            return [];
        }
    } catch (error) {
        console.error('获取会话历史失败:', error);
        throw error;
    }
}

// 显示会话历史
function displaySessionHistory(messages) {
    // 清空聊天区域
    chatArea.innerHTML = '';
    
    if (messages.length === 0) {
        addMessageToChat(t('no-history-messages'), 'info');
        return;
    }
    
    // 按时间顺序显示消息
    messages.forEach(message => {
        if (message.role === 'user') {
            addMessageToChat(message.content, 'user');
        } else if (message.role === 'assistant') {
            addMessageToChat(message.content, 'assistant');
            
            // 显示参考资料
            if (message.references && message.references.length > 0 && showReferencesCheckbox.checked) {
                addReferenceToChat(message.references);
            }
            
            // 显示关键词分析
            if (message.keyword_analysis && showKeywordsCheckbox.checked) {
                addKeywordAnalysis(message.keyword_analysis);
            }
        }
    });
    
    // 滚动到底部
    chatArea.scrollTop = chatArea.scrollHeight;
}

// 加载会话
async function loadSessionById() {
    const sessionIdInput = document.getElementById('sessionIdInput');
    const sessionIdToLoad = sessionIdInput.value.trim();
    
    if (!sessionIdToLoad) {
        addMessageToChat(t('invalid-session-id'), 'error');
        return;
    }
    
    // 检查是否选择了助手，如果没有选择则提示
    if (!assistantSelect.value) {
        addMessageToChat(t('please-select-assistant'), 'error');
        return;
    }
    
    // 设置chatId为选择的助手ID
    chatId = assistantSelect.value;
    
    // 显示加载状态
    addMessageToChat(t('session-loading'), 'info');
    
    try {
        const messages = await getSessionHistory(chatId, sessionIdToLoad);
        
        // 设置当前会话ID
        sessionId = sessionIdToLoad;
        updateSessionInfoDisplay();
        
        // 显示历史消息
        displaySessionHistory(messages);
        
        // 保存设置
        saveSessionSettings();
        
        addMessageToChat(t('session-loaded'), 'success');
        
    } catch (error) {
        console.error('载入会话失败:', error);
        addMessageToChat(t('session-load-failed', {error: error.message}), 'error');
    }
}

// 发送消息
async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;
    
    if (!datasetSelect.value) {
        addMessageToChat(t('please-select-dataset'), 'error');
        return;
    }
    
    if (!assistantSelect.value) {
        addMessageToChat(t('please-select-assistant'), 'error');
        return;
    }
    
    // 设置chatId
    chatId = assistantSelect.value;
    
    // 添加用户消息到聊天区域
    addMessageToChat(message, 'user');
    
    // 清空输入框
    userInput.value = '';
    
    // 添加加载指示器
    const loadingId = addLoadingIndicator();
    
    try {
        // 如果没有会话ID，创建新会话
        if (!sessionId) {
            await createSession();
        }
        
        // 调用RAGFlow API
        const response = await fetchRAGFlowAPI(message);
        
        // 移除加载指示器
        removeLoadingIndicator(loadingId);
        
        // 添加助手回复
        if (response && response.reply) {
            addMessageToChat(response.reply, 'assistant');
            
            // 显示参考资料
            if (response.references && response.references.length > 0 && showReferencesCheckbox.checked) {
                addReferenceToChat(response.references);
            }
            
            // 显示关键词分析
            if (response.keyword_analysis && showKeywordsCheckbox.checked) {
                addKeywordAnalysis(response.keyword_analysis);
            }
        } else {
            addMessageToChat(t('no-reply'), 'error');
        }
        
        // 保存会话设置
        saveSessionSettings();
        
    } catch (error) {
        // 移除加载指示器
        removeLoadingIndicator(loadingId);
        
        console.error('发送消息失败:', error);
        addMessageToChat(t('error-occurred') + error.message, 'error');
    }
}

// 调用RAGFlow API
async function fetchRAGFlowAPI(message) {
    const response = await fetch(`${API_BASE_URL}/api/v1/chats/${chatId}/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            session_id: sessionId,
            question: message,
            knowledge_base_id: datasetSelect.value,
            stream: false
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    if (data.code === 0 && data.data) {
        // 根据API文档，响应中的字段是answer而不是reply
        return {
            reply: data.data.answer || '',
            references: data.data.reference?.chunks || [],
            keyword_analysis: data.data.keyword_analysis || ''
        };
    } else {
        throw new Error(data.message || 'API returned error');
    }
}

// 添加消息到聊天区域
function addMessageToChat(content, type) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type + '-message');
    
    const contentElement = document.createElement('div');
    contentElement.classList.add('message-content');
    
    // 使用marked库渲染Markdown
    if (typeof marked !== 'undefined') {
        contentElement.innerHTML = marked.parse(content);
    } else {
        contentElement.textContent = content;
    }
    
    messageElement.appendChild(contentElement);
    chatArea.appendChild(messageElement);
    
    // 滚动到底部
    chatArea.scrollTop = chatArea.scrollHeight;
}

// 添加参考资料到聊天区域
function addReferenceToChat(references) {
    const referenceElement = document.createElement('div');
    referenceElement.classList.add('reference');
    
    const titleElement = document.createElement('div');
    titleElement.classList.add('reference-title');
    titleElement.textContent = t('reference-title');
    referenceElement.appendChild(titleElement);
    
    references.forEach(ref => {
        const refItem = document.createElement('div');
        refItem.classList.add('reference-item');
        
        const similarityElement = document.createElement('span');
        similarityElement.classList.add('similarity');
        similarityElement.textContent = `${t('similarity')} ${(ref.score * 100).toFixed(1)}%`;
        refItem.appendChild(similarityElement);
        
        const contentElement = document.createElement('div');
        contentElement.classList.add('reference-content');
        
        // 处理不同类型的引用内容
        if (ref.content_type === 'image') {
            const imgElement = document.createElement('img');
            imgElement.src = ref.content;
            imgElement.alt = t('reference-image');
            imgElement.classList.add('reference-image');
            contentElement.appendChild(imgElement);
        } else {
            contentElement.textContent = ref.content || t('unknown-document');
        }
        
        refItem.appendChild(contentElement);
        referenceElement.appendChild(refItem);
    });
    
    chatArea.appendChild(referenceElement);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// 添加关键词分析到聊天区域
function addKeywordAnalysis(keywordAnalysis) {
    const analysisElement = document.createElement('div');
    analysisElement.classList.add('keyword-analysis');
    
    const titleElement = document.createElement('div');
    titleElement.classList.add('keyword-analysis-title');
    titleElement.textContent = t('keyword-analysis');
    analysisElement.appendChild(titleElement);
    
    const contentElement = document.createElement('div');
    contentElement.classList.add('keyword-analysis-content');
    contentElement.textContent = keywordAnalysis;
    analysisElement.appendChild(contentElement);
    
    chatArea.appendChild(analysisElement);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// 添加加载指示器
function addLoadingIndicator() {
    const loadingElement = document.createElement('div');
    loadingElement.classList.add('message', 'assistant-message', 'loading');
    loadingElement.id = 'loading-indicator';
    
    const contentElement = document.createElement('div');
    contentElement.classList.add('message-content');
    contentElement.textContent = t('searching');
    
    loadingElement.appendChild(contentElement);
    chatArea.appendChild(loadingElement);
    
    // 滚动到底部
    chatArea.scrollTop = chatArea.scrollHeight;
    
    return 'loading-indicator';
}

// 移除加载指示器
function removeLoadingIndicator(id) {
    const loadingElement = document.getElementById(id);
    if (loadingElement) {
        chatArea.removeChild(loadingElement);
    }
}

// 事件监听器
window.addEventListener('DOMContentLoaded', () => {
    // 自动恢复会话设置
    const savedSettings = loadSessionSettings();
    if (savedSettings) {
        console.log('恢复会话设置:', savedSettings);
        
        // 设置会话ID
        sessionId = savedSettings.sessionId;
        updateSessionInfoDisplay();
        
        // 设置显示选项
        showReferencesCheckbox.checked = savedSettings.showReferences;
        showKeywordsCheckbox.checked = savedSettings.showKeywords;
        
        // 如果会话ID存在，自动加载历史消息
        if (sessionId && chatId) {
            setTimeout(async () => {
                try {
                    addMessageToChat(t('auto-loading-session'), 'info');
                    const messages = await getSessionHistory(chatId, sessionId);
                    displaySessionHistory(messages);
                    addMessageToChat(t('session-history-loaded'), 'success');
                } catch (error) {
                    console.error('自动加载会话历史失败:', error);
                    addMessageToChat(t('auto-load-failed'), 'warning');
                }
            }, 1000);
        }
    }
    
    // 数据集选择变更
    datasetSelect.addEventListener('change', () => {
        saveSessionSettings();
    });
    
    // 助手选择变更
    assistantSelect.addEventListener('change', () => {
        chatId = assistantSelect.value;
        saveSessionSettings();
    });
    
    // 显示选项变更
    showReferencesCheckbox.addEventListener('change', saveSessionSettings);
    showKeywordsCheckbox.addEventListener('change', saveSessionSettings);
    
    // 刷新数据集
    refreshDatasetsBtn.addEventListener('click', loadDatasets);
    
    // 刷新助手
    refreshAssistantsBtn.addEventListener('click', loadAssistants);
    
    // 清理闲置会话
    cleanupSessionsBtn.addEventListener('click', cleanupIdleSessions);
    
    // 发送消息
    sendButton.addEventListener('click', sendMessage);
    
    // 回车发送消息
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // 载入会话
    document.getElementById('loadSessionBtn').addEventListener('click', loadSessionById);
    
    // 会话ID输入框回车事件
    document.getElementById('sessionIdInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadSessionById();
        }
    });
});

// 页面加载完成后加载marked库
loadMarkedLibrary().then(() => {
    console.log('Marked library loaded successfully');
}).catch(error => {
    console.error('Failed to load marked library:', error);
});