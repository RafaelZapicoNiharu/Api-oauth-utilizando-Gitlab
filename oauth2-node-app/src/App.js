import { useEffect, useState } from "react";
import { Button, Card, Container } from "react-bootstrap";
import "./App.css";


function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [access_token, setAccess_token] = useState(null);
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get(
      "access_token"
    );
    setAccess_token(token);
  }, []);

  return (
    <Container className="App text-center">
      {!loggedIn ? (
        <Card style={{ width: '18rem' }} className="mx-auto mt-5">
          <Card.Img variant="top" src="https://media.giphy.com/avatars/gitlab/HyKFKml3EsoS.gif" alt="GitLab Logo" />
          <Card.Body>
            <Card.Title className="h3 mb-3 font-weight-normal">Entre com Gitlab pra conseguir seu token de acesso</Card.Title>
            <Button
              variant="primary"
              className="btn btn-lg"
              href="https://gitlab.com/oauth/authorize?client_id=becff21beca2ab7163d82e6fba31c1b5763c01bf429ba3c6e9fbf5184f0a9829&redirect_uri=http://localhost:8080/users/auth/gitlab/callback&response_type=code&scope=read_user"
            >
              Login
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card className="mx-auto mt-5">
          <Card.Body>
            <Card.Text>Nossa API OAuth com o GitLab! Ass: Rafael e Taciane</Card.Text>
            {access_token && <Card.Text>Use o Token: {access_token}</Card.Text>}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
export default App;
