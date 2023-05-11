import React from "react";
import { Alert, Row, Col, Button } from "react-bootstrap";

const TastoConferma = (props) => {
    return (
        <>
            {
                props.creaPiano || props.modificaPiano ?
                    <Row>
                        <br></br>
                        <Row>
                            {props.errore ? <Alert variant='danger' onClose={() => props.setErrore('')} dismissible>{props.errore}</Alert> : false}
                        </Row>

                        <Col className='d-grid gap-2'>
                            <Button className="btn btn-lg btn-secondary"
                                onClick={() => {

                                    let newListaPiano = [];
                                    props.listaPianoDiStudi.map(c => newListaPiano = [...newListaPiano, c])

                                    if (props.listaEliminati.length !== 0) {

                                        //Se l'utente clicca annulla allora metto +1 iscritti 
                                        //ai corsi che aveva provato a togliere dal
                                        //piano di studi e li rimetto nella lista del piano di studi
                                        props.listaEliminati.forEach(c2 => {

                                            newListaPiano = [...newListaPiano, c2];

                                            props.listaCorsi.forEach(c1 => {
                                                if (c1.codice === c2.codice)
                                                    c1.iscritti = c1.iscritti + 1;
                                            })
                                        })
                                    }

                                    //Se l'utente clicca annulla allora rimetto -1 iscritti 
                                    //ai corsi che aveva provato ad inserire nel piano di studi
                                    props.listaCorsi.forEach(c1 => {
                                        newListaPiano.forEach(c2 => {
                                            if (c2.status === 'temporaneo' && c1.codice === c2.codice)
                                                c1.iscritti = c1.iscritti - 1;
                                        })
                                    })

                                    newListaPiano = newListaPiano.filter((c) => c.status !== 'temporaneo')

                                    newListaPiano.filter((c) => c.status === 'temporaneo')
                                        .forEach(c => {
                                            c.tipoIscrizione = props.tipoIscrizione
                                            c.status = "persistente"
                                        })


                                    props.setModificaPiano(false)
                                    props.setCreaPiano(false)

                                    props.setListaPianoDiStudi(newListaPiano)
                                    props.setListaEliminati([]);
                                }}>Annulla</Button>
                        </Col>

                        <Col className='d-grid gap-2'>
                            <Button className="btn btn-lg btn-success"
                                onClick={() => {
                                    let ok = true;

                                    //Errori dovuti a mancato rispetto soglie di cfu part/full time
                                    if (props.tipoIscrizione === "part-time") {
                                        if (props.totCfu < 20) {
                                            ok = false;
                                            props.setErrore("Errore: piano di studi part-time non rispetta la soglia minima di 20 CFU")
                                        }
                                        else if (props.totCfu > 40) {
                                            ok = false;
                                            props.setErrore("Errore: piano di studi part-time non rispetta la soglia massima di 40 CFU")
                                        }
                                    }

                                    else if (props.tipoIscrizione === "full-time") {
                                        if (props.totCfu < 60) {
                                            ok = false;
                                            props.setErrore("Errore: piano di studi full-time non rispetta la soglia minima di 60 CFU")
                                        }

                                        else if (props.totCfu > 80) {
                                            ok = false;
                                            props.setErrore("Errore: piano di studi full-time non rispetta la soglia massima di 80 CFU")
                                        }
                                    }

                                    else if (props.tipoIscrizione === undefined) {
                                        ok = false;
                                        props.setErrore("Errore: Non hai selezionato una tipologia di iscrizione (part o full time)")
                                    }
                                    if (ok) {
                                        props.setErrore('')
                                        props.setCreaPiano(false);
                                        props.setModificaPiano(false);
                                        props.setListaEliminati([])

                                        props.listaPianoDiStudi.filter((c) => c.status === 'temporaneo')
                                            .forEach(c => {
                                                c.tipoIscrizione = props.tipoIscrizione
                                                c.status = "persistente"
                                            })

                                        props.aggiornaPianoDiStudi();

                                    }
                                }
                                }>Conferma</Button>
                        </Col>
                    </Row>
                    : false
            }
        </>
    )
}

export default TastoConferma;