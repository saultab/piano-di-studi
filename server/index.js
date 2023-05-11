'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const { check, validationResult } = require('express-validator'); // validation middleware
const dao = require('./dao/daoCorsi'); // module for accessing the DB
const passport = require('passport'); // auth middleware
const session = require('express-session'); // enable sessions
const userDao = require('./dao/daoUser'); // module for accessing the users in the DB
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const cors = require('cors');

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
    function (username, password, done) {
        userDao.getUser(username, password).then((user) => {
            if (!user)
                return done(null, false, { message: 'Attenzione: username e/o password sbagliati.' });

            return done(null, user);
        })
    }
));
// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
    done(null, user.matricola);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((matricola, done) => {
    userDao.getUserById(matricola)
        .then(user => {
            done(null, user); // this will be available in req.user
        }).catch(err => {
            done(err, null);
        });
});

// init express
const PORT = 3001;
const app = express();

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};
app.use(cors(corsOptions)); // NB: Usare solo per sviluppo e per l'esame! Altrimenti indicare dominio e porta corretti

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated())
        return next();

    return res.status(401).json({ error: 'not authenticated' });
}

// set up the session
app.use(session({
    // by default, Passport uses a MemoryStore to keep track of the sessions
    secret: 'a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie',
    resave: false,
    saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());


/*** APIs ***/

// GET /api/corsi
app.get('/api/corsi', async (req, res) => {

    try {
        const corsi = await dao.listaCorsi();
        setTimeout(() => res.json(corsi), 1000);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: `Database error while retrieving courses` }).end();
    }
});

// GET /api/corsi/:pianoDiStudi
app.get('/api/corsi/pianoDiStudi', isLoggedIn, async (req, res) => {
    try {
        const corsi = await dao.listaCorsiStudente(req.user.matricola);
        setTimeout(() => res.json(corsi), 1000);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: `Database error while retrieving courses` }).end();
    }
});

// GET /api/corsi/incompatibili
app.get('/api/incompatibili', async (req, res) => {
    try {
        const corsi = await dao.listaCorsiIncompatibili();
        setTimeout(() => res.json(corsi), 1000);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: `Database error while retrieving courses` }).end();
    }
});

// corso dal codice
// GET /api/corsi/:codice
app.get('/api/corsi/:codice', isLoggedIn, async (req, res) => {
    try {
        const corso = await dao.getCorsoByCodice(req.user.matricola, req.params.codice);
        setTimeout(() => res.json(corso), 1000);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: `Database error while retrieving course` }).end();
    }
});

