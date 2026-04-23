import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { Socket, Server } from "socket.io";
import http from "http"
import { Message } from "./modules/Message.js";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const base_path = path.join(__dirname, "..", "client");

//server init
const app = express();
const server = http.createServer(app);
const io = new Server(server);

//fs.writeFileSync(path.join(__dirname,"data","messages.json"),'[{"id": 1,"messages": []}, {"id": 2,"messages": []},{"id": 3,"messages": []}]') //reset messages TEMP!!!!!!!! REMOVE!!!!

//socket-io
io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    const password = socket.handshake.auth.password;
    if (!username) return;
    const users = JSON.parse(fs.readFileSync(path.join(__dirname,"data","users.json")).toString());
    users.forEach(element => {
        if (element.username == username && element.password == password) {
            socket.username = username;
            socket.id = element.id;
            next();
            return;
        }
    });

})

let users = [];
io.on("connection", (socket) => {
    const id = users.push(socket);
    socket.emit("send-id-init",socket.id);
    console.log(socket.username +"-"+socket.id+ " connected");
    socket.on("msg-send", (msg) => {
        users.forEach(element => {
            if (element.id == msg.toId) {      
                element.emit("msg-send", msg);
                saveMessage(msg);
                return;
            }
        });
        //users[msg.toId - 1].emit("msg-send", msg);
    })

    socket.on("disconnect",()=>{
        console.log(socket.username +"-"+socket.id+ " disconnected");
        users.splice(users.indexOf(socket),1);
    })
})

//server
app.use(express.static(base_path));

app.get('/index', (req, res) => {
    res.sendFile(path.join(base_path, "index.html"));
})

app.get("/messages", (req, res) => {
    const json_path = path.join(__dirname,"data","messages.json");
    let data = JSON.parse(fs.readFileSync(json_path).toString());
    data.forEach(element=>{
        if (element.id == req.query.id) {res.status(200).send(element.messages);}
    })
})

app.get("/users", (req, res)=>{
    const users = JSON.parse(fs.readFileSync(path.join(__dirname,"data","users.json")).toString());
    res.status(200).send(users);
})

server.listen(3000, () => {
    console.log("Listening on 3000...");
});


//functions

function saveMessage(msg) {
    const json_path = path.join(__dirname,"data","messages.json");
    let data = JSON.parse(fs.readFileSync(json_path).toString());
    data.forEach(element=>{
        if (element.id == msg.toId || element.id == msg.user_id) {
            element.messages.push(msg);
        }
    })
    
    fs.writeFileSync(json_path,JSON.stringify(data));
}
