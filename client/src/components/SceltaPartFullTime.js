import React from "react";
import { Form } from "react-bootstrap";

const SceltaPartFullTime = (props) => {
    return (
        <>
            {props.tipoIscrizione === "part-time" ?

                <Form.Group>
                    <Form.Check inline label="Part-time (20-40 CFU)" name="group1" type="radio" id={`inline-radio-1`} defaultChecked
                        onClick={() => {
                            props.setTipoIscrizione("part-time")
                            props.listaPianoDiStudi?.map(c => c.tipoIscrizione = "part-time")
                        }} />

                    <Form.Check inline label="Full-time (60-80 CFU)" name="group1" type="radio" id={`inline-radio-2`}
                        onClick={() => {
                            props.setTipoIscrizione("full-time")
                            props.listaPianoDiStudi?.map(c => c.tipoIscrizione = "full-time")
                        }} />
                </Form.Group>
                :
                <Form.Group>
                    <Form.Check inline label="Part-time (20-40 CFU)" name="group1" type="radio" id={`inline-radio-1`}
                        onClick={() => {
                            props.setTipoIscrizione("part-time")
                            props.listaPianoDiStudi?.map(c => c.tipoIscrizione = "part-time")
                        }} />

                    <Form.Check inline label="Full-time (60-80 CFU)" name="group1" type="radio" id={`inline-radio-2`} defaultChecked
                        onClick={() => {
                            props.setTipoIscrizione("full-time")
                            props.listaPianoDiStudi?.map(c => c.tipoIscrizione = "full-time")
                        }} />
                </Form.Group>
            }
            <p></p>
        </>
    );
}

export default SceltaPartFullTime;