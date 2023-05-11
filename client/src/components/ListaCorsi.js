import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Container, Table, Row, Col, Button, Spinner } from "react-bootstrap";
import { FcHighPriority } from "react-icons/fc"
import { Link } from 'react-router-dom';
import React from "react";
import { useState } from "react"
import AggiungiCheck from './AggiungiCheck'
import BarraNavigazione from './BarraNavigazione'
import TastoConferma from './TastoConferma'
import TabellaPiano from './TabellaPiano'

function ListaCorsi(props) {

    const [errore, setErrore] = useState('');
    const [loading, setLoading] = useState(true);
    setTimeout(() => setLoading(false), 1000);

    return (
        <>
            <BarraNavigazione loggedIn={props.loggedIn} doLogOut={props.doLogOut} user={props.user} />

            {loading ?
                <Container align="center" fluid>
                    <Col>
                        <Spinner animation="border" role="status" />
                    </Col>
                    <Col>
                        <h3>Caricamento...</h3>
                    </Col>
                </Container>
                :
                props.loggedIn ?
                    <Container>
                        <Row>
                            <Col>
                                <TabellaPiano listaPianoDiStudi={props.listaPianoDiStudi} totCfu={props.totCfu}
                                    listaIncompatibili={props.listaIncompatibili} loggedIn={props.loggedIn}
                                    cancellaPianoDiStudi={props.cancellaPianoDiStudi} setListaEliminati={props.setListaEliminati}
                                    tipoIscrizione={props.tipoIscrizione} setTipoIscrizione={props.setTipoIscrizione}
                                    modificaPiano={props.modificaPiano} setModificaPiano={props.setModificaPiano}
                                    creaPiano={props.creaPiano} listaCorsi={props.listaCorsi} setListaCorsi={props.setListaCorsi}
                                    setListaPianoDiStudi={props.setListaPianoDiStudi} setCreaPiano={props.setCreaPiano}
                                    errore={errore} setErrore={setErrore} listaEliminati={props.listaEliminati} />
                            </Col>

                            <TastoConferma modificaPiano={props.modificaPiano} creaPiano={props.creaPiano}
                                setModificaPiano={props.setModificaPiano} setCreaPiano={props.setCreaPiano}
                                tipoIscrizione={props.tipoIscrizione} setListaPianoDiStudi={props.setListaPianoDiStudi}
                                errore={errore} setErrore={setErrore} aggiornaPianoDiStudi={props.aggiornaPianoDiStudi}
                                listaPianoDiStudi={props.listaPianoDiStudi} setListaEliminati={props.setListaEliminati}
                                listaCorsi={props.listaCorsi} listaEliminati={props.listaEliminati} totCfu={props.totCfu} />
                        </Row>
                    </Container> : false
            }
            <ul></ul>
            {
                !loading ?
                    <>
                        <Container>
                            <Row>
                                <Col>
                                    <TabellaCorsi listaCorsi={props.listaCorsi} listaIncompatibili={props.listaIncompatibili}
                                        loggedIn={props.loggedIn} listaPianoDiStudi={props.listaPianoDiStudi}
                                        listaIncompPianoStudi={props.listaIncompPianoStudi} modificaPiano={props.modificaPiano}
                                        creaPiano={props.creaPiano} setListaPianoDiStudi={props.setListaPianoDiStudi} />
                                </Col>
                            </Row>
                        </Container>
                    </>
                    : false
            }
        </>
    );
}

