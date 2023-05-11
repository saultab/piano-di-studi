'use strict';
/* Data Access Object (DAO) module for accessing courses and exams */

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('database.db', (err) => {
  if (err) throw err;
});

// ottieni tutti i corsi dell'offerta formativa
exports.listaCorsi = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT codice, nome, crediti, maxStudenti, codicePropedeutico, (SELECT COUNT(*) FROM pianoDiStudi pds WHERE pds.codice=c.codice) AS iscritti FROM corsi c';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const corsi = rows.map((c) => ({
        codice: c.codice, nome: c.nome, crediti: c.crediti, iscritti: c.iscritti, maxStudenti: c.maxStudenti, codicePropedeutico: c.codicePropedeutico
      }));
      resolve(corsi);
    });
  });
};


// ottieni tutti i corsi del piano di studi dello studente
exports.listaCorsiStudente = (matricola) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT c.codice, nome, crediti, maxStudenti, tipoIscrizione, codicePropedeutico, (SELECT COUNT(*) FROM pianoDiStudi pds WHERE pds.codice=c.codice) AS iscritti FROM corsi c, pianoDiStudi pds WHERE c.codice=pds.codice AND matricola = ?';
    db.all(sql, [matricola], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const corsi = rows.map((c) => ({
        codice: c.codice, nome: c.nome, crediti: c.crediti, iscritti: c.iscritti, maxStudenti: c.maxStudenti, tipoIscrizione: c.tipoIscrizione, codicePropedeutico: c.codicePropedeutico
      }));
      resolve(corsi);
    });
  });
};

// ottieni le informazioni dei corsi incompatibiliti
exports.listaCorsiIncompatibili = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT ci.codiceIncompatibile, ci.codice, c.nome, c.crediti, c.maxStudenti, (SELECT COUNT(*) FROM pianoDiStudi pds WHERE pds.codice=c.codice) AS iscritti FROM corsiIncompatibili ci, corsi c WHERE ci.codiceIncompatibile=c.codice';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const corsi = rows.map((c) => ({
        codiceIncompatibile: c.codiceIncompatibile, codice: c.codice, nome: c.nome, crediti: c.crediti, iscritti: c.iscritti, maxStudenti: c.maxStudenti
      }));
      resolve(corsi);
    });
  });
};

// aggiungi un corso nel piano di studi dello studente
exports.aggiungiCorso = (corso, matricola) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO pianoDiStudi(codice, matricola, tipoIscrizione) VALUES(?, ?, ?)';
    
    db.run(sql, [corso.codice, matricola, corso.tipoIscrizione], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};

// cancella piano di studi di una matricola
exports.deletePiano = (matricola) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM pianoDiStudi WHERE matricola = ?';
    db.run(sql, [matricola], (err) => {
      if (err) {
        reject(err);
        return;
      } else
        resolve(null);
    });
  });
};