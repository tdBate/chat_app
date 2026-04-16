import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { Socket, Server } from "socket.io";
import http from "http"


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const base_path = path.join(__dirname, "..","client");

//server init
const app = express();
const server = http.createServer(app);
const io = new Server(server);

//socket-io
io.on("connection",(socket)=>{
    socket.on("msg-send",(msg)=>{
        io.emit("msg-send",msg);
    })
})

//server
app.use(express.static(base_path));

app.get('/index',(req,res)=>{
    res.sendFile(path.join(base_path,"index.html"));
})

app.get("/messages",(req,res)=>{
    res.status(200).send({"message":"tiktos üzenet"});
})

server.listen(3000, () => {
    console.log("Listening on 3000...");
});
