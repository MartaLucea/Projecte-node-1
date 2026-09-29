import express from "express";
import fs from "fs";
import bodyParser from "body-parser"; 

const app = express();
app.use(bodyParser.json());

const readData = () => {
    try {
        const data = fs.readFileSync("./db/db.json");
        return JSON.parse(data);
    } catch (error) {
        console.log(error);
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync("./db.json", JSON.stringify(data, null, 2));
    } catch (error) {
        console.log(error);
    }
};

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.set('views', './views');

app.get("/", (req, res) => {
    const data = readData();
    res.json(data);
});

app.get("/personatges", (req, res) => {
    const data = readData();
    res.json(data.personatges || []);
});

app.get("/personatges/:id", (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const personatge = data.personatges.find((p) => p.id === id);
    res.json(personatge);
});

app.get("/naus", (req, res) => {
    const data = readData();
    res.json(data.naus || []);
});

app.get("/naus/:id", (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const nau = data.naus.find((n) => n.id === id);
    res.json(nau);
});

app.post("/personatges", (req, res) => {
    const data = readData();
    const body = req.body;
    const newPersonatge = {
        id: data.personatges.length + 1,
        ...body,
    };
    data.personatges.push(newPersonatge);
    writeData(data);
    res.json(newPersonatge);
});

app.post("/naus", (req, res) => {
    const data = readData();
    const body = req.body;
    const newNau = {
        id: data.naus.length + 1,
        ...body,
    };
    data.naus.push(newNau);
    writeData(data);
    res.json(newNau);
});

app.put("/personatges/:id", (req, res) => {
    const data = readData();
    const body = req.body;
    const id = parseInt(req.params.id);
    const index = data.personatges.findIndex((p) => p.id === id);
    data.personatges[index] = {
        ...data.personatges[index],
        ...body,
    };
    writeData(data);
    res.json({ message: "Personatge actualitzat correctament" });
});

app.put("/naus/:id", (req, res) => {
    const data = readData();
    const body = req.body;
    const id = parseInt(req.params.id);
    const index = data.naus.findIndex((n) => n.id === id);
    data.naus[index] = {
        ...data.naus[index],
        ...body,
    };
    writeData(data);
    res.json({ message: "Nau actualitzada correctament" });
});

app.delete("/personatges/:id", (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const index = data.personatges.findIndex((p) => p.id === id);
    data.personatges.splice(index, 1);
    writeData(data);
    res.json({ message: "Personatge eliminat correctament" });
});

app.delete("/naus/:id", (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const index = data.naus.findIndex((n) => n.id === id);
    data.naus.splice(index, 1);
    writeData(data);
    res.json({ message: "Nau eliminada correctament" });
});

app.listen(3000, () => {
    console.log("Server listing on port 3000");
});