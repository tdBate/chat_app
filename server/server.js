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
    const usersjson = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "users.json")).toString());
    for (const element of usersjson) {
        if (element.username == username && element.password == password) {
            socket.username = username;
            socket.id = element.id;
            next();
            return;
        }
    };

})

let users = [];
io.on("connection", (socket) => {
    const id = users.push(socket);
    socket.emit("send-id-init", socket.id);
    console.log(socket.username + "-" + socket.id + " connected");
    socket.broadcast.emit("user-connected", socket.id);

    //message send
    socket.on("msg-send", (msg) => {
        if (!msg.message) return;
        users.forEach(element => {
            if (element.id == msg.toId) {
                element.emit("msg-send", msg);
            }
        });
        saveMessage(msg);
        //users[msg.toId - 1].emit("msg-send", msg);
    })

    socket.on("disconnect", () => {
        users.splice(users.indexOf(socket), 1);

        if (!users.some(element=>element.id == socket.id)) {
            console.log(socket.username + "-" + socket.id + " disconnected");
            socket.broadcast.emit("user-disconnected", socket.id);
        }
        
    })
})

//server
app.use(express.static(base_path));

app.get('/index', (req, res) => {
    res.sendFile(path.join(base_path, "index.html"));
})

app.get("/messages", (req, res) => {
    const json_path = path.join(__dirname, "data", "messages.json");
    let data = JSON.parse(fs.readFileSync(json_path).toString());
    data.forEach(element => {
        if (element.id == req.query.id) { res.status(200).send(element.messages); }
    })
})

app.get("/users", (req, res) => {
    const usersjson = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "users.json")).toString());
    res.status(200).send(usersjson);
})

app.get("/isuseractive", (req, res) => {
    if (users.some(user => user.id == req.query.id)) { res.status(200).send(true); return; }
    res.status(200).send(false);
})

app.get("/register", (req, res) => {
    const username = req.query.username;
    const password = req.query.password;
    if (!username || !password) { res.status(405).send("denied"); return;}

    const usersjson = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "users.json")));
    if (usersjson.some(user=>username==user.username)) {res.status(405).send("denied"); return;}

    //generate id
    let id;
    while (true) {
        id = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
        if (!usersjson.some(user=>user.id == id)) {break;}
    }

    usersjson.push({"username": username, "password":password, "id":id});
    fs.writeFileSync(path.join(__dirname, "data", "users.json"),JSON.stringify(usersjson));

    //add to messages.json
    const json_path = path.join(__dirname, "data", "messages.json");
    let data = JSON.parse(fs.readFileSync(json_path).toString());
    data.push({"id":id,"messages":[]})
    fs.writeFileSync(json_path,JSON.stringify(data));

    io.emit("new-user");
    res.status(200).send("registered");
})

server.listen(3000, () => {
    console.log("Listening on 3000...");
});


//functions

function saveMessage(msg) {
    const json_path = path.join(__dirname, "data", "messages.json");
    let data = JSON.parse(fs.readFileSync(json_path).toString());
    data.forEach(element => {
        if (element.id == msg.toId || element.id == msg.user_id) {
            element.messages.push(msg);
        }
    })

    fs.writeFileSync(json_path, JSON.stringify(data));
}
