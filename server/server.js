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
    console.log(socket.username +"-"+socket.id+ " connected");
    socket.on("msg-send", (msg) => {
        fs.appendFileSync(path.join(__dirname, "data", "messages.csv"), ";\n" + JSON.stringify(msg));
        users.forEach(element => {
            if (element.id == msg.toId) {                
                element.emit("msg-send", msg);
            }
        });
        //users[msg.toId - 1].emit("msg-send", msg);
    })
})

//server
app.use(express.static(base_path));

app.get('/index', (req, res) => {
    res.sendFile(path.join(base_path, "index.html"));
})

app.get("/messages", (req, res) => {
    res.status(200).send(fs.readFileSync(path.join(__dirname, "data", "messages.csv")));
})

server.listen(3000, () => {
    console.log("Listening on 3000...");
});
