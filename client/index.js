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
let users;

function init() {
    document.getElementById("btn-send").addEventListener("click", msgSend);
    document.getElementById("btnConnect").addEventListener("click", connectToSocket);
    document.getElementById("dm-input").onkeydown = (e) => {
        if (e.key == "Enter") {msgSend();}
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

    socket.on("msg-send", (msg) => {
        messages.push(msg);
        const fromUser = getUserFromId(msg.user_id);
        if (selectedId == msg.user_id) {
            renderDMMessages(fromUser)
        } else {
            const notification = new Notification(`New message from ${fromUser.username}`, {
                body: msg.message
            });
            notification.onclick = ()=>{switchSelectedUser(fromUser);}
        };

        if (document.hidden) {
            const notification = new Notification(`New message from ${fromUser.username}`, {
                body: msg.message
            });
            notification.onclick = () => { switchSelectedUser(fromUser); }
        } //ezt szépíteni
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
    if (!selectedId) return;
    e.preventDefault();
    const toUserId = selectedId;
    m1 = new Message(document.getElementById("dm-input").value, new Date(), self_id, toUserId);
    messages.push(m1);
    socket.emit("msg-send", m1);

    renderDMMessages(getUserFromId(toUserId));
}

function displayMessage(msg) {
    const block = document.getElementById("msgBlock");
    const message = document.createElement("li");
    message.textContent = msg.message;

    block.appendChild(message);
}

async function getUsers() {
    const response = await fetch("/users");
    users = await response.json();

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

function getUserFromId(id) {
    return users.find(element=> parseInt(element.id) == id);
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
    console.log(user)
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
}

document.addEventListener("DOMContentLoaded", init);