function TabellaCorsi(props) {
    return (
        <Container fluid className="table-responsive">
            <center>
                <h3>Corsi disponibili:</h3>
                {props.loggedIn ?
                    <>
                        <i className="bi bi-circle-fill text-success"> Corso già presente nel piano di studi</i>
                        &nbsp;	&nbsp;	&nbsp;
                        <i className="bi bi-circle-fill text-danger"> Corso non disponibile</i>
                        &nbsp;	&nbsp;	&nbsp;
                        <i className="bi bi-circle"> Disponibile</i>
                    </>
                    : false
                }

                <Table className="table table-hover table-lg">
                    <thead align="center">
                        <tr>
                            <th>Codice</th><th>Nome</th><th>Crediti</th><th>Iscritti</th><th>maxStudenti</th><th>Info</th>
                            {props.modificaPiano || props.creaPiano ?
                                <th>Aggiungi</th> : false
                            }
                        </tr>
                    </thead>
                    <tbody align="center">
                        {
                            props.listaCorsi.map((corso, i) =>
                                <CorsoRow listaCorsi={props.listaCorsi} key={i} corso={corso}
                                    listaIncompatibili={props.listaIncompatibili} loggedIn={props.loggedIn}
                                    listaPianoDiStudi={props.listaPianoDiStudi} creaPiano={props.creaPiano}
                                    listaIncompPianoStudi={props.listaIncompPianoStudi}
                                    modificaPiano={props.modificaPiano} 
                                    setListaPianoDiStudi={props.setListaPianoDiStudi} />)
                        }
                    </tbody>
                </Table>
            </center>
        </Container>
    );
}

function CorsoRow(props) {
    const [hidden, setHidden] = useState(false);
    return (
        <>
            {props.loggedIn ?
                (
                    //Stampo riga del corso verde se gia presente nel piano di studi
                    props.listaPianoDiStudi
                        .filter(c => c.codice === props.corso.codice).length === 1 ?
                        <tr className="table-success">
                            <CorsoData listaCorsi={props.listaCorsi} corso={props.corso}
                                hidden={hidden} setHidden={setHidden}
                                listaPianoDiStudi={props.listaPianoDiStudi}
                                modificaPiano={props.modificaPiano} creaPiano={props.creaPiano}
                                listaIncompPianoStudi={props.listaIncompPianoStudi}
                                setListaPianoDiStudi={props.setListaPianoDiStudi}
                                listaIncompatibili={props.listaIncompatibili} />
                        </tr>
                        :
                        //Stampo riga del corso rossa se incompatibile con uno presente nel piano di studi
                        //oppure se è richiesto un esame propedeutico che non c'è nel piano di studi
                        //oppure se sono finiti i posti per quel corso
                        //oppure se il propedeutico è stato aggiunto solo temporaneamente

                        props.listaIncompPianoStudi
                            .filter(c => c.codiceIncompatibile === props.corso.codice).length === 1
                            ||
                            (props.corso.codicePropedeutico && props.listaPianoDiStudi
                                .filter(c => c.codice === props.corso.codicePropedeutico).length !== 1
                            )
                            ||
                            (props.corso.iscritti >= props.corso.maxStudenti && props.corso.maxStudenti !== false)
                            ||
                            (props.corso.codicePropedeutico && props.listaPianoDiStudi &&
                                (props.listaPianoDiStudi
                                    .find((c) => c.codice === props.corso.codicePropedeutico).status === "temporaneo"))
                            ?
                            <tr className="table-danger">
                                <CorsoData listaCorsi={props.listaCorsi} corso={props.corso}
                                    hidden={hidden} setHidden={setHidden}
                                    modificaPiano={props.modificaPiano} creaPiano={props.creaPiano}
                                    listaPianoDiStudi={props.listaPianoDiStudi}
                                    listaIncompPianoStudi={props.listaIncompPianoStudi}
                                    setListaPianoDiStudi={props.setListaPianoDiStudi}
                                    listaIncompatibili={props.listaIncompatibili} />
                            </tr>
                            :
                            <tr>
                                <CorsoData listaCorsi={props.listaCorsi} corso={props.corso}
                                    hidden={hidden} setHidden={setHidden}
                                    modificaPiano={props.modificaPiano} creaPiano={props.creaPiano}
                                    listaPianoDiStudi={props.listaPianoDiStudi}
                                    listaIncompPianoStudi={props.listaIncompPianoStudi}
                                    setListaPianoDiStudi={props.setListaPianoDiStudi}
                                    listaIncompatibili={props.listaIncompatibili} />
                            </tr>
                )
                :
                <tr>
                    <CorsoData listaCorsi={props.listaCorsi} corso={props.corso} hidden={hidden} setHidden={setHidden} />
                </tr>
            }

            {hidden ?
                props.listaIncompatibili
                    .filter(c => c.codice === props.corso.codice).length > 0 ?
                    props.listaIncompatibili
                        .filter(c =>
                            c.codice === props.corso.codice &&
                            props.listaCorsi.find(c2 => (c.codiceIncompatibile === c2.codice)))
                        .map((incomp, i) => <Incompatibile incomp={incomp} key={i} />)
                    : <NessunIncompatibile />
                : false
            }

            {hidden ?
                props.corso.codicePropedeutico ?
                    handlePropedeutici(props.corso.codicePropedeutico, props.listaCorsi)
                    : <NessunPropedeutico />
                : false
            }
        </>
    );
}

