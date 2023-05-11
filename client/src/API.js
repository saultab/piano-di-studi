/**
 * All the API calls
 */

const URL = 'http://localhost:3001/api'

async function getListaCorsi() {
  // call  /api/corsi
  const response = await fetch((URL + '/corsi'));
  const corsiJson = await response.json();
  if (response.ok) {
    return corsiJson.map((c) => ({
      codice: c.codice, nome: c.nome, crediti: c.crediti, iscritti: c.iscritti, maxStudenti: c.maxStudenti ? c.maxStudenti : false, codicePropedeutico: c.codicePropedeutico
    }))
  } else {
    throw corsiJson;  // mi aspetto che sia un oggetto json fornito dal server che contiene l'errore
  }
}

async function getIncompatibili() {
  // call  /api/incompatibili
  const response = await fetch((URL + '/incompatibili'));;
  const corsiJson = await response.json();
  if (response.ok) {
    return corsiJson.map((c) => ({ 
      codiceIncompatibile: c.codiceIncompatibile, codice: c.codice, nome: c.nome, crediti: c.crediti, iscritti: c.iscritti, maxStudenti: c.maxStudenti
    }))
  } else {
    throw corsiJson;  // mi aspetto che sia un oggetto json fornito dal server che contiene l'errore
  }
}

async function getListaCorsiStudente() {
  // call  /api/corsi/pianoDiStudi
  const response = await fetch((URL + '/corsi/pianoDiStudi'), { credentials: 'include' });;
  const corsiJson = await response.json();
  if (response.ok) {
    return corsiJson.map((c) => ({ 
      codice: c.codice, nome: c.nome, crediti: c.crediti, iscritti: c.iscritti, maxStudenti: c.maxStudenti,
      tipoIscrizione: c.tipoIscrizione, codicePropedeutico: c.codicePropedeutico, status: "persistente"
    }))
  } else {
    throw corsiJson;  // mi aspetto che sia un oggetto json fornito dal server che contiene l'errore
  }
}

function cancellaPianoDiStudi() {
  // call: DELETE /api/corsi
  return new Promise((resolve, reject) => {
    fetch(URL + '/corsi', {
      method: 'DELETE',
      credentials: 'include',
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

function aggiungiCorso(corsi) {
  // call: POST /api/corsi
  return new Promise((resolve, reject) => {
    fetch(URL + '/corsi', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        corsi: corsi
      }),
    })
      .then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          // analyze the cause of error
          response.json()
            .then((message) => { reject(message); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        }
      }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

async function logIn(credentials) {
  let response = await fetch(URL + '/sessions', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}

async function logOut() {
  await fetch(URL + '/sessions/current', { method: 'DELETE', credentials: 'include' });
}

async function getUserInfo() {
  const response = await fetch(URL + '/sessions/current', { credentials: 'include' });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server
  }
}

const API = { getListaCorsi, getListaCorsiStudente, getIncompatibili, cancellaPianoDiStudi, aggiungiCorso, logIn, logOut, getUserInfo };
export default API;