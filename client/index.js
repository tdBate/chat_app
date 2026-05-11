class Message {
    constructor(message, date, user_id, toId) {
        this.message = message;
        this.date = Date(date);
        this.user_id = user_id;
        this.toId = toId;
    }
}

let socket;
let self_id;
let messages;
let selectedId;

function init() {
    //document.getElementById("btnMsgSend").addEventListener("click", msgSend);
    document.getElementById("btnConnect").addEventListener("click", connectToSocket);
}

function connectToSocket() {
    socket = io("", {
        auth: {
            username: document.getElementById("login-email").value,
            password: document.getElementById("login-password").value
        }
    })

    socket.on("msg-send", (msg) => {
        messages.push(msg);
        if (selectedId == msg.user_id) displayMessage(msg);
    })

    socket.on("send-id-init", (id) => {
        self_id = parseInt(id);
        enterApp();
    })

}

function enterApp() {
    getMsg();
    getUsers();

    document.getElementById("page-auth").classList.remove("active");
    document.getElementById("page-auth").classList.add("hidden");
    document.getElementById("page-app").classList.remove("hidden");
    document.getElementById("page-app").classList.add("active");
    showView("empty");
}

function msgSend(e) {
    e.preventDefault();
    const toUserId = parseInt(document.getElementById("inpToUserId").value);
    m1 = new Message(document.getElementById("inpMsg").value, new Date(), self_id, toUserId);
    messages.push(m1);
    socket.emit("msg-send", m1);
    displayMessage(m1);
}

function displayMessage(msg) {
    const block = document.getElementById("msgBlock");
    const message = document.createElement("li");
    message.textContent = msg.message;

    block.appendChild(message);
}

async function getUsers() {
    const response = await fetch("/users");
    const users = await response.json();

    const container = document.getElementById("sidebar-users");
    container.innerHTML = "";
    users.forEach(element => {
        if (element.id != self_id) {
            const item = document.createElement("div");
            item.className = "user-item"
            item.innerHTML = `
            <div class="avatar">${element.username.charAt(0)}</div>
                <div class="user-item-info">
                <div class="user-item-name">${element.username}</div>
                <div class="user-item-preview">atp bro</div>
            </div>
            <div class="online-dot"></div>`;
            item.onclick = () => {
                switchSelectedUser(element);
            }
            container.appendChild(item);
        }
    })
}

function switchSelectedUser(user) {
    selectedId = user.id;
    renderDMMessages(user);
    showView("dm");
    /*
    messages.forEach(element => {
        if ((element.toId == user.id && element.user_id == self_id) || (element.toId == self_id && element.user_id == user.id)) {
            displayMessage(element);
        }
    });*/
}

function renderDMMessages(user) {
    const list = document.getElementById("dm-messages");
    list.innerHTML = "";
    messages.forEach(element => {
        if (((element.toId == user.id && element.user_id == self_id) || (element.toId == self_id && element.user_id == user.id))) {
            const row = document.createElement("div");
    
            row.className = "bubble-row";
            //is own?
            if (element.user_id == self_id) {
                row.className += " own";
            }

            row.innerHTML = `
                <div class="avatar" style="width:28px;height:28px;font-size:0.78rem;">a</div>
                <div>
                    <div class="bubble">${element.message}</div>
                    <div class="bubble-time">${element.date}</div>
                </div>`;
            list.appendChild(row);
        }
    })
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
}

document.addEventListener("DOMContentLoaded", init);