function CorsoData(props) {
    return (
        <>
            <td>{props.corso.codice}</td>
            <td>{props.corso.nome}</td>
            <td>{props.corso.crediti}</td>
            <td>{props.corso.iscritti}</td>
            <td>{props.corso.maxStudenti}</td>

            <td><Button className="btn btn-light btn-outline-secondary"
                onClick={() => props.setHidden(hidden => !hidden)}>Espandi</Button></td>

            {props.modificaPiano || props.creaPiano ?
                <td>
                    <AggiungiCheck corso={props.corso} listaPianoDiStudi={props.listaPianoDiStudi}
                        listaIncompPianoStudi={props.listaIncompPianoStudi}
                        setListaPianoDiStudi={props.setListaPianoDiStudi}
                        listaCorsi={props.listaCorsi} listaIncompatibili={props.listaIncompatibili} />
                </td>
                : false
            }
        </>
    );
}

function handlePropedeutici(codice, list) {
    const proped = list.find(c => c.codice === codice);
    return (
        <>
            <tr>
                <td className="table-warning text-danger">
                    Corso propedeutico:
                    {" "}
                    {proped.codice}
                </td>

                <td className="table-active">{proped.nome}</td>
                <td className="table-active">{proped.crediti}</td>
                <td className="table-active">{proped.iscritti}</td>
                <td className="table-active">{proped.maxStudenti}</td>
            </tr>
        </>
    );
}

function NessunIncompatibile() {
    return (
        <>
            <tr>
                <td className="table-info text-info">
                    Nessun corso incompatibile
                </td>
                <td className="table-active"></td>
                <td className="table-active"></td>
                <td className="table-active"></td>
                <td className="table-active"></td>
            </tr>
        </>
    );
}

function Incompatibile(props) {
    return (
        <>
            <tr>
                <td className="table-warning text-danger">
                    Corso incompatibile:
                    {" "}
                    {props.incomp.codiceIncompatibile}
                </td>
                <td className="table-active">{props.incomp.nome}</td>
                <td className="table-active">{props.incomp.crediti}</td>
                <td className="table-active">{props.incomp.iscritti}</td>
                <td className="table-active">{props.incomp.maxStudenti}</td>
            </tr>
        </>
    );
}

function NessunPropedeutico() {
    return (
        <>
            <tr>
                <td className="table-info text-info">
                    Nessun corso propedeutico richiesto
                </td>
                <td className="table-active"></td>
                <td className="table-active"></td>
                <td className="table-active"></td>
                <td className="table-active"></td>
            </tr>
        </>
    );
}

function NoMatch() {
    return (
        <>
            <h1>
                <p align="center" > Oops! <FcHighPriority /></p>
                <p align="center">Url inesistente</p>
            </h1>
            <h5 align="center" size="1">
                <ul></ul>
                <Link to="/">Home</Link>
            </h5>
        </>
    );
}

export { ListaCorsi, NoMatch };