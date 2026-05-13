class Message {
    constructor(message, date, user_id, toId) {
        this.message = message;
        this.date = date;
        this.user_id = user_id;
        this.toId = toId;
    }
}

let socket;
let self_id;
let messages;
let selectedId;
let users;

function init() {
    const saved = localStorage.getItem("theme");
    if (saved == "light") {
        document.body.classList.add("light");
    }

    document.getElementById("btn-send").addEventListener("click", msgSend);
    document.getElementById("btnConnect").addEventListener("click", connectToSocket);
    document.getElementById("btnRegister").addEventListener("click", register);
    document.getElementById("dm-input").onkeydown = (e) => {
        if (e.key == "Enter") { msgSend(e); }
    }
}

async function connectToSocket() {
    const promise = await Notification.requestPermission();

    socket = io("", {
        auth: {
            username: document.getElementById("login-email").value,
            password: document.getElementById("login-password").value
        }
    })

    socket.on("user-connected", (id) => {
        document.getElementById(id + "-dot").className = "";
        document.getElementById(id + "-dot").classList.add("online-dot")
    })

    socket.on("user-disconnected", (id) => {
        document.getElementById(id + "-dot").className = "";
        document.getElementById(id + "-dot").classList.add("offline-dot")
    })

    socket.on("new-user",()=>{
        getUsers();
    })

    socket.on("msg-send", (msg) => {
        messages.push(msg);
        displayPreview(msg);
        const fromUser = getUserFromId(msg.user_id);
        if (selectedId == msg.user_id) {
            renderDMMessages(fromUser)
        } else if (!document.hidden) {
            const notification = new Notification(`New message from ${fromUser.username}`, {
                body: msg.message
            });
            notification.onclick = () => { switchSelectedUser(fromUser); }
        };

        if (document.hidden) {
            const notification = new Notification(`New message from ${fromUser.username}`, {
                body: msg.message
            });
            notification.onclick = () => { switchSelectedUser(fromUser); }
        } //ezt szépíteni
    })

    socket.on("send-id-init", (id) => {
        self_id = id;
        enterApp();
    })

}

async function register() {
    console.log("a")
    const username = document.getElementById("reg-username");
    const password = document.getElementById("reg-password");

    if (!username.value || !password.value) return;

    const response = await fetch(`/register/?username=${username.value}&password=${password.value}`)
    const text = await response.text();

    if (text == "registered") {
        document.getElementById("login-email").value = username.value;
        document.getElementById("login-password").value = password.value;
        connectToSocket();
    }
}

async function enterApp() {
    //profile footer
    const username = document.getElementById("login-email").value;
    document.getElementById("sidebar-username").innerText = username;
    document.getElementById("sidebar-avatar").innerText = username.charAt(0);

    await getUsers();
    getMsg();

    document.getElementById("page-auth").classList.remove("active");
    document.getElementById("page-auth").classList.add("hidden");
    document.getElementById("page-app").classList.remove("hidden");
    document.getElementById("page-app").classList.add("active");

    showView("empty");
}

function msgSend(e) {
    if (!selectedId) return;

    const text = document.getElementById("dm-input").value;
    if (!text) return;

    e.preventDefault();
    const toUserId = selectedId;
    m1 = new Message(text, new Date().toISOString(), self_id, toUserId);
    messages.push(m1);
    socket.emit("msg-send", m1);

    renderDMMessages(getUserFromId(toUserId));
    displayPreview(m1);

    //clear input
    document.getElementById("dm-input").value = "";
}

function displayMessage(msg) {
    const block = document.getElementById("msgBlock");
    const message = document.createElement("li");
    message.textContent = msg.message;

    block.appendChild(message);
}

function switchTab(tab) {
    const loginButton = document.getElementById("loginButton");
    const registerButton = document.getElementById("registerButton");;

    const loginTab = document.getElementById("tab-login");
    const registerTab = document.getElementById("tab-register");

    if (tab == "login") {
        loginButton.classList.add("active");
        registerButton.classList.remove("active");

        loginTab.classList.remove("hidden");
        registerTab.classList.add("hidden");
    } else if (tab == "register") {
        registerButton.classList.add("active");
        loginButton.classList.remove("active");

        registerTab.classList.remove("hidden");
        loginTab.classList.add("hidden");
    }
}

