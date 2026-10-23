# Sistema complet amb autenticació i CRUD

Aplicació web amb **Node.js**, **Express** i **EJS** per gestionar una flota de naus de Star Trek i els seus personatges. Té registre i inici de sessió amb **JWT** i dos CRUD complets (**Naus** i **Personatges**) que només poden fer servir els usuaris autenticats.

## Tecnologies

- Node.js + Express 5
- EJS (plantilles)
- `bcryptjs` (hash de contrasenyes)
- `jsonwebtoken` (JWT) + `cookie-parser`
- `method-override` (PUT i DELETE des dels formularis)
- Dades en fitxers `.json` (`db/`)

## Estructura del projecte

```
├── server.js              # Servidor, middleware JWT i rutes d'autenticació
├── config.js              # PORT, SALT_ROUNDS, SECRET_JWT_KEY
├── auth-middleware.js     # requireLogin: protegeix les rutes
├── user-repository.js     # Registre i login d'usuaris (bcrypt)
├── data.js                # Lectura/escriptura dels JSON
├── routes/                # naus.js, personatges.js, flota.js
├── views/                 # Plantilles EJS
├── public/                # CSS i JS del navegador
├── db/                    # User.json, Naus.json, Personatges.json (dades d'exemple)
├── captures/              # Captures de les proves
└── proves.http            # Proves amb REST Client
```

## Posada en marxa

```bash
npm install
npm run dev
```

El servidor arrenca a <http://localhost:5000>.

Variables opcionals (a `config.js`): `PORT`, `SALT_ROUNDS` i `SECRET_JWT_KEY` (canvia-la en producció).

## Autenticació

- `POST /register`: crea un usuari (nom mínim 3 caràcters, contrasenya mínima 6). La contrasenya es guarda encriptada amb **bcrypt**.
- `POST /login`: valida les credencials i genera un **JWT que caduca en 1 hora**.
- El token es guarda en una **cookie** `access_token` amb `httpOnly`, `sameSite: strict` i `secure` (en producció).
- Un middleware valida el token a cada petició i carrega l'usuari a `req.session.user`.
- `POST /logout`: elimina la cookie.
- `GET /protected` i `GET /profile`: pàgines només per a usuaris autenticats.
- Sense sessió, les rutes protegides responen **401**.

## Rutes

### Públiques

| Mètode | Ruta | Descripció |
| --- | --- | --- |
| GET | `/` | Pàgina d'inici amb login i registre |
| POST | `/register` | Registre d'usuari |
| POST | `/login` | Inici de sessió |
| POST | `/logout` | Tancar sessió |
| GET | `/flota`, `/flota/:id` | Llistat i detall de la flota |

### Protegides (cal estar autenticat)

| Mètode | Ruta | Descripció |
| --- | --- | --- |
| GET | `/protected` | Pàgina privada |
| GET | `/profile` | Perfil de l'usuari |
| GET | `/naus` | Llistar naus |
| GET | `/crearNau` | Formulari de creació |
| POST | `/naus` | Crear nau |
| GET | `/editNau/:id` | Formulari d'edició |
| PUT | `/naus/:id` | Actualitzar nau |
| DELETE | `/naus/:id` | Eliminar nau |
| GET | `/personatges` | Llistar personatges |
| GET | `/crearPersonatge` | Formulari de creació |
| POST | `/personatges` | Crear personatge |
| GET | `/editPersonatge/:id` | Formulari d'edició |
| PUT | `/personatges/:id` | Actualitzar personatge |
| DELETE | `/personatges/:id` | Eliminar personatge |

## Regles de negoci

- Només els usuaris autenticats poden accedir als CRUD.
- El nom i el registre d'una nau són únics; el nom d'un personatge també.
- L'estat de la nau ha de ser `En servei`, `En reparació` o `Retirada`.
- No es pot retirar ni eliminar una nau amb personatges assignats.
- Un personatge ha d'estar assignat a una nau existent i no retirada.
- Una nau no pot tenir més personatges que la seva capacitat.

## Dades d'exemple

Els fitxers `db/Naus.json`, `db/Personatges.json` i `db/User.json` contenen dades d'exemple.

## Proves

Les proves s'han fet amb **REST Client** (VS Code) usant el fitxer `proves.http`.

### 1. Registre d'usuari
#### Registre correcte
![Registre correcte](captures/01-registre-ok.png)

#### Registre amb usuari duplicat (400)
![Registre amb usuari duplicat (400)](captures/02-registre-duplicat.png)

#### Registre amb dades invàlides (contrasenya curta)
![Registre amb dades invàlides (contrasenya curta)](captures/03-contrasenya-curta.png)

### 2. Login
#### Login incorrecte (401)
![Login incorrecte (401)](captures/04-login-error.png)

#### Login correcte i cookie access_token
![Login correcte i cookie access_token](captures/05-login-ok.png)

### 3. Accés a rutes protegides
#### Sense login: 401
![Sense login: 401](captures/06-naus-sense-login.png)

#### Amb login: 200
![Amb login: 200](captures/07-naus-amb-login.png)

### 4. CRUD de naus
#### Crear nau (302)
![Crear nau (302)](captures/08-crear-nau.png)

#### Crear nau duplicada (400)
![Crear nau duplicada (400)](captures/09-nau-duplicada.png)

#### Editar nau
![Editar nau](captures/10-editar-nau.png)

#### Eliminar nau amb personatges (409)
![Eliminar nau amb personatges (409)](captures/11-eliminar-nau-409.png)

### 5. CRUD de personatges
#### Crear personatge
![Crear personatge](captures/12-crear-personatge.png)

#### Personatge en nau inexistent (400)
![Personatge en nau inexistent (400)](captures/13-personatge-error.png)

#### Editar personatge
![Editar personatge](captures/14-editar-personatge.png)

#### Eliminar personatge
![Eliminar personatge](captures/15-eliminar-personatge.png)

### 6. Logout

![Logout](captures/16-logout.png)

### 7. Interfície EJS

#### Pàgina d'inici
![Pàgina d'inici](captures/17-index.png)

#### Pàgina protegida
![Pàgina protegida](captures/18-protected.png)

#### Perfil
![Perfil](captures/19-profile.png)