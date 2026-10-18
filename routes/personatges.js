import { Router } from 'express';
import { readData, writeData } from '../data.js';
import { requireLogin } from '../auth-middleware.js';

const router = Router();

const text = (valor) => (typeof valor === 'string' ? valor.trim() : '');

router.use(['/personatges', '/crearPersonatge', '/editPersonatge'], requireLogin);

const rangs = ['Cadet', 'Alferes', 'Tinent', 'Tinent comandant', 'Comandant', 'Capità', 'Almirall', 'Civil'];

const nouId = (llista) => {
    return llista.length ? Math.max(...llista.map(p => p.id)) + 1 : 1;
};

// Comprova les dades del personatge i retorna l'error, si n'hi ha.
const validarPersonatge = (body, naus, personatges, idActual) => {
    const nom = text(body.nom);
    const especie = text(body.especie);
    const planeta = text(body.planeta);
    const nauId = parseInt(body.nauId, 10);

    if (!nom || !especie || !planeta) {
        return 'El nom, l\'espècie i el planeta són obligatoris';
    }
    if (!rangs.includes(body.rang)) {
        return 'El rang no és vàlid';
    }
    // Cada personatge ha de tenir un nom únic.
    const repetit = personatges.some(p => p.id !== idActual && p.nom.toLowerCase() === nom.toLowerCase());
    if (repetit) {
        return 'Ja existeix un personatge amb aquest nom';
    }
    // Comprova que la nau existeixi.
    const nau = naus.find(n => n.id === nauId);
    if (!nau) {
        return 'La nau seleccionada no existeix';
    }
    // Una nau retirada no pot tenir tripulació.
    if (nau.estat === 'Retirada') {
        return `${nau.nom} està retirada i no pot tenir tripulació`;
    }
    // La nau ha de tenir lloc per a aquest personatge (sense comptar-lo si l'editem).
    const assignats = personatges.filter(p => p.nauId === nauId && p.id !== idActual).length;
    if (assignats >= nau.tripulacio) {
        return `${nau.nom} ja té la tripulació completa (${nau.tripulacio})`;
    }
    return null;
};

// Prepara les dades del formulari per desar-les.
const crearObjectePersonatge = (body) => {
    return {
        nom: text(body.nom),
        especie: text(body.especie),
        planeta: text(body.planeta),
        rang: body.rang,
        nauId: parseInt(body.nauId, 10),
    };
};

// Mostra tots els personatges.
router.get('/personatges', (req, res) => {
    const naus = readData('Naus');
    const personatges = readData('Personatges');

    // Afegeix el nom de la nau a cada personatge.
    const llista = personatges.map(p => ({
        ...p,
        nau: naus.find(n => n.id === p.nauId)?.nom || '—',
    }));

    res.render('personatges', { personatges: llista });
});

// Mostra el formulari per crear un personatge.
router.get('/crearPersonatge', (req, res) => {
    const naus = readData('Naus');
    res.render('crear_personatge', { personatge: {}, naus, rangs, error: null });
});

// Crea un personatge.
router.post('/personatges', (req, res) => {
    const naus = readData('Naus');
    const personatges = readData('Personatges');

    const error = validarPersonatge(req.body, naus, personatges, null);
    if (error) {
        return res.status(400).render('crear_personatge', { personatge: req.body, naus, rangs, error });
    }

    const newPersonatge = {
        id: nouId(personatges),
        ...crearObjectePersonatge(req.body),
    };
    personatges.push(newPersonatge);
    writeData('Personatges', personatges);

    res.redirect('/personatges');
});

// Mostra el formulari per editar un personatge.
router.get('/editPersonatge/:id', (req, res) => {
    const naus = readData('Naus');
    const personatges = readData('Personatges');
    const id = parseInt(req.params.id, 10);

    const personatge = personatges.find(p => p.id === id);

    if (!personatge) {
        return res.status(404).send('Personatge no trobat');
    }

    res.render('edit_personatge', { personatge, naus, rangs, error: null });
});

// Desa els canvis d'un personatge.
router.put('/personatges/:id', (req, res) => {
    const naus = readData('Naus');
    const personatges = readData('Personatges');
    const id = parseInt(req.params.id, 10);

    const index = personatges.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).send('Personatge no trobat');
    }

    const error = validarPersonatge(req.body, naus, personatges, id);
    if (error) {
        return res.status(400).render('edit_personatge', {
            personatge: { ...req.body, id },
            naus,
            rangs,
            error,
        });
    }

    personatges[index] = {
        ...personatges[index],
        ...crearObjectePersonatge(req.body),
    };
    writeData('Personatges', personatges);

    res.redirect('/personatges');
});

// Elimina un personatge.
router.delete('/personatges/:id', (req, res) => {
    const personatges = readData('Personatges');
    const id = parseInt(req.params.id, 10);

    const index = personatges.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).send('Personatge no trobat');
    }

    personatges.splice(index, 1);
    writeData('Personatges', personatges);

    res.redirect('/personatges');
});

export default router;
