# NodeJS Login

Egen note:
```javascript
//enable cors
app.use(cors({
'allowedHeaders': ['sessionId', 'Content-Type'],
'exposedHeaders': ['sessionId'],
'origin': '*',
'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
'preflightContinue': false
```

## Beskrivelse
Dette eksempel opretter en token, en lang hashed tilfældig tekststreng, som dels gemmes i en database, og dels gemmes i browserens lager (sessionstorage)

## Trin for trin
1. Opret en tabel i databasen til accestokens. Du skal også have en tabel med brugere
2. Opret et route til login, som tjekker om brugeren findes i databasen. Hvis brugeren findes oprettes en token, som dels gemmes i databasen, og dels returneres til browserens local- eller sessionstorage.
3. Opret en loginformular og en eventlistner, som via et fetch sender logindata til routen.
4. Opret på de sider, typisk admin-siden, et kontrol på om der findes en token i browserens storrage - og send brugeren til siden med login, hvis ikke der er en token.
5. Beskyt alle routes som kræver et login med et kald til funktionen isAuthenticated
6. Opret en funktion som kan logge brugeren af

### Databasen
Vi har brug for at oprette en tabel i databasen til vores login-tokens og selvfølgelig en tabel med vores bruger(e)

Opret en tabel kaldet accestokens
```sql
CREATE TABLE `accesstokens` (
  `id` int(11) NOT NULL,
  `userid` int(11) NOT NULL,
  `token` varchar(600) NOT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `accesstokens`
  ADD PRIMARY KEY (`id`);

  ALTER TABLE `accesstokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

```

Og har du ikke en tabel med brugere, så opret en kaldet users

Her med en bruger kaldet admin med password 1234, som her er hashed med sha1
```sql
CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(30) NOT NULL,
  `password` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `users` (`id`, `username`, `password`) VALUES
(1, 'admin', 'sha1$db4788b0$1$fdb72d43f670f34e23fd2d6f559ed543ad1248c9');

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
```

### Routes
Opret et route til log ind


```javascript
const db = require('../config/sql').connect();
const passwordHash = require('password-hash');
const crypto = require('crypto');
```

```javascript
module.exports = (app) => {
    app.post('/login', (req, res) => {
        if (req.body.password !== '' && req.body.username !== '') {
            console.log(passwordHash.generate(req.body.password));
            db.execute('SELECT id, password FROM users WHERE username = ?', [req.body.username], (selError, rows) => {
                if (passwordHash.verify(req.body.password, rows[0].password)) {
                    crypto.randomBytes(256, (err, buf) => {
                        if (err) return res.status(500).end();
                        else {
                            const token = buf.toString('hex');
                            db.execute('INSERT INTO accesstokens SET userid = ?, token = ?', [rows[0].idusers, token], (insError) => {
                                if (insError) return res.status(500).end();
                                else return res.send({ "ID": rows[0].idusers, "AccessToken": token });
                            });
                        }
                    });
                } else {
                    res.send(401);
                }
            });
        } else {
            res.send(401);
        }
    });
};
```
### Login formular

```html
<!DOCTYPE html>
<html lang="da">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Front med API</title>
</head>

<body>
    <div id="status"></div>
    <nav>
        <ul>
            <li><a href="/">Forside</a></li>
            <li><a href="/login.html">Log ind</a></li>
        </ul>
    </nav>
    <h1>Log ind</h1>
    <form class="loginForm">
        <div><label for="username">Brugernavn</label><input type="text" name="username" id="username"></div>
        <div><label for="password">Adgangskode</label><input type="password" name="password" id="password"></div>
        <button>Log ind!</button>
    </form>
    <button id="logud">log ud</button>

    <script src="./assets/javascripts/loginform.js"></script>
</body>

