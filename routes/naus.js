import { Router } from 'express';
import { readData, writeData } from '../data.js';
import { requireLogin } from '../auth-middleware.js';

const router = Router();

// Neteja el text i evita problemes si no és una cadena.
const text = (valor) => (typeof valor === 'string' ? valor.trim() : '');

// Cal iniciar sessió per accedir a aquestes rutes.
router.use(['/naus', '/crearNau', '/editNau'], requireLogin);

const estats = ['En servei', 'En reparació', 'Retirada'];

// Busca un id nou que no es repeteixi.
const nouId = (llista) => {
    return llista.length ? Math.max(...llista.map(n => n.id)) + 1 : 1;
};

// Comprova les dades de la nau i retorna l'error, si n'hi ha.
const validarNau = (body, naus, personatges, idActual) => {
    const nom = text(body.nom);
    const registre = text(body.registre);
    const classe = text(body.classe);
    const capacitat = Number(body.capacitat);
    const tripulacio = Number(body.tripulacio);

    if (!nom || !registre || !classe) {
        return 'El nom, el registre i la classe són obligatoris';
    }
    if (!estats.includes(body.estat)) {
        return 'L\'estat de la nau no és vàlid';
    }
    if (!Number.isInteger(capacitat) || capacitat <= 0 || !Number.isInteger(tripulacio) || tripulacio <= 0) {
        return 'La capacitat i la tripulació han de ser nombres enters més grans que 0';
    }

    // El nom i el registre han de ser únics.
    const repetida = naus.some(n =>
        n.id !== idActual &&
        (n.nom.toLowerCase() === nom.toLowerCase() || n.registre.toLowerCase() === registre.toLowerCase())
    );
    if (repetida) {
        return 'Ja existeix una nau amb aquest nom o registre';
    }
    // La tripulació ha de poder comptar els personatges assignats.
    const assignats = personatges.filter(p => p.nauId === idActual).length;

    // No es pot retirar una nau amb persona
    // tges assignats.
    if (body.estat === 'Retirada' && assignats > 0) {
        return 'No es pot retirar una nau que té personatges assignats';
    }
    return null;
};

// Prepara les dades del formulari per desar-les.
const crearObjecteNau = (body) => {
    return {
        nom: text(body.nom),
        registre: text(body.registre),
        classe: text(body.classe),
        capacitat: Number(body.capacitat),
        estat: body.estat,
    };
};

// Mostra totes les naus.
router.get('/naus', (req, res) => {
    const naus = readData('Naus');
    const personatges = readData('Personatges');

    // Compta els personatges assignats a cada nau.
    const llista = naus.map(n => ({
        ...n,
        assignats: personatges.filter(p => p.nauId === n.id).length,
    }));

    res.render('naus', { naus: llista, error: null });
});

// Mostra el formulari per crear una nau.
router.get('/crearNau', (req, res) => {
    res.render('crear_nau', { nau: { estat: 'En servei' }, estats, error: null });
});

// Crea una nau.
router.post('/naus', (req, res) => {
    const naus = readData('Naus');
    const personatges = readData('Personatges');

    const error = validarNau(req.body, naus, personatges, null);
    if (error) {
        return res.status(400).render('crear_nau', { nau: req.body, estats, error });
    }

    const newNau = {
        id: nouId(naus),
        ...crearObjecteNau(req.body),
    };
    naus.push(newNau);
    writeData('Naus', naus);

    res.redirect('/naus');
});

// Mostra el formulari per editar una nau.
router.get('/editNau/:id', (req, res) => {
    const naus = readData('Naus');
    const id = parseInt(req.params.id, 10);

    const nau = naus.find(n => n.id === id);

    if (!nau) {
        return res.status(404).send('Nau no trobada');
    }

    res.render('edit_nau', { nau, estats, error: null });
});

// Desa els canvis d'una nau.
router.put('/naus/:id', (req, res) => {
    const naus = readData('Naus');
    const personatges = readData('Personatges');
    const id = parseInt(req.params.id, 10);

    const index = naus.findIndex(n => n.id === id);

    if (index === -1) {
        return res.status(404).send('Nau no trobada');
    }

    const error = validarNau(req.body, naus, personatges, id);
    if (error) {
        return res.status(400).render('edit_nau', { nau: { ...req.body, id }, estats, error });
    }

    naus[index] = {
        ...naus[index],
        ...crearObjecteNau(req.body),
    };
    writeData('Naus', naus);

    res.redirect('/naus');
});

// Elimina una nau.
router.delete('/naus/:id', (req, res) => {
    const naus = readData('Naus');
    const personatges = readData('Personatges');
    const id = parseInt(req.params.id, 10);

    const index = naus.findIndex(n => n.id === id);

    if (index === -1) {
        return res.status(404).send('Nau no trobada');
    }

    // No es pot eliminar una nau que encara tingui personatges.
    const assignats = personatges.filter(p => p.nauId === id).length;
    if (assignats > 0) {
        const llista = naus.map(n => ({
            ...n,
            assignats: personatges.filter(p => p.nauId === n.id).length,
        }));
        return res.status(409).render('naus', {
            naus: llista,
            error: `No es pot eliminar ${naus[index].nom}: té ${assignats} personatges assignats`,
        });
    }

    naus.splice(index, 1);
    writeData('Naus', naus);

    res.redirect('/naus');
});
export default router;
