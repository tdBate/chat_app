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
        displayMessage(msg);
    })

    socket.on("send-id-init", (id) => {
        self_id = parseInt(id);
        console.log("id recieved")
        getMsg();
        getUsers();
    })

}

function msgSend(e) {
    e.preventDefault();
    const toUserId = parseInt(document.getElementById("inpToUserId").value);
    m1 = new Message(document.getElementById("inpMsg").value, new Date(), self_id, toUserId);
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
    users.forEach(element=>{
        const button = document.createElement("button");
        button.textContent = element.username;
        button.onclick = ()=>{
            switchSelectedUser(element);
        }
        userBlock.appendChild(button);
    })
}

function switchSelectedUser(user) {
    document.getElementById("msgBlock").innerHTML = "";
    messages.forEach(element=>{
        console.log(element)
        if (element.toId == user.id && element.user_id == self_id) {
            displayMessage(element);
        }
    });
}

async function getMsg() {
    console.log("getmsg")
    const response = await fetch("/messages/?id=" + self_id);
    console.log("/messages/?id=" + self_id);
    const data = await response.json();
    messages = data;
    data.forEach(element => {
        displayMessage(element);
    });
}

document.addEventListener("DOMContentLoaded", init);