</html>
```
### Tilhørende js-fil

```javascript
(() => {
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.querySelector('.loginForm');

        form.onsubmit = () => {
            const data = JSON.stringify({
                'username': form.username.value,
                'password': form.password.value
            });

            fetch('http://localhost:1337/login', {
                'method': 'POST',
                'headers': {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                },
                'mode': 'cors',
                'cache': 'default',
                'body': data
            })
                .then((result) => result.json())
                .then((data) => {
                    localStorage.setItem('token', data.AccessToken);
                    localStorage.setItem('userid', data.ID);
                    document.getElementById('status').innerHTML = "Du er nu logget ind ...";
                })
                .catch((err) => {
                    console.log(err);
                });

            return false;
        };
    });
})();

document.getElementById('logud').addEventListener('click', () => {
    if (confirm('Vil du logge af?')) {
        localStorage.clear();
    }
})
```
### Beskyttelse af indhold
I ovenstående har du lavet et login, men endnu ikke beskyttet sider og indhold.

Som en lille service kan du lave et tjek på om der findes en token i localstorage. Hvis der ikke gør kan du sende brugeren til siden med login. Det sikrer dog ikke, at de enkelte routes kan tilgås.
```javascript
document.addEventListener("DOMContentLoaded", event => {
      if (localStorage.getItem('token') === null) {
            window.location.assign('login.html');
      }
      
      ...
      ...

}
```
#### Sikring af routes
De routes som skal beskyttes af et login skal modtage et token og et bruger-id, som valideres inden der sendes data retur.

Informationerne sendes som headers i fetch-kaldet ved get.

```javascript
            fetch('http://localhost:3000/getdata', {
                'method': 'GET',
                'headers': {
                    'Authorization': localStorage.getItem('token'),
                    'userID': localStorage.getItem('userid')
                },
                'mode': 'cors',
                'cache': 'default'
            })
                .then(...
                ...
```
eller med post 
```javascript
    let name = document.querySelector('#productName').value;
    ...
    let Authorization = localStorage.getItem('token');
    let userId = localStorage.getItem('userid');
    let url = `http://localhost:3000/indsert/`;
        let init = {
                method: 'post',
                'headers': {
                    'Authorization': localStorage.getItem('token'),
                    'userID': localStorage.getItem('userid'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    ...
                }),
                cache: 'no-cache'
        };
        let request = new Request(url, init);

        fetch(request)
                .then(...

```

### Kontrol af login-info
Der oprettes en function kaldet isAuthenticated som kaldes i alle beskyttede routes

Opret i en folder kaldet services en js-fil kaldet security
```javascript
const db = require('../config/sql').connect();
const passwordHash = require('password-hash');
const crypto = require('crypto');

/**
 * @module Security
 */
module.exports = {
    /**
     * isAuthenticated
     * Checks request header for valid accesstoken and userID.
     * @param {Object} req - request object
     * @param {Object} res - response object
     * @param {function} next - callback function
     */
    'isAuthenticated': (req, res, next) => {
        console.log(req.header('Authorization').length);
        if (req.header('Authorization') && req.header('userID')) {
            const query = `SELECT token, created
            FROM accesstokens
            WHERE userid = ?
                and token = ?
            ORDER BY created DESC LIMIT 1`;
            db.execute(query, [req.header('userID'), req.header('Authorization')], (error, rows) => {
                if (error) {
                    console.log(error);
                    return res.send(500);
                }
                else if (rows.length === 0) return res.send(401);
                else if (rows.length === 1) {
                    if ((new Date - rows[0].created) > (1000 * 60 * 60)) {
                        db.execute('DELETE FROM accesstokens WHERE token = ?', [rows[0].idaccesstokens], (error) => {
                            return res.send(401);
                        });
                    } else {
                        return next();
                    }
                }
                else return res.send(401);
            });
        } else {
            res.send(401);
        }
    }
};
```
Opret en reference til security.js til de routes som skal beskyttes
```javascript
const security = require('../services/security');
```
Indsæt herefter et kald til funktionen i alle de routes som skal være beskyttet af et login
```javascript
app.post('/products', security.isAuthenticated, (req, res, next) => {...
```