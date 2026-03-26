let database = JSON.parse(localStorage.getItem('vatican_mail_db')) || { accounts: [] };
let currentAcc = null;
let delTask = { ids: [], type: '' };

window.onload = () => {
    const activeId = sessionStorage.getItem('vatican_active_id');
    if (activeId) {
        currentAcc = database.accounts.find(a => a.id === activeId);
    }
    
    if (!currentAcc) {
        autoCreateAccount();
    } else {
        refreshUI();
    }
};

function autoCreateAccount() {
    const newAcc = {
        id: "USR-" + Math.floor(1000 + Math.random() * 9000),
        pass: Math.floor(100 + Math.random() * 899).toString(),
        emails: [],
        messages: []
    };
    database.accounts.push(newAcc);
    saveDB();
    loginToAccount(newAcc);
    showToast("Akun Baru Terbikin Otomatis!");
}

function loginToAccount(acc) {
    currentAcc = acc;
    sessionStorage.setItem('vatican_active_id', acc.id);
    refreshUI();
}

function saveDB() {
    localStorage.setItem('vatican_mail_db', JSON.stringify(database));
}

function refreshUI() {
    document.getElementById('displayId').innerText = currentAcc.id;
    document.getElementById('displayPass').innerText = currentAcc.pass;
    renderEmails();
}

function togglePopup(id) {
    const el = document.getElementById(id);
    el.style.display = (el.style.display === 'flex') ? 'none' : 'flex';
}

function showToast(txt) {
    const t = document.getElementById('customToast');
    t.innerText = txt; t.className = "toast show";
    setTimeout(() => t.className = "toast", 3000);
}

// --- AKUN LOGIC ---
function confirmChangeId() {
    const val = document.getElementById('newIdInput').value.trim();
    if(!val) return showToast("Isi ID!");
    if(database.accounts.some(a => a.id === val)) return showToast("ID sudah ada!");
    currentAcc.id = val;
    saveDB(); refreshUI(); togglePopup('changeIdPop');
}

function confirmChangePass() {
    const p1 = document.getElementById('newPassInput').value;
    const p2 = document.getElementById('confirmPassInput').value;
    if(p1 !== p2 || !p1) return showToast("Sandi tidak cocok!");
    currentAcc.pass = p1;
    saveDB(); refreshUI(); togglePopup('changePassPop');
}

function loginSystem() {
    const id = document.getElementById('loginId').value;
    const ps = document.getElementById('loginPass').value;
    const acc = database.accounts.find(a => a.id === id && a.pass === ps);
    if(acc) {
        loginToAccount(acc); togglePopup('loginPop'); showToast("Berhasil Login!");
    } else { showToast("Gagal Login!"); }
}

function logoutSystem() {
    sessionStorage.removeItem('vatican_active_id');
    togglePopup('logoutConfirmPop');
    autoCreateAccount();
}

// --- EMAIL & PESAN LOGIC ---
function saveEmail() {
    const user = document.getElementById('usernameInput').value.trim();
    const dom = document.getElementById('domainInput').value;
    if(!user) return;
    currentAcc.emails.push({ id: Date.now(), address: `${user.toLowerCase()}@${dom}` });
    saveDB(); renderEmails(); togglePopup('createEmailPop');
}

function renderEmails() {
    const list = document.getElementById('emailList');
    list.innerHTML = currentAcc.emails.length ? '' : '<p style="opacity:0.4; text-align:center;">Email Kosong</p>';
    currentAcc.emails.forEach(e => {
        list.innerHTML += `<div class="email-card"><b>${e.address}</b><button onclick="askDelete(['${e.id}'], 'acc')">HAPUS</button></div>`;
    });
}

function openCompose() {
    if(!currentAcc.emails.length) return showToast("Buat email dulu!");
    const opt = currentAcc.emails.map(e => `<option>${e.address}</option>`).join('');
    document.getElementById('sendFrom').innerHTML = opt;
    document.getElementById('sendTo').innerHTML = opt;
    togglePopup('composePop');
}

function sendEmailAction() {
    const msg = {
        id: Date.now(),
        from: document.getElementById('sendFrom').value,
        to: document.getElementById('sendTo').value,
        subject: document.getElementById('subjectInput').value || "(No Subject)",
        body: document.getElementById('messageInput').value || "..."
    };
    currentAcc.messages.push(msg);
    saveDB(); togglePopup('composePop'); showToast("Pesan Masuk ke Global Inbox!");
}

function openGlobalInbox() {
    renderMessages(); togglePopup('inboxPop');
}

function renderMessages() {
    const feed = document.getElementById('messageList');
    feed.innerHTML = currentAcc.messages.length ? '' : '<p style="text-align:center">Kosong</p>';
    currentAcc.messages.forEach(m => {
        const time = new Date(m.id).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        feed.innerHTML += `
            <div class="msg-item">
                <div style="width:100%; display:flex; justify-content:space-between">
                    <label><input type="checkbox" class="msg-sel" value="${m.id}"> <b>${m.subject}</b></label>
                    <span style="font-size:9px; color:var(--pink-glow)">${time}</span>
                </div>
                <div style="font-size:10px; color:var(--gold)">Dari: ${m.from} | Ke: ${m.to}</div>
                <div style="font-size:12px; margin-top:5px;">${m.body}</div>
                <button onclick="askDelete(['${m.id}'], 'msg')" style="border:none; color:red; float:right;">×</button>
            </div>`;
    });
}

// --- DELETE SYSTEM ---
function askDelete(ids, type) {
    delTask = { ids, type };
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    document.getElementById('randomCodeDisplay').innerText = code;
    document.getElementById('confirmCodeInput').value = '';
    togglePopup('deleteConfirmPop');
}

function executeDelete() {
    const input = document.getElementById('confirmCodeInput').value.toUpperCase();
    if(input !== document.getElementById('randomCodeDisplay').innerText) return showToast("Kode Salah!");
    if(delTask.type === 'acc') {
        currentAcc.emails = currentAcc.emails.filter(e => !delTask.ids.includes(e.id.toString()));
    } else {
        currentAcc.messages = currentAcc.messages.filter(m => !delTask.ids.includes(m.id.toString()));
    }
    saveDB(); renderEmails(); if(delTask.type === 'msg') renderMessages();
    togglePopup('deleteConfirmPop'); showToast("Terhapus!");
}

function toggleSelectAll() {
    const master = document.getElementById('selectAll');
    document.querySelectorAll('.msg-sel').forEach(c => c.checked = master.checked);
}

function deleteSelectedMessages() {
    const sel = Array.from(document.querySelectorAll('.msg-sel:checked')).map(c => c.value);
    if(!sel.length) return showToast("Pilih pesan!");
    askDelete(sel, 'msg');
}
