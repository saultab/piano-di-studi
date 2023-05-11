import React from "react";
import { Container, Row, Navbar, Form, FormControl } from "react-bootstrap";
import { IoPersonCircleOutline } from "react-icons/io5";
import { LogoutButton, LoginButton } from './loginComponent';

const BarraNavigazione = (props) => {
    return (
        <>
            <Container fluid>
                <Row>
                    <Navbar expand="lg" variant="dark" className="navbar-expand-sm navbar-custom">
                        <Container fluid>
                            <Navbar.Brand href="/">
                                <img src="logo.png" alt="logo" />
                            </Navbar.Brand>
                            <div className="text-white">
                                <h2 className="text-white">Servizi per la didattica</h2>
                                <span className="text-white">PORTALE DELLA DIDATTICA</span>
                            </div>
                        </Container>
                    </Navbar>
                </Row>

                <Row>
                    <Navbar expand="lg" variant="dark" className="navbar-expand-sm navbar-custom2">
                        <Container align="center" fluid>
                            <Form className="d-flex">
                                <FormControl type="search" placeholder="Cerca..." className="me-2" aria-label="Search" />
                            </Form>
                            <div>
                                <>
                                    <IoPersonCircleOutline size={30} className="text-white" />
                                    {props.loggedIn ?
                                        <LogoutButton logout={props.doLogOut} user={props.user} /> :
                                        <LoginButton />
                                    }
                                </>
                            </div>
                        </Container>
                    </Navbar>
                </Row>
            </Container >
            <ul></ul>
        </>
    )
}

export default BarraNavigazione;