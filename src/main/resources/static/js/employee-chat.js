(function () {
    const token = () => localStorage.getItem('jwtToken');
    const currentUser = () => JSON.parse(localStorage.getItem('currentuser') || 'null');
    let conversations = [];
    let currentConversationId = null;
    let eventSource = null;

    function formatTime(value) {
        return value ? new Date(value).toLocaleString('vi-VN') : '';
    }

    function isEmployeeOnlyView() {
        const user = currentUser();
        return user && user.userType === 2;
    }

    function applyEmployeeLayoutRestrictions() {
        if (!isEmployeeOnlyView()) return;

        const tabs = document.querySelectorAll('.sidebar-list .tab-content');
        const sections = document.querySelectorAll('.content .section');
        tabs.forEach((tab, index) => {
            const isChatTab = tab.id === 'employee-chat-tab';
            tab.style.display = isChatTab ? '' : 'none';
            if (sections[index]) {
                sections[index].style.display = isChatTab ? '' : 'none';
                sections[index].classList.toggle('active', isChatTab);
            }
            tab.classList.toggle('active', isChatTab);
        });
    }

    async function loadConversations() {
        try {
            const response = await fetch('/api/v1/employee/chats/conversations', {
                headers: { 'Authorization': `Bearer ${token()}` }
            });
            const payload = await response.json();
            conversations = payload.data || [];
            renderConversations();
            if (!currentConversationId && conversations.length) {
                selectConversation(conversations[0].customerId);
            }
        } catch (error) {
            console.error('KhĂ´ng thá»ƒ táº£i há»™i thoáº¡i há»— trá»£:', error);
        }
    }

    function renderConversations() {
        const container = document.getElementById('employee-chat-conversations');
        if (!container) return;

        if (!conversations.length) {
            container.innerHTML = '<div class="employee-chat-conversation">Chưa có yêu cầu hỗ trợ nào từ USER.</div>';
            return;
        }

        container.innerHTML = conversations.map(conversation => `
            <div class="employee-chat-conversation ${conversation.customerId === currentConversationId ? 'active' : ''}" data-id="${conversation.customerId}">
                <strong>${conversation.customerName || 'Khách hàng'}</strong>
                <small>${conversation.customerPhone || ''}</small>
                <p>${conversation.lastMessage || 'Chưa có nội dung'}</p>
                <small>${formatTime(conversation.lastMessageAt)}</small>
            </div>
        `).join('');

        container.querySelectorAll('.employee-chat-conversation[data-id]').forEach(item => {
            item.addEventListener('click', () => selectConversation(Number(item.dataset.id)));
        });
    }

    async function selectConversation(customerId) {
        currentConversationId = customerId;
        renderConversations();
        const conversation = conversations.find(item => item.customerId === customerId);
        document.getElementById('employee-chat-customer-name').textContent = conversation?.customerName || 'Khách hàng';
        document.getElementById('employee-chat-customer-phone').textContent = conversation?.customerPhone || '';

        try {
            const response = await fetch(`/api/v1/employee/chats/${customerId}/messages`, {
                headers: { 'Authorization': `Bearer ${token()}` }
            });
            const payload = await response.json();
            renderMessages(payload.data || []);
        } catch (error) {
            console.error('KhĂ´ng thá»ƒ táº£i tin nháº¯n cuá»™c trĂ² chuyá»‡n:', error);
        }
    }

    function renderMessages(messages) {
        const container = document.getElementById('employee-chat-messages');
        if (!container) return;

        if (!messages.length) {
            container.innerHTML = '<div class="employee-chat-message user">Chưa có tin nhắn nào trong cuộc trò chuyện này.</div>';
            return;
        }

        container.innerHTML = messages.map(message => `
            <div class="employee-chat-message ${message.senderRole === 'USER' ? 'user' : 'employee'}">
                <div>${message.content}</div>
                <small>${message.senderRole === 'USER' ? (message.senderName || 'Khách hàng') : (message.senderName || 'Nhân viên')} • ${formatTime(message.createdAt)}</small>
            </div>
        `).join('');

        container.scrollTop = container.scrollHeight;
    }

    async function submitReply(event) {
        event.preventDefault();
        if (!currentConversationId) {
            toast({ title: 'Thông báo', message: 'Hãy chọn một cuộc trò chuyện trước', type: 'warning', duration: 2500 });
            return;
        }

        const textarea = document.getElementById('employee-chat-input');
        const content = textarea.value.trim();
        if (!content) return;

        try {
            const response = await fetch(`/api/v1/employee/chats/${currentConversationId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token()}`
                },
                body: JSON.stringify({ content })
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload.message || 'Không thể gửi phản hồi');
            }
            textarea.value = '';
            await selectConversation(currentConversationId);
            await loadConversations();
        } catch (error) {
            toast({ title: 'Lỗi', message: error.message, type: 'error', duration: 3000 });
        }
    }

    function connectRealtime() {
        if (eventSource || !token()) return;
        eventSource = new EventSource(`/api/v1/employee/chats/stream?token=${encodeURIComponent(token())}`);
        eventSource.addEventListener('CHAT_MESSAGE', async event => {
            const message = JSON.parse(event.data);
            const index = conversations.findIndex(item => item.customerId === message.customerId);
            const summary = {
                customerId: message.customerId,
                customerName: message.customerName,
                customerPhone: message.customerPhone,
                lastMessage: message.content,
                lastSenderRole: message.senderRole,
                lastMessageAt: message.createdAt
            };

            if (index >= 0) {
                conversations[index] = summary;
            } else {
                conversations.unshift(summary);
            }
            conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
            renderConversations();

            if (currentConversationId === message.customerId) {
                await selectConversation(currentConversationId);
            }
        });
        eventSource.onerror = () => {
            eventSource.close();
            eventSource = null;
        };
    }

    document.addEventListener('DOMContentLoaded', () => {
        const user = currentUser();
        if (!user || !token() || user.userType === 0) return;

        applyEmployeeLayoutRestrictions();
        const form = document.getElementById('employee-chat-form');
        if (form) {
            form.addEventListener('submit', submitReply);
            loadConversations();
            connectRealtime();
        }
    });

    window.addEventListener('beforeunload', () => {
        if (eventSource) {
            eventSource.close();
        }
    });
})();