async function getUsers() {
    const response = await fetch("/users");
    users = await response.json();

    const container = document.getElementById("sidebar-users");
    container.innerHTML = "";
    users.forEach(async (element) => {
        if (element.id != self_id) {
            //is user active
            let dotClass = "offline-dot";
            const response = await fetch("/isuseractive/?id=" + element.id);
            const state = await response.text();
            if (state == "true") { dotClass = "online-dot"; }

            const item = document.createElement("div");
            item.className = "user-item"
            item.innerHTML = `
            <div class="avatar prevent-select">${element.username.charAt(0)}</div>
                <div class="user-item-info">
                <div class="user-item-name">${element.username}</div>
                <div id="${element.id}-message-preview" class="user-item-preview"></div>
            </div>
            <div id="${element.id}-dot" class="${dotClass}"></div>`;
            item.onclick = () => {
                try { container.querySelector(".active").classList.remove("active"); } catch { }
                item.classList.add("active");
                switchSelectedUser(element);
            }
            container.appendChild(item);
        }
    })
}

function getUserFromId(id) {
    return users.find(element => parseInt(element.id) == id);
}

function switchSelectedUser(user) {
    selectedId = user.id;

    document.getElementById("chat-avatar").textContent = user.username.charAt(0);
    document.getElementById("chat-name").textContent = user.username;

    renderDMMessages(user);
    showView("dm");
}

function renderDMMessages(user) {
    const list = document.getElementById("dm-messages");
    list.innerHTML = "";
    messages.forEach(element => {
        if (((element.toId == user.id && element.user_id == self_id) || (element.toId == self_id && element.user_id == user.id))) {
            const row = document.createElement("div");

            row.className = "bubble-row";
            let avatarId = element.user_id;
            //is own?
            if (element.user_id == self_id) {
                row.className += " own";
                //avatarId = element.user_id;
            }

            //date
            const date = new Date(element.date);
            const now = new Date();

            let dateDisplayString = "error";

            if (date.getFullYear() == now.getFullYear() && date.getMonth() == now.getMonth() && date.getDate() == now.getDate()) {
                dateDisplayString = date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0");
            } else if (date.getFullYear() == now.getFullYear() && date.getMonth() == now.getMonth() && date.getDate() == (now.getDate() - 1)) {
                dateDisplayString = "yesterday " + date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0");
            } else {
                dateDisplayString = date.getFullYear() + ". " + date.getMonth() + ". " + date.getDate() + ". " + date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0");
            }

            row.innerHTML = `
                <div class="avatar prevent-select" style="width:28px;height:28px;font-size:0.78rem;">${getUserFromId(avatarId).username.charAt(0)}</div>
                <div>
                    <div class="bubble">${element.message}</div>
                    <div class="bubble-time">${dateDisplayString}</div>
                </div>`;
            list.appendChild(row);
        }
    })
    list.scrollTop = list.scrollHeight; //scroll to bottom
}

function showView(name) {
    document.querySelectorAll(".view").forEach(v => {
        v.classList.remove("active");
        v.classList.add("hidden");
    });

    const target = document.getElementById("view-" + name);
    target.classList.remove("hidden");
    target.classList.add("active");
}

async function getMsg() {
    const response = await fetch("/messages/?id=" + self_id);
    const data = await response.json();
    messages = data;
    for (let i = messages.length - 1; i >= 0; i--) {
        displayPreview(messages[i], true);
    }
}

function displayPreview(message, start = false) {
    let previewId = message.user_id;
    if (message.user_id == self_id) {
        previewId = message.toId;
    }

    preview = document.getElementById(previewId + "-message-preview");
    if (preview.innerText == "" || !start) {
        preview.innerText = message.message;
    }
}

function toggleTheme() {
    document.body.classList.toggle("light");

    // mentés
    const isLight = document.body.classList.contains("light");
    localStorage.setItem("theme", isLight ? "light" : "dark");
}

document.addEventListener("DOMContentLoaded", init);