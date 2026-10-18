import { Router } from 'express';
import { readData } from '../data.js';

const router = Router();

// Llistat de totes les naus
router.get('/flota', (req, res) => {
    const naus = readData('Naus');
    const personatges = readData('Personatges');

    // Afegim quants personatges té assignats cada nau
    const llista = naus.map(n => ({
        ...n,
        assignats: personatges.filter(p => p.nauId === n.id).length,
    }));

    res.render('flota', { naus: llista, user: req.session.user });
});

// Detall d'una nau amb els personatges que hi ha dins
router.get('/flota/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const nau = readData('Naus').find(n => n.id === id);

    if (!nau) {
        return res.status(404).send('Nau no trobada');
    }

    const personatges = readData('Personatges').filter(p => p.nauId === id);
    res.render('flota_detall', { nau, personatges, user: req.session.user });
});

export default router;