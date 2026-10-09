import { Router } from 'express';
import fs from 'node:fs';

const router = Router();

const readData = () => {
    const data = fs.readFileSync('./db/db.json', 'utf8');
    return JSON.parse(data);
};

const writeData = (data) => {
    fs.writeFileSync(
        './db/db.json',
        JSON.stringify(data, null, 2),
        'utf8'
    );
};

router.use((req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/register');
    }

    next();
});

router.get("/personatges", (req, res) => {
    const data = readData();
    res.render('personatges', { personatges: data.personatges || [] });
});

router.get("/personatges/:id", (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id, 10);

    const personatge = data.find(p => p.id === id);

    if (!personatge) {
        return res.status(404).send('Personatge not found');
    }

    res.render('edit_personatge', { personatge });
});

router.post("/personatges", (req, res) => {
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

router.put("/personatges/:id", (req, res) => {
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

router.delete("/personatges/:id", (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const index = data.personatges.findIndex((p) => p.id === id);
    data.personatges.splice(index, 1);
    writeData(data);
    res.json({ message: "Personatge eliminat correctament" });
});


export default router;