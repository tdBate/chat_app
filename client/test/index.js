function init() {
    document.getElementById("btnMsgSend").addEventListener("click",msgSend);
    getMsg();
}

function msgSend() {
    console.log("a")
}

async function getMsg() {
    const response = await fetch("/messages");
    const data = await response.json();
    document.getElementById("msgBlock").textContent = data.message; 
}

document.addEventListener("DOMContentLoaded",init);