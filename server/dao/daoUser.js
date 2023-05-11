'use strict';
/* Data Access Object (DAO) module for accessing users */

const sqlite = require('sqlite3');
const crypto = require('crypto');

// open the database
const db = new sqlite.Database('database.db', (err) => {
    if(err) throw err;
  });

exports.getUserById = (matricola) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM studenti WHERE matricola = ?';
      db.get(sql, [matricola], (err, row) => {
        if (err) 
          reject(err);
        else if (row === undefined)
          resolve({error: 'Studente non trovato.'});
        else {
          // by default, the local strategy looks for "username": not to create confusion in server.js, we can create an object with that property
          const user = { matricola: row.matricola, email: row.email, nome: row.nome, tipoIscrizione: row.tipoIscrizione };
          resolve(user);
        }
    });
  });
};

exports.getUser = (email, password) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM studenti WHERE email = ?';
      db.get(sql, [email], (err, row) => {
        if (err) { reject(err); }
        else if (row === undefined) { resolve(false); }
        else {
          const user = { matricola: row.matricola, email: row.email, nome: row.nome, tipoIscrizione: row.tipoIscrizione };
          const salt = row.salt;
          crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
            if (err) reject(err);

            const passwordHex = Buffer.from(row.hash, 'hex');
            
            if(!crypto.timingSafeEqual(passwordHex, hashedPassword))
              resolve(false);
            else resolve(user); 
          });
        }
      });
    });
  };
