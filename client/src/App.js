import "./App.css";
import { ListaCorsi } from './components/ListaCorsi';
import { useState, useEffect } from 'react';
import { NoMatch } from "./components/ListaCorsi";
import { Navigate, useNavigate, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginForm } from './components/loginComponent';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import API from './API';

function App() {
  return (
    <Router>
      <App2 />
    </Router>
  )
}

function App2() {

  const [listaCorsi, setListaCorsi] = useState([]);
  const [listaPianoDiStudi, setListaPianoDiStudi] = useState([]);
  const [listaEliminati, setListaEliminati] = useState([]);
  const [tipoIscrizione, setTipoIscrizione] = useState("full-time");
  const [listaIncompatibili, setListaIncompatibili] = useState([]);
  const [listaIncompPianoStudi, setListaIncompPianoStudi] = useState([]);
  const [totCfu, setTotCfu] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);  // no user is logged in when app loads
  const [user, setUser] = useState({});
  const [message, setMessage] = useState('');

  const [modificaPiano, setModificaPiano] = useState(false);
  const [creaPiano, setCreaPiano] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // here you have the user info, if already logged in
        // TODO: store them somewhere and use them, if needed
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch (err) {
        handleError(err);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    API.getListaCorsi()
      .then((list) => {
        list.sort((a, b) => {
          if (a.nome > b.nome) {
            return 1;
          }
          if (a.nome < b.nome) {
            return -1;
          }
          return 0;
        });
        setListaCorsi(list)
      })
      .catch(err => handleError(err))

    API.getIncompatibili()
      .then((list) => setListaIncompatibili(list))
      .catch(err => handleError(err))
  }, [])

  useEffect(() => {
    if (loggedIn) {
      API.getListaCorsiStudente()
        .then((list) => {
          setListaPianoDiStudi(list);
          updateCfu(list);
          setTipoIscrizione(list[0] ? list[0].tipoIscrizione : "full-time");
        })
        .catch(err => handleError(err))
    }
  }, [loggedIn, user.matricola])

  useEffect(() => {
    if (loggedIn) {
      updateCfu(listaPianoDiStudi);
    }
  }, [listaPianoDiStudi.length, listaPianoDiStudi, loggedIn])
  // aggiunte dipendenza da listaPianoDiStudi per warning

  //Creo lista di corsi incompatibili con i corsi
  //attualmente incompatibili con quelli presenti nel piano di studi
  useEffect(() => {
    if (loggedIn) {
      let list = [];
      listaPianoDiStudi.forEach(c1 => {
        const addCorsi = listaIncompatibili.filter(c2 => c2.codice === c1.codice)
        list = [...list, ...addCorsi]
      })
      setListaIncompPianoStudi(list)
    }
  }, [loggedIn, listaPianoDiStudi.length, listaIncompatibili, listaPianoDiStudi])
  // aggiunte dipendenza da listaPianoDiStudi e listaIncompatibili per warning

  function updateCfu(list) {
    let tot = 0;
    list.map((c) => tot = tot + c.crediti)
    setTotCfu(tot);
  }

  function cancellaPianoDiStudi() {
    API.cancellaPianoDiStudi()
      .then(() => setListaPianoDiStudi([]))
      .catch(err => handleError(err));
  }

  function aggiornaPianoDiStudi() {

    API.cancellaPianoDiStudi()
      .then(() => {

        let list = []
        for (const c of listaPianoDiStudi) {
          list.push({ codice: c.codice, tipoIscrizione: c.tipoIscrizione })
        }
        API.aggiungiCorso(list)
          .then()
          .catch(err => handleError(err));
      })
      .catch(err => handleError(err));
  }

  function handleError(err) {
    console.log(err);
  }

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then(user => {
        setLoggedIn(true);
        setUser(user);
        setMessage('');
        navigate('/');
      })
      .catch(err => {
        setMessage(err);
      })
  }

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser({});
    setListaPianoDiStudi([]);
    setListaIncompPianoStudi([]);
    setCreaPiano(false);
    setModificaPiano(false);
  }

  return (
    <>
      <Container>
        <Row><Col>
          {message ? <Alert variant='danger' onClose={() => setMessage('')} dismissible>{message}</Alert> : false}
        </Col></Row>
      </Container>

      <Routes>
        <Route path='/' element={
          <ListaCorsi doLogOut={doLogOut} user={user} loggedIn={loggedIn} setMessage={setMessage} message={message}
            listaCorsi={listaCorsi} listaPianoDiStudi={listaPianoDiStudi} setListaPianoDiStudi={setListaPianoDiStudi}
            cancellaPianoDiStudi={cancellaPianoDiStudi} totCfu={totCfu} listaIncompatibili={listaIncompatibili}
            listaIncompPianoStudi={listaIncompPianoStudi}
            tipoIscrizione={tipoIscrizione} setTipoIscrizione={setTipoIscrizione}
            modificaPiano={modificaPiano} setModificaPiano={setModificaPiano}
            creaPiano={creaPiano} setCreaPiano={setCreaPiano}
            aggiornaPianoDiStudi={aggiornaPianoDiStudi} listaEliminati={listaEliminati}
            setListaEliminati={setListaEliminati} setListaCorsi={setListaCorsi} />
        } />

        <Route path='/login' element={
          loggedIn ?
            <Navigate to='/' />
            : <LoginForm login={doLogIn} message={message} />} />

        <Route path="*" element={<NoMatch />} />
      </Routes>
    </>
  );
}

export default App;