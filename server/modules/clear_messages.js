import fs from "node:fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const base_path = path.join(__dirname, "..", "client");


let messagesjson = []
const usersjson = JSON.parse(fs.readFileSync(path.join(__dirname,"..","data","users.json")).toString());
usersjson.forEach(element => {
    messagesjson.push({"id":element.id, "messages":[]});
});

fs.writeFileSync(path.join(__dirname,"..","data","messages.json"),JSON.stringify(messagesjson)); //reset messages 
console.log("messages cleared");