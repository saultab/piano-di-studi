import React from "react";
import { Form, OverlayTrigger, Tooltip } from "react-bootstrap";

const AggiungiCheck = (props) => {

    //Se hai già il corso nel piano di studi il checkbox è già checkato e non checkabile
    if (props.listaPianoDiStudi.filter(c => c.codice === props.corso.codice).length === 1) {
        return (
            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Corso già presente nel piano di studi!</Tooltip>}>
                <span className="d-inline-block">
                    <Form.Group controlid="formBasicCheckbox">
                        <Form.Check type="checkbox" disabled="disabled" defaultChecked />
                    </Form.Group>
                </span>
            </OverlayTrigger>
        );
    }

    //Se il corso è incompatibile con un corso presente nel corso di studi il checkbox è non checkabile
    else if (props.listaIncompPianoStudi.filter(c => c.codiceIncompatibile === props.corso.codice).length === 1) {
        return (
            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Corso incompatibile con il piano di studi!</Tooltip>}>
                <span className="d-inline-block">
                    <Form.Group controlid="formBasicCheckbox">
                        <Form.Check type="checkbox" disabled="disabled" />
                    </Form.Group>
                </span>
            </OverlayTrigger>
        );
    }

    //Se il propedeutico è stato appena messo solo ora comunque il checkbox è non checkabile
    else if (props.corso.codicePropedeutico && props.listaPianoDiStudi &&
        (props.listaPianoDiStudi.find((c) => c.codice === props.corso.codicePropedeutico)?.status === "temporaneo") ) {
        return (
            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Corso propedeutico aggiunto solo temporaneamente nel piano di studi! Confermare il piano di studi e dopo riprovare</Tooltip>}>
                <span className="d-inline-block">
                    <Form.Group controlid="formBasicCheckbox">
                        <Form.Check type="checkbox" disabled="disabled"/>
                    </Form.Group>
                </span>
            </OverlayTrigger>
        );
    }

    //Se gli manca il propedeutico il checkbox è non checkabile
    else if (props.corso.codicePropedeutico && props.listaPianoDiStudi.filter(c => c.codice === props.corso.codicePropedeutico).length === 0) {
        return (
            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Corso propedeutico assente nel piano di studi!</Tooltip>}>
                <span className="d-inline-block">
                    <Form.Group controlid="formBasicCheckbox">
                        <Form.Check type="checkbox" disabled="disabled" />
                    </Form.Group>
                </span>
            </OverlayTrigger>
        );
    }

    //Se ha raggiunto max iscritti
    else if (props.corso.iscritti >= props.corso.maxStudenti && props.corso.maxStudenti !== false) {
        return (
            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Il corso ha raggiunto il massimo numero di iscritti!</Tooltip>}>
                <span className="d-inline-block">
                    <Form.Group controlid="formBasicCheckbox">
                        <Form.Check type="checkbox" disabled="disabled" />
                    </Form.Group>
                </span>
            </OverlayTrigger>
        );
    }

    //Altrimenti il checkbox è checkabile
    else {
        return (
            <Form.Group controlid="formBasicCheckbox">
                <Form.Check type="checkbox" onClick={() => {
                    props.corso.status = 'temporaneo';

                    props.listaCorsi.forEach(c => {
                        if (c.codice === props.corso.codice)
                            c.iscritti = c.iscritti + 1;
                    })

                    props.listaIncompatibili.forEach(c => {
                        if (c.codiceIncompatibile === props.corso.codice)
                            c.iscritti = c.iscritti + 1;
                    })

                    props.setListaPianoDiStudi([...props.listaPianoDiStudi, props.corso])        
                }}
                />
            </Form.Group>
        );
    }
};
export default AggiungiCheck;