import fs from "node:fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const base_path = path.join(__dirname, "..", "client");

fs.writeFileSync(path.join(__dirname,"..","data","messages.json"),'[{"id": 1,"messages": []}, {"id": 2,"messages": []},{"id": 3,"messages": []}]') //reset messages 
console.log("messages cleared")