/**
 * Phần mềm Chat Online - Mock Database sử dụng LocalStorage & Hỗ trợ SQL Backend
 * Tác giả: Đinh Văn Hoàng
 * Tính năng: Thêm, Sửa, Xóa, Tìm kiếm, Giao diện 2 chiều Host/Client
 */

// Lấy role hiện tại từ thẻ body (host hoặc client)
const currentUserType = document.body.getAttribute('data-user-type');

// DOM Elements
const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const searchInput = document.getElementById('searchInput');

const editModal = document.getElementById('editModal');
const editInput = document.getElementById('editInput');

let editingMessageId = null;

// Cấu hình URL Backend Node.js
const API_URL = 'http://localhost:3000/api/messages';

// Biến cờ theo dõi trạng thái kết nối
let useBackend = true;

// Hàm khởi tạo và lắng nghe thay đổi
function init() {
  renderMessages();

  // Lắng nghe thay đổi từ tab khác (LocalStorage sync khi mất kết nối backend)
  window.addEventListener('storage', () => {
    if (!useBackend) renderMessages(searchInput.value.trim(), false);
  });

  // Polling (Lấy tin nhắn mới mỗi 2 giây nếu dùng Backend)
  setInterval(() => {
    if (useBackend && !editingMessageId) {
      renderMessages(searchInput.value.trim(), false);
    }
  }, 2000);

  // Lắng nghe sự kiện thêm tin nhắn (Enter để gửi, Shift+Enter để xuống dòng)
  sendBtn.addEventListener('click', sendMessage);
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Ngăn xuống dòng khi bấm Enter
      sendMessage();
    }
  });

  // Lắng nghe sự kiện cho thẻ Edit Input (Enter rỗng để LƯU, Shift+Enter để xuống dòng)
  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    }
  });

  // Lắng nghe sự kiện tìm kiếm
  searchInput.addEventListener('input', () => {
    renderMessages(searchInput.value.trim(), false);
  });
}

// --- LOCAL STORAGE FALLBACK ---
function getLocalMessages() {
  const msgs = localStorage.getItem('dvh_chat_messages');
  return msgs ? JSON.parse(msgs) : [];
}

function saveLocalMessages(messages) {
  localStorage.setItem('dvh_chat_messages', JSON.stringify(messages));
}

// --- API FETCH & FALLBACK ---
// Lấy danh sách tin nhắn
async function getMessages() {
  if (useBackend) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // Timeout 1.5 giây
      const response = await fetch(API_URL, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error("Server response not ok");
      return await response.json();
    } catch (error) {
      console.warn("⚠️ Không kết nối được Backend SQL. Fallback sang LocalStorage...");
      useBackend = false;
      return getLocalMessages();
    }
  } else {
    return getLocalMessages();
  }
}

// Tạo HTML cho 1 tin nhắn
function createMessageElement(msg) {
  const isMine = msg.sender === currentUserType;
  const wrapper = document.createElement('div');
  wrapper.className = `message-wrapper ${isMine ? 'sent' : 'received'}`;

  const senderName = msg.sender === 'host' ? 'Máy Host' : 'Khách';
  const timeString = new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  // Nút hành động (Sửa, Xóa) chỉ hiện nếu là tin nhắn của mình
  let actionsHTML = '';
  if (isMine) {
    actionsHTML = `
      <div class="message-actions">
        <button class="btn-edit" onclick="openEditModal(${msg.id}, '${msg.content.replace(/'/g, "\\'")}')" title="Sửa"><i class="fas fa-pen"></i></button>
        <button class="btn-delete" onclick="deleteMessage(${msg.id})" title="Xóa"><i class="fas fa-trash"></i></button>
      </div>
    `;
  }

  // Escape HTML entities to prevent XSS, then replace newlines with <br>
  const safeContent = msg.content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, '<br>');

  wrapper.innerHTML = `
    <div class="message" id="msg-${msg.id}">
      ${safeContent}
    </div>
    <div class="message-info">
      <span>${senderName} ${msg.edited ? '<span style="opacity: 0.7; font-size: 0.85em; font-style: italic;">(đã sửa)</span>' : ''}</span>
      <div style="display: flex; align-items: center; gap: 10px;">
        ${actionsHTML}
        <span>${timeString}</span>
      </div>
    </div>
  `;

  return wrapper;
}

