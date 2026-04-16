let socket=io();

function init() {
    document.getElementById("btnMsgSend").addEventListener("click",msgSend);
    getMsg();
}

socket.on("msg-send",(msg)=>{
     document.getElementById("msgBlock").innerHTML +="<br>"+msg;
})

function msgSend() {
    socket.emit("msg-send",document.getElementById("inpMsg").value);
}

async function getMsg() {
    const response = await fetch("/messages");
    const data = await response.json();
    document.getElementById("msgBlock").textContent = data.message; 
}

document.addEventListener("DOMContentLoaded",init);