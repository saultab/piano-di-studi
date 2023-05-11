import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function LoginForm(props) {
  const [username, setUsername] = useState('u1@p.it');
  const [password, setPassword] = useState('password');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');
    const credentials = { username, password };

    let valid = true;

    if (username === '') {
      valid = false;
      setErrorMessage('Errore username vuoto')
    }

    else if (password === '') {
      valid = false;
      setErrorMessage('Errore password vuota')
    }

    else if (!username.includes("@p.it")) {
      valid = false;
      setErrorMessage('Errore dominio non corretto')
    }

    else if (valid) {
      props.login(credentials);
    }

    else {
      setErrorMessage('Errore username e/o password.')
    }
  };

  return (
    <Container>
      <Row>
        <Col>
          <h2>Login</h2>
          <Form onSubmit={handleSubmit}>
            {errorMessage ? <Alert variant='danger'>{errorMessage}</Alert> : ''}

            <Form.Group controlid='username'>
              <Form.Label>email</Form.Label>
              <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value.trim())} />
            </Form.Group>
            <Form.Group controlid='password'>
              <Form.Label>Password</Form.Label>
              <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
            </Form.Group>
            <Button type="submit">Login</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}

function LogoutButton(props) {
  return (
    <>
      <span className="text-white">Studente: {props.user?.nome + " " + props.user?.matricola}</span>
      &nbsp;
      <Button variant="danger" onClick={props.logout}>Logout</Button>
    </>
  )
}

function LoginButton() {
  const navigate = useNavigate();
  return (
    <>
      &nbsp;
      <Button variant="primary" onClick={() => navigate('/login')}>Login</Button>
    </>
  )
}

export { LoginForm, LogoutButton, LoginButton };