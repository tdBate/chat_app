import express from "express";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const base_path = path.join(__dirname, "..","client");

const app = express();
app.use(express.static(base_path));


app.get('/index',(req,res)=>{
    res.sendFile(path.join(base_path,"index.html"));
})

app.listen(3000, () => {
    console.log("Listening on 3000...");
});

