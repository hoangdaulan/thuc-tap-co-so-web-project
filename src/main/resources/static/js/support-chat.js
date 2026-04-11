(function () {
    const token = () => localStorage.getItem('jwtToken');
    const currentUser = () => JSON.parse(localStorage.getItem('currentuser') || 'null');
    let messages = [];
    let eventSource = null;

    function formatTime(value) {
        return new Date(value).toLocaleString('vi-VN');
    }

    function bindEnterToSend(textarea, form) {
        if (!textarea || !form) return;

        textarea.addEventListener('keydown', event => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                form.requestSubmit();
            }
        });
    }

    function buildWidget() {
        if (document.querySelector('.support-chat-widget')) return;

        const widget = document.createElement('div');
        widget.className = 'support-chat-widget';
        widget.innerHTML = `
            <button class="support-chat-toggle">Hỗ trợ tư vấn trực tuyến</button>
            <div class="support-chat-panel">
                <div class="support-chat-header">
                    <h3>Chat với nhân viên</h3>
                    <p>Đăng nhập để nhắn tin và nhận tư vấn món ăn ngay.</p>
                </div>
                <div class="support-chat-messages"></div>
                <form class="support-chat-form">
                    <textarea rows="3" placeholder="Nhập câu hỏi của bạn..."></textarea>
                    <button type="submit">Gửi cho nhân viên</button>
                </form>
            </div>
        `;
        document.body.appendChild(widget);

        const toggle = widget.querySelector('.support-chat-toggle');
        const panel = widget.querySelector('.support-chat-panel');
        toggle.addEventListener('click', () => {
            panel.classList.toggle('open');
            if (panel.classList.contains('open')) {
                initializeChat();
            }
        });

        const form = widget.querySelector('.support-chat-form');
        const textarea = form.querySelector('textarea');
        form.addEventListener('submit', submitMessage);
        bindEnterToSend(textarea, form);
    }

    function ensureEmployeeEntryPoint() {
        const user = currentUser();
        if (!user || user.userType <= 0) return;

        const menu = document.querySelector('.header-middle-right-menu');
        if (!menu || menu.querySelector('[data-employee-entry="true"]') || menu.querySelector('a[href="./admin.html"]')) return;

        const item = document.createElement('li');
        item.setAttribute('data-employee-entry', 'true');
        item.innerHTML = `<a href="./admin.html"><i class="fa-light fa-gear"></i> ${user.userType === 2 ? 'Trang nhân viên' : 'Quản lý cửa hàng'}</a>`;
        menu.prepend(item);
    }

    function renderMessages() {
        const container = document.querySelector('.support-chat-messages');
        if (!container) return;

        if (!messages.length) {
            container.innerHTML = `<div class="support-chat-empty">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện với nhân viên.</div>`;
            return;
        }

        const user = currentUser();
        container.innerHTML = messages.map(message => {
            const mine = user && message.senderPhone === user.phone;
            const bubbleClass = mine ? 'me' : 'employee';
            const label = mine ? 'Bạn' : `Nhân viên: ${message.senderName || 'Nhân viên hỗ trợ'}`;
            return `
                <div class="support-chat-bubble ${bubbleClass}">
                    <div>${message.content}</div>
                    <span class="support-chat-meta">${label} • ${formatTime(message.createdAt)}</span>
                </div>
            `;
        }).join('');

        scrollMessagesToBottom();
    }

    function scrollMessagesToBottom() {
        const container = document.querySelector('.support-chat-messages');
        if (!container) return;

        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
        });
    }

    async function initializeChat() {
        const user = currentUser();
        if (!user || !token()) {
            messages = [];
            renderMessages();
            return;
        }

        try {
            const response = await fetch('/api/v1/chat/my/messages', {
                headers: {
                    'Authorization': `Bearer ${token()}`
                }
            });
            const payload = await response.json();
            messages = payload.data || [];
            renderMessages();
            connectRealtime();
        } catch (error) {
            console.error('Không thể tải lịch sử chat:', error);
        }
    }

    async function submitMessage(event) {
        event.preventDefault();
        const user = currentUser();
        if (!user || !token()) {
            toast({ title: 'Thông báo', message: 'Bạn cần đăng nhập để chat với nhân viên', type: 'warning', duration: 3000 });
            return;
        }

        const textarea = document.querySelector('.support-chat-form textarea');
        const content = textarea.value.trim();
        if (!content) return;

        try {
            const response = await fetch('/api/v1/chat/my/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token()}`
                },
                body: JSON.stringify({ content })
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload.message || 'Không thể gửi tin nhắn');
            }
            textarea.value = '';
            upsertMessage(payload.data);
        } catch (error) {
            toast({ title: 'Lỗi', message: error.message, type: 'error', duration: 3000 });
        }
    }

    function upsertMessage(message) {
        const index = messages.findIndex(item => item.id === message.id);
        if (index >= 0) {
            messages[index] = message;
        } else {
            messages.push(message);
        }
        messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        renderMessages();
    }

    function openChatPanel() {
        const panel = document.querySelector('.support-chat-panel');
        if (panel && !panel.classList.contains('open')) {
            panel.classList.add('open');
        }
        scrollMessagesToBottom();
    }

    function connectRealtime() {
        if (eventSource || !token()) return;
        eventSource = new EventSource(`/api/v1/chat/stream?token=${encodeURIComponent(token())}`);
        eventSource.addEventListener('CHAT_MESSAGE', event => {
            const payload = JSON.parse(event.data);
            const user = currentUser();
            upsertMessage(payload);
            if (user && payload.senderPhone !== user.phone) {
                openChatPanel();
            }
        });
        eventSource.onerror = () => {
            eventSource.close();
            eventSource = null;
        };
    }

    document.addEventListener('DOMContentLoaded', () => {
        buildWidget();
        ensureEmployeeEntryPoint();
        if (currentUser() && token()) {
            initializeChat();
        }
    });
    window.addEventListener('beforeunload', () => {
        if (eventSource) {
            eventSource.close();
        }
    });
})();
