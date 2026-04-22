class Message {
    constructor(message, date, user_id, toId) {
        this.message = message;
        this.date = Date(date);
        this.user_id = user_id;
        this.toId = toId;
    }
}

let socket;

function init() {
    document.getElementById("btnMsgSend").addEventListener("click", msgSend);
    document.getElementById("btnConnect").addEventListener("click", connectToSocket);
    getMsg();
}



function connectToSocket() {
    socket = io("", {
        auth: {
            username: document.getElementById("inpUserName").value,
            password: document.getElementById("inpPassword").value
        }
    })

    socket.on("msg-send", (msg) => {
    displayMessage(msg.message);
})
}

function msgSend() {
    const toUserId = document.getElementById("inpToUserId").value;
    m1 = new Message(document.getElementById("inpMsg").value, new Date(), 0, toUserId);
    socket.emit("msg-send", m1);
    displayMessage(m1.message);
}

function displayMessage(text) {
    const block = document.getElementById("msgBlock");
    const message = document.createElement("li");
    message.textContent = text;

    block.appendChild(message);
}

async function getMsg() {
    const response = await fetch("/messages");
    const data = await response.text();
    data.split(";").forEach(element => {
        displayMessage(JSON.parse(element).message);
    });
}

document.addEventListener("DOMContentLoaded", init);