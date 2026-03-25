let emails = JSON.parse(localStorage.getItem('em_maker_v5_acc')) || [];
let messages = JSON.parse(localStorage.getItem('em_maker_v5_msg')) || [];
let delTask = { ids: [], type: '' };

window.onload = () => renderEmails();

function togglePopup(id) {
    const el = document.getElementById(id);
    el.style.display = (el.style.display === 'flex') ? 'none' : 'flex';
}

function showToast(msg) {
    const t = document.getElementById('customToast');
    t.innerText = msg;
    t.className = "toast show";
    setTimeout(() => t.className = "toast", 3000);
}

// --- AKUN EMAIL ---
function saveEmail() {
    const user = document.getElementById('usernameInput').value.trim();
    const dom = document.getElementById('domainInput').value;
    if(!user) return showToast("Username kosong!");

    emails.push({ id: Date.now(), address: `${user.toLowerCase()}@${dom}` });
    localStorage.setItem('em_maker_v5_acc', JSON.stringify(emails));
    renderEmails();
    togglePopup('createEmailPop');
    showToast("Email Berhasil Dibuat!");
}

function renderEmails() {
    const list = document.getElementById('emailList');
    list.innerHTML = emails.length ? '' : '<p style="opacity:0.5; text-align:center;">Belum ada email.</p>';
    emails.forEach(e => {
        list.innerHTML += `
            <div style="border:1px solid #333; padding:10px; margin-bottom:5px; display:flex; justify-content:space-between; align-items:center;">
                <span>${e.address}</span>
                <button onclick="askDelete(['${e.id}'], 'acc')" style="padding:4px 8px; font-size:12px;">HAPUS</button>
            </div>
        `;
    });
}

// --- PESAN & INBOX ---
function openCompose() {
    if(!emails.length) return showToast("Buat email dulu!");
    const f = document.getElementById('sendFrom');
    const t = document.getElementById('sendTo');
    const opt = emails.map(e => `<option value="${e.address}">${e.address}</option>`).join('');
    f.innerHTML = opt; t.innerHTML = opt;
    togglePopup('composePop');
}

function sendEmailAction() {
    const msg = {
        id: Date.now(),
        from: document.getElementById('sendFrom').value,
        to: document.getElementById('sendTo').value,
        subject: document.getElementById('subjectInput').value || "(No Subject)",
        body: document.getElementById('messageInput').value || "(Empty Body)"
    };
    messages.push(msg);
    localStorage.setItem('em_maker_v5_msg', JSON.stringify(messages));
    togglePopup('composePop');
    showToast("Pesan Terkirim ke Global Inbox!");
}

function openGlobalInbox() {
    renderMessages();
    togglePopup('inboxPop');
}

function renderMessages() {
    const feed = document.getElementById('messageList');
    feed.innerHTML = messages.length ? '' : '<p style="text-align:center; padding:20px;">Inbox Kosong.</p>';
    
    messages.forEach(m => {
        const timeStr = new Date(m.id).toLocaleString('id-ID', { hour:'2-digit', minute:'2-digit', day:'2-digit', month:'short' });
        feed.innerHTML += `
            <div class="msg-item">
                <div style="display:flex; justify-content:space-between;">
                    <label><input type="checkbox" class="msg-sel" value="${m.id}"> <b>${m.subject}</b></label>
                    <span style="font-size:10px; color:#888;">${timeStr}</span>
                </div>
                <div style="font-size:11px; color:var(--gold); margin:5px 0;">Ke: ${m.to} | Dari: ${m.from}</div>
                <div style="font-size:13px; opacity:0.8;">${m.body}</div>
                <button onclick="askDelete(['${m.id}'], 'msg')" style="border:none; color:red; float:right; margin-top:-20px;">×</button>
            </div>
        `;
    });
}

// --- SISTEM HAPUS ---
function askDelete(ids, type) {
    delTask = { ids, type };
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    document.getElementById('randomCodeDisplay').innerText = code;
    document.getElementById('confirmCodeInput').value = '';
    togglePopup('deleteConfirmPop');
}

function executeDelete() {
    const input = document.getElementById('confirmCodeInput').value.toUpperCase();
    const target = document.getElementById('randomCodeDisplay').innerText;
    
    if(input !== target) return showToast("Kode Salah!");

    if(delTask.type === 'acc') {
        emails = emails.filter(e => !delTask.ids.includes(e.id.toString()));
        localStorage.setItem('em_maker_v5_acc', JSON.stringify(emails));
        renderEmails();
    } else {
        messages = messages.filter(m => !delTask.ids.includes(m.id.toString()));
        localStorage.setItem('em_maker_v5_msg', JSON.stringify(messages));
        renderMessages();
    }
    togglePopup('deleteConfirmPop');
    showToast("Data Berhasil Dihapus!");
}

function toggleSelectAll() {
    const master = document.getElementById('selectAll');
    document.querySelectorAll('.msg-sel').forEach(c => c.checked = master.checked);
}

function deleteSelectedMessages() {
    const selected = Array.from(document.querySelectorAll('.msg-sel:checked')).map(c => c.value);
    if(!selected.length) return showToast("Pilih pesan!");
    askDelete(selected, 'msg');
}
