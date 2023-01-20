import React, { Component, useState } from "react"; // default, {secondary}
import logo from "../assets/HNEC_Logo.png";
import { HNEC_PUBLIC_ADDRESS } from "../../../config";
import {
  FormGroup,
  FormControl,
  Button,
  Form,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

class HNEC extends Component {
  setField = (field, value) => {
    this.props.setForm({
      ...this.props.form,
      [field]: value,
    });

    if (!!this.props.errors[field]) {
      this.props.setErrors({
        ...this.props.errors,
        [field]: null,
      });
    }
  };

  validateCount = () => {
    const { count } = this.props.form;
    const newErrors = {};

    if (!count || count < 1) {
      newErrors.count = "please enter valid count > 1 ";
    }

    return newErrors;
  };

  seed = () => {
    const formErrors = this.validateCount();

    if (Object.keys(formErrors).length > 0) {
      this.props.setErrors(formErrors);
    } else {
      const { count } = this.props.form;
      const data = {
        count,
      };

      fetch(`${document.location.origin}/api/seed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      }).then((response) => {
        if (response.status == 200) {
          alert("success");
          this.props.navigation("/blocks");
        } else {
          alert("the seed request did not complete");
        }
      });
    }
  };

  render() {
    return (
      <div className="Home">
        <img className="logo" src={logo}></img>
        <br />
        <hr />
        <Container>
          <Row>
            <Col>Seed Dummy Data</Col>
          </Row>
          <br />
          <Row>
            <Col>
              <FormGroup controlId="count">
                <FormControl
                  type="number"
                  className="text"
                  placeholder="count"
                  value={this.props.form.count || 0}
                  onChange={(e) => this.setField("count", e.target.value)}
                  isInvalid={!!this.props.errors.count}
                />
                <Form.Control.Feedback type="invalid">
                  {this.props.errors.count}
                </Form.Control.Feedback>
              </FormGroup>
            </Col>
            <Col>
              <Button onClick={this.seed}>Seed</Button>
            </Col>
          </Row>
          <hr />
        </Container>
        <div className="WalletInfo">
          <div>HNEC Public Address: {`${HNEC_PUBLIC_ADDRESS}`}</div>
        </div>
      </div>
    );
  }
}

export default function (props) {
  const navigation = useNavigate();

  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  return (
    <HNEC
      {...props}
      navigation={navigation}
      form={form}
      setForm={setForm}
      errors={errors}
      setErrors={setErrors}
    />
  );
}
