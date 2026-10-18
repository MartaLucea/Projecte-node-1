# Sistema d'autenticació i CRUD

Aplicació web desenvolupada amb Node.js, Express i EJS per gestionar una flota de naus i els seus personatges. Inclou registre i inici de sessió amb JWT, i protegeix les operacions CRUD perquè només les puguin fer usuaris autenticats.

## Funcionalitats

- Registre d'usuaris i inici i tancament de sessió.
- Contrasenyes protegides amb hash mitjançant `bcryptjs`.
- Autenticació amb JWT signat, guardat en una cookie `httpOnly`, `sameSite: strict` i d'una hora de durada. L'opció `secure` s'activa en entorns de producció.
- Middleware que valida el JWT i carrega l'usuari a `req.session.user`.
- CRUD complet de naus i personatges, amb interfície EJS.
- Persistència dels recursos en fitxers JSON dins de `db/`; usuaris gestionats amb `db-local`.
- Validacions i regles de negoci per mantenir coherents les dades de naus i tripulacions.

## Requisits i posada en marxa

Cal tenir instal·lat Node.js 18 o superior.

```bash
npm install
npm run dev
```

El servidor s'inicia a <http://localhost:3000>. També es pot executar amb `npm start`.

La configuració es troba a `config.js`. Abans de desplegar l'aplicació, defineix `SECRET_JWT_KEY` amb un valor secret i propi de l'entorn; el valor inclòs al codi és només per a desenvolupament. També es poden configurar `PORT` i `SALT_ROUNDS`.

PowerShell:

```powershell
$env:SECRET_JWT_KEY = "posa-hi-un-secret-propi"
$env:PORT = "3000"
npm start
```

## Autenticació

1. A la pàgina d'inici (`/`) hi ha els formularis d'inici de sessió i de registre un al costat de l'altre; l'usuari tria el que vol fer. El registre demana un nom d'usuari d'almenys 3 caràcters i una contrasenya d'almenys 6.
2. En iniciar sessió correctament, el servidor crea un JWT amb una caducitat d'una hora i el desa a la cookie `access_token`.
3. El middleware valida la cookie a cada petició. Si falta o el token ha caducat, les rutes protegides responen amb la pàgina d'error 401.
4. Per tancar la sessió, s'envia una petició `POST` a `/logout`, que elimina la cookie.

## Rutes

Les rutes de naus i personatges requereixen autenticació. Els formularis de la web utilitzen EJS i les operacions d'actualització i eliminació fan servir `PUT` i `DELETE` mitjançant `method-override`.

### Autenticació i pàgines

| Mètode | Ruta | Descripció | Accés |
| --- | --- | --- | --- |
| `GET` | `/` | Pàgina d'inici amb els formularis d'inici de sessió i de registre | Públic |
| `POST` | `/register` | Crea un usuari | Públic |
| `POST` | `/login` | Valida les credencials i crea la cookie JWT | Públic |
| `POST` | `/logout` | Tanca la sessió i elimina la cookie | Públic |
| `GET` | `/protected` | Mostra informació protegida de naus i personatges | Autenticat |
| `GET` | `/profile` | Pàgina del perfil | Autenticat |

### Naus

| Mètode | Ruta | Descripció |
| --- | --- | --- |
| `GET` | `/naus` | Llista les naus |
| `GET` | `/crearNau` | Mostra el formulari de creació |
| `POST` | `/naus` | Crea una nau |
| `GET` | `/editNau/:id` | Mostra el formulari d'edició |
| `PUT` | `/naus/:id` | Actualitza una nau |
| `DELETE` | `/naus/:id` | Elimina una nau |

### Personatges

| Mètode | Ruta | Descripció |
| --- | --- | --- |
| `GET` | `/personatges` | Llista els personatges |
| `GET` | `/crearPersonatge` | Mostra el formulari de creació |
| `POST` | `/personatges` | Crea un personatge |
| `GET` | `/editPersonatge/:id` | Mostra el formulari d'edició |
| `PUT` | `/personatges/:id` | Actualitza un personatge |
| `DELETE` | `/personatges/:id` | Elimina un personatge |

## Validacions i regles de negoci

- Les dades requerides i els valors de rang i estat s'han de validar abans de desar-se.
- No es permeten noms duplicats de naus o personatges ni registres de nau repetits.
- La tripulació d'una nau no pot superar la seva capacitat ni quedar per sota dels personatges que hi té assignats.
- No es pot retirar ni eliminar una nau que tingui personatges assignats.
- Cada personatge ha d'estar assignat a una nau existent i no retirada, i la nau no pot superar el nombre de tripulants establert.

## Dades i estructura

- `db/Naus.json` i `db/Personatges.json`: dades de mostra i persistència dels CRUD.
- `db/User.json`: persistència dels usuaris mitjançant `db-local`.
- `routes/`: rutes i lògica CRUD de cada recurs.
- `views/`: plantilles EJS.
- `public/`: fulls d'estil i JavaScript del navegador.
- `auth-middleware.js`: protecció de les rutes autenticades.
- `user-repository.js`: registre, validació i inici de sessió.
- `proves.http`: peticions d'exemple i proves amb l'extensió REST Client de VS Code.

## Proves

1. Engega el servidor amb `npm run dev`.
2. Obre `proves.http` a VS Code i executa les peticions per blocs. Registra o utilitza un usuari existent i inicia sessió per obtenir el token.
3. Les peticions protegides del fitxer utilitzen el token com a cookie `access_token`. Comprova tant els casos correctes com els errors d'autenticació i de validació indicats als comentaris del fitxer.
