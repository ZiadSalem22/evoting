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
    Badge,
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
            <div className="Hnec">
                <img className="logo" src={logo}></img>

                <br />
                <div className="HnecForm">
                    <Badge style={{ fontSize: "23px" }} bg="light" text="dark">
                        HENC Address
                    </Badge>
                    <br />
                    <div
                        style={{ marginTop: "10px" }}
                    >{`${HNEC_PUBLIC_ADDRESS}`}</div>
                    <br />
                    <Badge style={{ fontSize: "23px" }} bg="light" text="dark">
                        E-Voting Admins
                    </Badge>
                </div>

                <Form className="Seed">
                    <Row>
                        <Col>
                            <Badge
                                style={{ fontSize: "21px" }}
                                bg="light"
                                text="dark"
                            >
                                Seed Dummy Data
                            </Badge>
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Row>
                            <Col>
                                <FormGroup controlId="count">
                                    <FormControl
                                        type="number"
                                        value={this.props.form.count || 0}
                                        onChange={(e) =>
                                            this.setField(
                                                "count",
                                                Number(e.target.value)
                                            )
                                        }
                                        isInvalid={!!this.props.errors.count}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {this.props.errors.count}
                                    </Form.Control.Feedback>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <FormGroup controlId="privateKey" style={{paddingTop:"0.4cm"}}>
                                <Form.Label>Enter Admin Private Key:</Form.Label>
                                <FormControl
                                    className="text"
                                    inputMode="text"
                                    placeholder="Private Key 041eb5ggfccex234...."
                                    value={this.props.form.privateKey || ""}
                                    onChange={(e) =>
                                        this.setField(
                                            "privateKey",
                                            e.target.value.trim()
                                        )
                                    }
                                    isInvalid={!!this.props.errors.privateKey}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {this.props.errors.privateKey}
                                </Form.Control.Feedback>
                            </FormGroup>
                            <br />
                        </Row>
                        <Row>
                            <Col>
                                <Button
                                    style={{ marginTop: "0.5cm" }}
                                    onClick={this.seed}
                                >
                                    Seed
                                </Button>
                            </Col>
                        </Row>
                    </Row>
                </Form>

                <Form className="AdminOnly">
                    <Row>
                        <Col>
                            <Badge
                                style={{ fontSize: "21px" }}
                                bg="light"
                                text="dark"
                            >
                                Admin Only Mode
                            </Badge>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <br></br>
                            When this mode is turned on only admin\s will be
                            able to conduct Polls into the Blockchain
                        </Col>
                    </Row>
                    <Row>
                        <br />
                    </Row>
                    <Row>
                        <Row>
                            <Col>
                                Currently:{" "}
                                <Badge
                                    style={{ fontSize: "17px" }}
                                    bg="danger"
                                    text="light"
                                >
                                    Turned off
                                </Badge>{" "}
                                <Badge
                                    style={{ fontSize: "17px" }}
                                    bg="success"
                                    text="light"
                                >
                                    Turned on
                                </Badge>
                            </Col>
                        </Row>
                        <Row>
                            <FormGroup controlId="privateKey" style={{paddingTop:"0.4cm"}}>
                                <Form.Label>Enter Admin Private Key:</Form.Label>
                                <FormControl
                                    className="text"
                                    inputMode="text"
                                    placeholder="Private Key 041eb5ggfccex234...."
                                    value={this.props.form.privateKey || ""}
                                    onChange={(e) =>
                                        this.setField(
                                            "privateKey",
                                            e.target.value.trim()
                                        )
                                    }
                                    isInvalid={!!this.props.errors.privateKey}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {this.props.errors.privateKey}
                                </Form.Control.Feedback>
                            </FormGroup>
                            <br />
                        </Row>
                        <Row>
                            <Col>
                                <Button
                                    style={{
                                        marginTop: "0.5cm",
                                        width: "100px",
                                    }}
                                    onClick={this.seed}
                                >
                                    Switch
                                </Button>
                            </Col>
                        </Row>
                    </Row>
                </Form>

                <Form className="ChangeAdmins">
                    <Row>
                        <Col>
                            <Badge
                                style={{ fontSize: "21px" }}
                                bg="light"
                                text="dark"
                            >
                                Change Admins
                            </Badge>
                        </Col>
                    </Row>
                    <Row>
                        <Row>
                            <FormGroup
                                controlId="AdminAddresses"
                                className="pollVoters"
                                style={{paddingTop:"0.4cm"}}
                            >
                                <Form.Label>New Admin Addresses:</Form.Label>
                                <FormControl
                                    className="text"
                                    type="text"
                                    as="textarea"
                                    rows={5}
                                    placeholder="enter admin addresses separated by ',' example: 0e3...,04e"
                                    value={this.props.form.adminAddresses || ""}
                                    onChange={(e) =>
                                        this.setField(
                                            "adminAddresses",
                                            e.target.value
                                        )
                                    }
                                    isInvalid={
                                        !!this.props.errors.adminAddresses
                                    }
                                />
                                <Form.Control.Feedback type="invalid">
                                    {this.props.errors.adminAddresses}
                                </Form.Control.Feedback>
                            </FormGroup>
                        </Row>
                        <Row>
                            <FormGroup controlId="privateKey" style={{paddingTop:"0.4cm"}}>
                                <Form.Label>Enter Admin Private Key:</Form.Label>
                                <FormControl
                                    className="text"
                                    inputMode="text"
                                    placeholder="Private Key 041eb5ggfccex234...."
                                    value={this.props.form.privateKey || ""}
                                    onChange={(e) =>
                                        this.setField(
                                            "privateKey",
                                            e.target.value.trim()
                                        )
                                    }
                                    isInvalid={!!this.props.errors.privateKey}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {this.props.errors.privateKey}
                                </Form.Control.Feedback>
                            </FormGroup>
                            <br />
                        </Row>
                        <Row>
                            <Col>
                                <Button
                                    style={{
                                        marginTop: "0.5cm",
                                        width: "100px",
                                    }}
                                    onClick={this.seed}
                                >
                                    Change
                                </Button>
                            </Col>
                        </Row>
                    </Row>
                </Form>
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
