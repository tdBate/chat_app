import express from "express";
import path from "path";
import { fileURLToPath } from 'url';

//test mode on/off
const test_mode = true;
let test_path = "";
if (test_mode) test_path = "test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const base_path = path.join(__dirname, "..","client",test_path);

//server
const app = express();
app.use(express.static(base_path));

app.get('/index',(req,res)=>{
    res.sendFile(path.join(base_path,"index.html"));
})

app.get("/messages",(req,res)=>{
    res.status(200).send({"message":"tiktos üzenet"});
})

app.listen(3000, () => {
    console.log("Listening on 3000...");
});
