import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';

function NavBar() {

  return (


    <Navbar key={'xl'} bg="light" expand={'lg'} className="mb-3">
      <Container fluid>
        <Navbar.Brand >E-Voting</Navbar.Brand>
        <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${'xl'}`} />
        <Navbar.Offcanvas
          id={`offcanvasNavbar-expand-${'xl'}`}
          aria-labelledby={`offcanvasNavbarLabel-expand-${'xl'}`}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${'xl'}`}>
              Offcanvas
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="justify-content-end flex-grow-1 pe-3">
              <Nav.Link href="/" >Home</Nav.Link>
              <Nav.Link href="/Blocks">Blocks</Nav.Link>
              <Nav.Link href="/transaction-pool">Transaction Pool</Nav.Link>
              <NavDropdown
                title="Conduct Transaction"
                id={`offcanvasNavbarDropdown-expand-${'xl'}`}
              >
                <NavDropdown.Item href="/conduct-poll">Poll</NavDropdown.Item>
                <NavDropdown.Item href="#action4">Ballot</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="/conduct-transaction">Currency</NavDropdown.Item>

              </NavDropdown>
            </Nav>
            <Form className="d-flex">
              <Form.Control
                type="search"
                placeholder="Search"
                className="me-2"
                aria-label="Search"
              />
              <Button variant="outline-success">Search</Button>
            </Form>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
    //   <Navbar bg="light" expand="lg">
    //     <Container fluid>
    //       <Navbar.Brand href="/">E-Voting</Navbar.Brand>
    //       <Navbar.Toggle aria-controls="navbarScroll" />
    //       <Navbar.Collapse id="navbarScroll">
    //         <Nav
    //           className="me-auto my-2 my-lg-0"
    //           style={{ maxHeight: '100px' }}
    //           navbarScroll
    //         >
    //           <Nav.Link href="/">Home</Nav.Link>
    //           <Nav.Link href="/blocks">Blocks</Nav.Link>
    //           <Nav.Link href="/transaction-pool">Transaction Pool</Nav.Link>
    //           <NavDropdown title="Conduct Transaction" id="navbarScrollingDropdown">
    //             <NavDropdown.Item href="#action4">Poll</NavDropdown.Item>
    //             <NavDropdown.Item href="#action5">Ballot</NavDropdown.Item>
    //             <NavDropdown.Divider />
    //             <NavDropdown.Item href="/conduct-transaction">Currency</NavDropdown.Item>
    //           </NavDropdown>
    //           <Nav.Link href="/seed">Seed</Nav.Link>
    //           <Nav.Link href="#" disabled>
    //             Link
    //           </Nav.Link>
    //         </Nav>
    //         <Form className="d-flex">
    //           <Form.Control
    //             type="search"
    //             placeholder="Search"
    //             className="me-2"
    //             aria-label="Search"
    //           />
    //           <Button variant="outline-success">Search</Button>
    //         </Form>
    //       </Navbar.Collapse>
    //     </Container>
    //   </Navbar>
  );
}

export default NavBar;