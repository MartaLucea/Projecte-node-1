// Middleware per protegir rutes: si no hi ha usuari a req.session.user, no deixem passar.
// L'usuari es carrega a req.session.user al middleware que hi ha a server.js
export const requireLogin = (req, res, next) => {
    if (!req.session?.user) {
        return res.status(401).render('401');
    }

    next();
};
