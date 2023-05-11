import React from "react";
import { useState } from "react"
import { Container, Table, Button, Modal } from "react-bootstrap";
import SceltaPartFullTime from './SceltaPartFullTime'

const TabellaPiano = (props) => {
    return (
        <Container fluid>
            <center>
                <h3>Piano di studi:</h3>
                &nbsp;	&nbsp;	&nbsp;

                {props.creaPiano ?
                    <>
                        <h4 className="text-success" > CREAZIONE PIANO DI STUDI</h4>
                        <h6 className="text-success">Tipologia iscrizione: {props.tipoIscrizione} Crediti: {props.totCfu}</h6>
                        &nbsp;	&nbsp;	&nbsp;
                        <SceltaPartFullTime tipoIscrizione={props.tipoIscrizione} setTipoIscrizione={props.setTipoIscrizione}
                            listaPianoDiStudi={props.listaPianoDiStudi} />
                    </>
                    :
                    !props.modificaPiano && props.totCfu === 0 ?
                        <Button className="btn btn-light" onClick={() => props.setCreaPiano(true)}>
                            <i className="bi bi-pencil-square text-success"><b> Crea piano di studi</b></i>
                        </Button>
                        : false
                }

                {props.modificaPiano ?
                    <>
                        <h4 className="text-warning">MODIFICA PIANO DI STUDI</h4>
                        <h6 className="text-warning">Tipologia iscrizione: {props.tipoIscrizione} Crediti: {props.totCfu}</h6>
                        &nbsp;	&nbsp;	&nbsp;
                        <SceltaPartFullTime tipoIscrizione={props.tipoIscrizione} setTipoIscrizione={props.setTipoIscrizione}
                            listaPianoDiStudi={props.listaPianoDiStudi} />
                    </>
                    :
                    !props.creaPiano && props.totCfu !== 0 ?
                        <>
                            <h6>Tipologia iscrizione: {props.tipoIscrizione} Crediti: {props.totCfu}</h6>
                            &nbsp;	&nbsp;	&nbsp;
                            <Button className="btn btn-light" onClick={() => props.setModificaPiano(true)}>
                                <i className="bi bi-pencil-square text-warning"><b>Modifica</b></i>
                            </Button>
                            &nbsp;	&nbsp;	&nbsp;

                            <TastoCancellaPiano errore={props.errore} setErrore={props.setErrore}
                                cancellaPianoDiStudi={props.cancellaPianoDiStudi} listaCorsi={props.listaCorsi}
                                setListaCorsi={props.setListaCorsi} listaPianoDiStudi={props.listaPianoDiStudi} />
                        </>
                        : false
                }

                <Table className="table table-hover table-lg">
                    <thead align="center">
                        <tr><th>Codice</th><th>Nome</th><th>Crediti</th><th>Iscritti</th><th>maxStudenti</th>
                            {
                                props.modificaPiano || props.creaPiano ? <th>Elimina</th>
                                    : false
                            }
                        </tr>
                    </thead>
                    <tbody align="center">
                        {
                            props.listaPianoDiStudi.map((corso, i) =>
                                <PianoRow listaPianoDiStudi={props.listaPianoDiStudi} key={i} corso={corso}
                                    modificaPiano={props.modificaPiano} setListaPianoDiStudi={props.setListaPianoDiStudi}
                                    creaPiano={props.creaPiano} errore={props.errore} setErrore={props.setErrore}
                                    listaEliminati={props.listaEliminati} setListaEliminati={props.setListaEliminati}
                                    listaCorsi={props.listaCorsi} listaIncompatibili={props.listaIncompatibili} />)
                        }
                    </tbody>
                </Table>
            </center>
        </Container>
    );
}

function PianoRow(props) {
    return (
        <tr>
            <PianoData listaPianoDiStudi={props.listaPianoDiStudi} corso={props.corso}
                modificaPiano={props.modificaPiano} setListaPianoDiStudi={props.setListaPianoDiStudi}
                creaPiano={props.creaPiano} errore={props.errore} setErrore={props.setErrore}
                listaEliminati={props.listaEliminati} setListaEliminati={props.setListaEliminati}
                listaCorsi={props.listaCorsi} listaIncompatibili={props.listaIncompatibili} />
        </tr>
    );
}

function PianoData(props) {
    return (
        <>
            <td>{props.corso.codice}</td>
            <td>{props.corso.nome}</td>
            <td>{props.corso.crediti}</td>
            <td>{props.corso.iscritti}</td>
            <td>{props.corso.maxStudenti}</td>

            <td>
                {props.modificaPiano || props.creaPiano ?
                    <Button variant='danger' onClick={() => {

                        //Prima di eliminare un corso dal piano di studi
                        //controllo se è propedeutico a qualcun'altro presente                      
                        if (props.listaPianoDiStudi.filter((c) => c.codicePropedeutico === props.corso.codice).length !== 0) {
                            props.setErrore("Errore: Non puoi eliminare questo esame perchè propedeutico a " +
                                props.listaPianoDiStudi.find((c) => c.codicePropedeutico === props.corso.codice).nome)
                        }
                        else {
                            props.setErrore('')
                            if(props.listaEliminati.filter(c => c.codice === props.corso.codice).length === 0)
                                props.setListaEliminati([...props.listaEliminati, props.corso])

                            const list = props.listaPianoDiStudi.filter((c) => c.codice !== props.corso.codice)
                            props.setListaPianoDiStudi(list)

                            props.listaCorsi.forEach(c => {
                                if (c.codice === props.corso.codice)
                                    c.iscritti = c.iscritti - 1;
                            })

                            props.listaIncompatibili.forEach(c => {
                                if (c.codiceIncompatibile === props.corso.codice)
                                    c.iscritti = c.iscritti - 1;
                            })
                        }
                    }}>
                        <i className='bi bi-trash3'></i></Button>
                    : false
                }
            </td>
        </>
    );
}

function TastoCancellaPiano(props) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleCancella = () => {
        setShow(false);

        props.listaCorsi.forEach(c1 => {
            props.listaPianoDiStudi.forEach(c2 => {
                if (c1.codice === c2.codice)
                    c1.iscritti = c1.iscritti - 1;
            })
        })

        props.setListaCorsi(props.listaCorsi)
        props.cancellaPianoDiStudi()
    }
    return (
        <>
            <Button className="btn btn-light" onClick={handleShow}>
                <i className="bi bi-x-square text-danger"><b> Cancella</b></i>
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Attenzione: confermare eliminazione?</Modal.Title>
                </Modal.Header>
                <Modal.Body>Conferma per eliminare il piano di studi oppure annulla.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Annulla
                    </Button>
                    <Button variant="danger" onClick={handleCancella}>
                        Elimina piano di studi
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default TabellaPiano;