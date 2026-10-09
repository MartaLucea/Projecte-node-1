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

router.get("/naus", (req, res) => {
    const data = readData();
    res.render('naus', { naus: data.naus || [] });
});

router.get("/naus/:id", (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id, 10);

    const nau = data.find(p => p.id === id);

    if (!nau) {
        return res.status(404).send('Nau not found');
    }

    res.render('edit_product', { product });
});

router.post("/naus", (req, res) => {
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

router.put("/naus/:id", (req, res) => {
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

router.use((req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/');
    }

    next();
});


router.delete("/naus/:id", (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const index = data.naus.findIndex((n) => n.id === id);
    data.naus.splice(index, 1);
    writeData(data);
    res.json({ message: "Nau eliminada correctament" });
});

export default router;