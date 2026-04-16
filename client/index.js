class Message {
    constructor(message, date, user_id) {
        this.message = message;
        this.date = Date(date);
        this.user_id = user_id;
    }
}

let socket=io();

function init() {
    document.getElementById("btnMsgSend").addEventListener("click",msgSend);
    getMsg();
}

socket.on("msg-send",(msg)=>{
     document.getElementById("msgBlock").innerHTML +="<br>"+msg.message;
})

function msgSend() {
    m1 = new Message(document.getElementById("inpMsg").value,new Date(),0);
    socket.emit("msg-send",m1);
}

async function getMsg() {
    const response = await fetch("/messages");
    const data = await response.text();
    data.split(";").forEach(element => {
        document.getElementById("msgBlock").innerHTML += "<br>"+JSON.parse(element).message; 
    });
}

document.addEventListener("DOMContentLoaded",init);