// POST /api/corsi
app.post('/api/corsi', isLoggedIn, [
    check("corsi.*.codice").isLength({ min: 7, max: 7 }).withMessage('codice dei corsi deve essere di 7 caratteri'),
    check("corsi.*.tipoIscrizione").isLength({ min: 9, max: 9 }).withMessage('tipo iscrizione dei corsi deve essere di 9 caratteri'),
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const corsi = req.body.corsi;
        try {

            let validazione = true;
            let errore = "";

            //Controllo se piano di studi ha senso
            //incompatibilita o propedeuticità

            const listaCorsi = await dao.listaCorsi();
            const listaIncompatibili = await dao.listaCorsiIncompatibili();
            const listaPianoDiStudiVecchia = await dao.listaCorsiStudente(req.user.matricola);

            let listaIncompPianoStudi = [];
            corsi.forEach(c1 => {
                const addCorsi = listaIncompatibili.filter(c2 => c2.codice === c1.codice)
                listaIncompPianoStudi = [...listaIncompPianoStudi, ...addCorsi]
            })

            if (listaPianoDiStudiVecchia.length !== 0) {
                validazione = false;
                errore = "Piano di studi già esistente!"
            }

            //Controllo se ho lo stesso corso più volte
            for (const c1 of corsi) {
                let cont = 0;
                for (const c2 of corsi)
                    if (c2.codice === c1.codice)
                        cont++;

                if (cont > 1) {
                    validazione = false;
                    errore = "E' presente più di una volta lo stesso corso nel piano di studi!"
                }
            }

            //Controllo se ho un corso incompatibile
            for (const c2 of listaIncompPianoStudi) {
                let trovatoIncompatibile = false;

                for (const c3 of corsi)
                    if (c2.codiceIncompatibile === c3.codice)
                        trovatoIncompatibile = true;

                if (trovatoIncompatibile === true) {
                    validazione = false;
                    errore = "Corsi incompatibili nel piano di studi!"
                }
            }

            //Controllo se non ho un corso propedeutico
            for (const c1 of corsi) {
                for (const c2 of listaCorsi) {
                    if (c2.codice === c1.codice && c2.codicePropedeutico !== "") {

                        let trovatoPropedeutico = false;

                        for (const c3 of corsi)
                            if (c3.codice === c2.codicePropedeutico)
                                trovatoPropedeutico = true;


                        if (trovatoPropedeutico === false) {
                            validazione = false;
                            errore = "Corso propedeutico assente nel piano di studi!"
                        }
                    }
                }
            }

            //Controllo numero di iscrittiì
            for (const c1 of corsi)
                for (const c2 of listaCorsi)
                    if (c2.codice === c1.codice && c2.iscritti >= c2.maxStudenti) {
                        validazione = false;
                        errore = "Corso con posti esauriti!"
                    }

            //Controllo cfu
            let totCfu = 0;

            for (const c1 of corsi)
                for (const c2 of listaCorsi)
                    if (c2.codice === c1.codice)
                        totCfu = totCfu + c2.crediti;

            if (totCfu < 20 || totCfu > 80) {
                validazione = false;
                errore = "Numero di cfu errato!"
            }

            if (corsi[0].tipoIscrizione === "full-time" && (totCfu < 40 || totCfu > 80)) {
                validazione = false;
                errore = "Numero di cfu errato!"
            }

            if (corsi[0].tipoIscrizione === "part-time" && (totCfu < 20 || totCfu > 40)) {
                validazione = false;
                errore = "Numero di cfu errato!"
            }

            if (validazione === true) {
                const promiseList = [];
                for (const c of corsi) {
                    promiseList.push(dao.aggiungiCorso(c, req.user.matricola))
                }
                await Promise.all(promiseList);
                res.status(201).end();
            }
            else {
                res.status(422).json({ error: `${errore}.` });
            }
        } catch (err) {
            res.status(503).json({ error: `Database error during the added of course.` });
        }
    });

// DELETE /api/corsi
//Cancella tutti i corsi di una matricola
app.delete('/api/corsi', isLoggedIn, async (req, res) => {

    //Controllo se esiste un piano di studi per quella matricola
    const result = await dao.listaCorsiStudente(req.user.matricola)
    if (result.error)
        res.status(404).json(result);
    else {
        try {
            await dao.deletePiano(req.user.matricola);
            res.status(204).end();
        } catch (err) {
            res.status(503).json({ error: `Database error during the deletion of courses ${req.user.matricola}.` });
        }
    }
});


/*** Users APIs ***/

// POST /sessions
// login
app.post('/api/sessions', function (req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            // display wrong login messages
            return res.status(401).json(info);
        }
        // success, perform the login
        req.login(user, (err) => {
            if (err)
                return next(err);

            // req.user contains the authenticated user, we send all the user info back
            // this is coming from userDao.getUser()
            return res.json(req.user);
        });
    })(req, res, next);
});

// DELETE /sessions/current
// logout
app.delete('/api/sessions/current', (req, res) => {
    req.logout(() => { res.end(); });
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    }
    else
        res.status(401).json({ error: 'Unauthenticated user!' });;
});

/*** Other express-related instructions ***/

// Activate the server
app.listen(PORT, () => { console.log(`react-score-server listening at http://localhost:${PORT}/`) });