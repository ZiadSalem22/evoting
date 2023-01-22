import React, { Component, useState } from "react"; // default, {secondary}
import logo from "../assets/HNEC_Logo.png";
import { HNEC_PUBLIC_ADDRESS } from "../../../config";
import {
    FormGroup,
    FormControl,
    Button,
    Form,
    Spinner,
    Row,
    Col,
    Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

class HNEC extends Component {
    state = {
        adminOnly: false,
        adminAddresses: [],
    };

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

    validatePK(privateKey) {
        if (!privateKey || privateKey.trim() === "") {
            return "please enter your privateKey";
        } else if (
            privateKey.length <
            "55685527491970eb3000f6cd279e43151cb854fb2fa2c44e23ffb985c841d850"
                .length
        ) {
            return "please enter valid private address example \n 55685527491970eb3000f6cd279e43151cb854fb2fa2c44e23ffb985c841d850 ";
        }

        return undefined;
    }
    validateForm = () => {
        const { PKAdminOnly, PKAdminAddresses, adminAddresses, PKSeed } =
            this.props.form;
        const newErrors = {};

        newErrors.PKSeed = this.validatePK(PKSeed);
        newErrors.PKAdminOnly = this.validatePK(PKAdminOnly);
        newErrors.PKAdminAddresses = this.validatePK(PKAdminAddresses);

        return newErrors;
    };

    seed = () => {
        let formErrors = this.validateCount();

        if (Object.keys(formErrors).length > 0) {
            this.props.setErrors(formErrors);
        } else {
            formErrors = this.validateForm();

            if (formErrors.PKSeed !== undefined) {
                this.props.setErrors(formErrors);
            } else {
                const { count, PKSeed } = this.props.form;

                const privateKey = PKSeed;
                const data = {
                    count,
                };
                this.props.setLoading(true);
                fetch(`${document.location.origin}/api/seed`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ data, privateKey }),
                })
                    .then((response) => response.json())
                    .then((json) => {
                        alert(json.message || "success"); 
                        this.props.setLoading(false);
                        if (!json.message) {
                            this.props.navigation("/blocks");
                        }
                    });
            }
        }
    };

    updateAdminOnly = () => {
        const formErrors = this.validateForm();

        if (formErrors.PKAdminOnly !== undefined) {
            this.props.setErrors(formErrors);
        } else {
            const { PKAdminOnly } = this.props.form;

            const privateKey = PKAdminOnly;
            const data = {
                adminOnly: !this.state.adminOnly,
            };

            this.props.setLoading(true);
            fetch(`${document.location.origin}/api/authority-admin-only-mode`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ privateKey, data }),
            })
                .then((response) => response.json())
                .then((json) => {
                    alert(json.message || json.type);
                    this.props.setLoading(false);
                    if (!json.message) {
                        this.props.navigation("/");
                    }
                });
        }
    };

    updateAdminAddresses = () => {
        const formErrors = this.validateForm();

        if (formErrors.PKAdminAddresses !== undefined) {
            this.props.setErrors(formErrors);
        } else {
            const { PKAdminAddresses, adminAddresses } = this.props.form;

            const privateKey = PKAdminAddresses;
            const data = {
                adminAddresses: adminAddresses
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => s !== ""),
            };

            this.props.setLoading(true);
            fetch(`${document.location.origin}/api/authority-admin-addresses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ privateKey, data }),
            })
                .then((response) => response.json())
                .then((json) => {
                    alert(json.message || json.type);
                    this.props.setLoading(false);
                    if (!json.message) {
                        this.props.navigation("/");
                    }
                });
        }
    };

    consoleLog = () => {
        const { PKSeed } = this.props.form;
        console.log("PKSeed", this.props.form.PKSeed);
        // console.log("adminAddresses", adminAddresses);
    };
    componentDidMount() {
        fetch(`${document.location.origin}/api/info-authority`)
            .then((response) => response.json())
            .then((json) =>
                this.setState({
                    adminOnly: json.authority.adminOnly,
                    adminAddresses: json.authority.adminAddresses,
                })
            );
    }

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
                    {this.state.adminAddresses.map((address) => {
                        return (
                            <div
                                style={{ marginTop: "10px" }}
                                key={address}
                            >{`${address}`}</div>
                        );
                    })}
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
                            <FormGroup
                                controlId="privateKey"
                                style={{ paddingTop: "0.4cm" }}
                            >
                                <Form.Label>
                                    Enter Admin Private Key:
                                </Form.Label>
                                <FormControl
                                    className="text"
                                    inputMode="text"
                                    placeholder="Private Key 041eb5ggfccex234...."
                                    value={this.props.form.PKSeed || ""}
                                    onChange={(e) =>
                                        this.setField(
                                            "PKSeed",
                                            e.target.value.trim()
                                        )
                                    }
                                    isInvalid={!!this.props.errors.PKSeed}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {this.props.errors.PKSeed}
                                </Form.Control.Feedback>
                            </FormGroup>
                            <br />
                        </Row>
                        <Row>
                            <Col>
                                {this.props.loading ? (
                                    <Spinner animation="border" />
                                ) : (
                                    <Button
                                        style={{ marginTop: "0.5cm" }}
                                        onClick={this.seed}
                                    >
                                        Seed
                                    </Button>
                                )}
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
                                    hidden={this.state.adminOnly !== false}
                                >
                                    Turned off
                                </Badge>{" "}
                                <Badge
                                    style={{ fontSize: "17px" }}
                                    bg="success"
                                    text="light"
                                    hidden={this.state.adminOnly !== true}
                                >
                                    Turned on
                                </Badge>
                            </Col>
                        </Row>
                        <Row>
                            <FormGroup
                                controlId="privateKey"
                                style={{ paddingTop: "0.4cm" }}
                            >
                                <Form.Label>
                                    Enter Admin Private Key:
                                </Form.Label>
                                <FormControl
                                    className="text"
                                    inputMode="text"
                                    placeholder="Private Key 041eb5ggfccex234...."
                                    value={this.props.form.PKAdminOnly || ""}
                                    onChange={(e) =>
                                        this.setField(
                                            "PKAdminOnly",
                                            e.target.value.trim()
                                        )
                                    }
                                    isInvalid={!!this.props.errors.PKAdminOnly}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {this.props.errors.PKAdminOnly}
                                </Form.Control.Feedback>
                            </FormGroup>
                            <br />
                        </Row>
                        <Row>
                            <Col>
                                {this.props.loading ? (
                                    <Spinner animation="border" />
                                ) : (
                                    <Button
                                        style={{
                                            marginTop: "0.5cm",
                                            width: "100px",
                                        }}
                                        onClick={this.updateAdminOnly}
                                    >
                                        Switch
                                    </Button>
                                )}
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
                                style={{ paddingTop: "0.4cm" }}
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
                            <FormGroup
                                controlId="PKAdminAddresses"
                                style={{ paddingTop: "0.4cm" }}
                            >
                                <Form.Label>
                                    Enter Admin Private Key:
                                </Form.Label>
                                <FormControl
                                    className="text"
                                    inputMode="text"
                                    placeholder="Private Key 041eb5ggfccex234...."
                                    value={
                                        this.props.form.PKAdminAddresses || ""
                                    }
                                    onChange={(e) =>
                                        this.setField(
                                            "PKAdminAddresses",
                                            e.target.value.trim()
                                        )
                                    }
                                    isInvalid={
                                        !!this.props.errors.PKAdminAddresses
                                    }
                                />
                                <Form.Control.Feedback type="invalid">
                                    {this.props.errors.PKAdminAddresses}
                                </Form.Control.Feedback>
                            </FormGroup>
                            <br />
                        </Row>
                        <Row>
                            <Col>
                            {this.props.loading ? (
                            <Spinner animation="border" />
                        ) : (
                          <Button
                          style={{
                              marginTop: "0.5cm",
                              width: "100px",
                          }}
                          onClick={this.updateAdminAddresses}
                      >
                          Change
                      </Button>
                        )}
                              
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
    const [loading, setLoading] = useState(false);

    return (
        <HNEC
            {...props}
            navigation={navigation}
            form={form}
            setForm={setForm}
            errors={errors}
            setErrors={setErrors}
            loading={loading}
            setLoading={setLoading}
        />
    );
}
