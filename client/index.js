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
    document.getElementById("btnMsgSend").addEventListener("click", msgSend);
    document.getElementById("btnConnect").addEventListener("click", connectToSocket);
}

function connectToSocket() {
    socket = io("", {
        auth: {
            username: document.getElementById("inpUserName").value,
            password: document.getElementById("inpPassword").value
        }
    })

    socket.on("msg-send", (msg) => {
        messages.push(msg);
        if (selectedId == msg.user_id) displayMessage(msg);
    })

    socket.on("send-id-init", (id) => {
        self_id = parseInt(id);
        getMsg();
        getUsers();
    })

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

    const userBlock = document.getElementById("users");
    userBlock.innerHTML = "";
    users.forEach(element => {
        if (element.id != self_id) {
            const button = document.createElement("button");
            button.textContent = element.username;
            button.onclick = () => {
                switchSelectedUser(element);
            }
            userBlock.appendChild(button);
        }
    })
}

function switchSelectedUser(user) {
    selectedId = user.id;
    document.getElementById("inpToUserId").value = selectedId;
    document.getElementById("msgBlock").innerHTML = "";
    messages.forEach(element => {
        if ((element.toId == user.id && element.user_id == self_id) || (element.toId == self_id && element.user_id == user.id)) {
            displayMessage(element);
        }
    });
}

async function getMsg() {
    const response = await fetch("/messages/?id=" + self_id);
    const data = await response.json();
    messages = data;
}

document.addEventListener("DOMContentLoaded", init);