// Cập nhật giao diện danh sách tin nhắn
async function renderMessages(searchKeyword = '', forceScroll = true) {
  const messages = await getMessages();

  // Lưu vị trí cuộn hiện tại
  const isScrolledToBottom = chatBox.scrollHeight - chatBox.clientHeight <= chatBox.scrollTop + 50;

  chatBox.innerHTML = ''; // Clear old

  const filtered = messages.filter(msg => {
    if (!searchKeyword) return true;
    return msg.content.toLowerCase().includes(searchKeyword.toLowerCase());
  });

  if (filtered.length === 0 && searchKeyword) {
    chatBox.innerHTML = '<div style="text-align:center; color:#ccc;">Không tìm thấy kết quả nào.</div>';
    return;
  }

  filtered.forEach(msg => {
    chatBox.appendChild(createMessageElement(msg));
  });

  // Chỉ cuộn xuống đáy nếu được yêu cầu hoặc nếu người dùng đang ở sẵn dưới đáy
  if (!searchKeyword && (forceScroll || isScrolledToBottom)) {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

// --- TÍNH NĂNG: THÊM TIN NHẮN ---
async function sendMessage() {
  const content = messageInput.value.trim();
  if (!content) return;

  const messages = await getMessages();
  const isFirstMessage = messages.length === 0;

  // Xử lý gửi tin
  if (useBackend) {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: currentUserType, content: content })
      });
    } catch (error) {
      useBackend = false;
      fallbackSendMessage(content);
    }
  } else {
    fallbackSendMessage(content);
  }

  messageInput.value = '';
  await renderMessages('', true);

  // Chức năng tự động phản hồi (Auto-reply) khi Khách chat lần đầu
  if (isFirstMessage && currentUserType === 'client') {
    setTimeout(async () => {
      const autoReplyContent = '👋 Admin sẽ phản hồi với bạn trong thời gian sớm nhất có thể';

      if (useBackend) {
        try {
          await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender: 'host', content: autoReplyContent })
          });
        } catch (err) {
          useBackend = false;
          fallbackSendMessage(autoReplyContent, 'host');
        }
      } else {
        fallbackSendMessage(autoReplyContent, 'host');
      }
      await renderMessages('', true);
    }, 1000);
  }
}









// Logic gửi local
function fallbackSendMessage(content, forceSender = null) {
  const messages = getLocalMessages();
  const newMessage = {
    id: Date.now(),
    sender: forceSender || currentUserType,
    content: content,
    timestamp: new Date().toISOString(),
    edited: false
  };
  messages.push(newMessage);
  saveLocalMessages(messages);
}


// --- TÍNH NĂNG: XÓA TIN NHẮN ---
// (Lưu ý: API server.js mặc định của mình chưa viết đủ chức năng Delete lẻ. 
//  Nếu dùng CSDL, hàm này tạm ngắt. Nếu rớt CSDL, dùng LocalStorage thì hàm xóa vẫn OK)
window.deleteMessage = async function (id) {
  if (confirm("Chắc chắn muốn xóa tin nhắn này?")) {
    if (useBackend) {
      alert("Tính năng chọn xóa riêng lẻ từng tin nhắn đang yêu cầu lập trình thêm API phụ trợ trên Server!");
    } else {
      let messages = getLocalMessages();
      messages = messages.filter(m => m.id !== id);
      saveLocalMessages(messages);
      await renderMessages('', false);
    }
  }
}

// --- TÍNH NĂNG: SỬA TIN NHẮN ---
window.openEditModal = function (id, content) {
  editingMessageId = id;
  // Khôi phục lại thẻ <br> thành ký tự xuống dòng thực tế khi vào Form Sửa
  editInput.value = content.replace(/<br>/g, '\n');
  editModal.classList.add('active');
  editInput.focus();
}

window.closeEditModal = function () {
  editModal.classList.remove('active');
  editingMessageId = null;
}

window.saveEdit = async function () {
  const newContent = editInput.value.trim();
  if (!newContent || !editingMessageId) return;

  if (useBackend) {
    try {
      await fetch(`${API_URL}/${editingMessageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      });
    } catch (error) {
      useBackend = false;
      fallbackEditMessage(editingMessageId, newContent);
    }
  } else {
    fallbackEditMessage(editingMessageId, newContent);
  }

  closeEditModal();
  await renderMessages('', false);
}

function fallbackEditMessage(id, newContent) {
  const messages = getLocalMessages();
  const targetIndex = messages.findIndex(m => m.id === id);
  if (targetIndex > -1) {
    messages[targetIndex].content = newContent;
    messages[targetIndex].edited = true;
    saveLocalMessages(messages);
  }
}


// --- TÍNH NĂNG: XÓA TOÀN BỘ CUỘC HỘI THOẠI (TẠO MỚI) ---
window.clearConversation = async function () {
  if (confirm("Bạn có chắc chắn muốn TẠO MỚI cuộc trò chuyện không? (Toàn bộ dữ liệu sẽ bị xóa)")) {
    if (useBackend) {
      try {
        await fetch(API_URL, { method: 'DELETE' });
      } catch (e) {
        useBackend = false;
        localStorage.removeItem('dvh_chat_messages');
      }
    } else {
      localStorage.removeItem('dvh_chat_messages');
    }

    chatBox.innerHTML = '<div style="text-align:center; color:#00e676; margin-top: 20px; animation: slideInMsg 0.5s ease;">Đã xóa toàn bộ. Hãy bắt đầu cuộc trò chuyện mới!</div>';
    setTimeout(() => {
      renderMessages('', true);
    }, 3000);
  }
}

// Chạy khởi tạo
init();
