import React, { Component, useState } from "react";
import {
    FormGroup,
    FormControl,
    Button,
    Form,
    Spinner,
    Table,
} from "react-bootstrap";
import { ThemeConsumer } from "react-bootstrap/esm/ThemeProvider";
import { Link, useNavigate } from "react-router-dom";

class CreateWallet extends Component {
    state = {
        wallets: [],
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

    validateForm = () => {
        const { count, privateKey } = this.props.form;
        const newErrors = {};

        if (count > 1000) {
            if (!privateKey || privateKey.trim() === "") {
                newErrors.privateKey = "please enter your privateKey";
            } else if (
                privateKey.length <
                "55685527491970eb3000f6cd279e43151cb854fb2fa2c44e23ffb985c841d850"
                    .length
            ) {
                newErrors.privateKey =
                    "please enter valid private address example \n 55685527491970eb3000f6cd279e43151cb854fb2fa2c44e23ffb985c841d850 ";
            }
        }

        if (!count || count < 1) {
            newErrors.count = "please enter valid count > 1 ";
        }

        return newErrors;
    };

    consoleLog = () => {
        console.log("this.state.wallets", this.state.wallets);
    };

    createWallets = () => {
        const formErrors = this.validateForm();

        if (Object.keys(formErrors).length > 0) {
            this.props.setErrors(formErrors);
        } else {
            const { count, privateKey } = this.props.form;

            const data = {
                count,
            };

            this.props.setLoading(true);
            fetch(`${document.location.origin}/api/create-wallets`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ privateKey, data }),
            })
                .then((response) => response.json())
                .then((json) => {
                    alert(json.message || json.type); //message when error
                    this.setState({ wallets: json.wallets });
                    this.props.setLoading(false);
                });
        }
    };

    render() {
        return (
            <div className="CreateWallet">
                <Form className="CreateWalletForm">
                    <h3>Create Wallets</h3>

                    <FormGroup controlId="count" className="count">
                        <Form.Label> Number of Wallets to Create:</Form.Label>
                        <FormControl
                            type="number"
                            className="text"
                            placeholder="count"
                            value={this.props.form.count || 0}
                            onChange={(e) =>
                                this.setField("count", Number(e.target.value))
                            }
                            isInvalid={!!this.props.errors.count}
                        />
                        <Form.Control.Feedback type="invalid">
                            {this.props.errors.count}
                        </Form.Control.Feedback>
                    </FormGroup>

                    <br />

                    <FormGroup
                        controlId="privateKey"
                        hidden={this.props.form.count < 1001}
                        disabled={this.props.form.count < 1001}
                    >
                        <Form.Label>
                            Enter Admin Private Key to Create More Than 1000
                            Wallets:{" "}
                        </Form.Label>
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
                            isInvalid={true}
                        />
                        <Form.Control.Feedback type="invalid">
                            {this.props.errors.privateKey}
                        </Form.Control.Feedback>
                    </FormGroup>
                    <br />

                    <br />
                    <div>
                        {this.props.loading ? (
                            <Spinner animation="border" />
                        ) : (
                            <Button
                                // bsStyle="danger"
                                onClick={this.createWallets}
                            >
                                Create
                            </Button>
                        )}

                        <Button
                            // bsStyle="danger"
                            onClick={this.consoleLog}
                        >
                            log
                        </Button>
                    </div>
                </Form>

                <div hidden={this.state.wallets.length < 1} className="CreateWalletTable">
                    <h3> Created Wallets</h3>
                    <br></br>
                    <Table striped bordered hover variant="dark" >
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Address</th>
                                <th>Private Key</th>
                                <th style={{whiteSpace: "nowrap"}}>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                    {this.state.wallets.map(wallet => {
                        return (
                            <tr key={wallet.address || 1}>
                                <td style={{whiteSpace: "nowrap"}}>{`${wallet.count}`}</td>
                                <td>{`${wallet.address}`}</td>
                                <td>{`${wallet.privateKey}`}</td>
                                <td style={{whiteSpace: "nowrap"}}> {`${wallet.balance}`}</td>
                            </tr>
                        );
                    })}
                       
                        </tbody>
                    </Table>

                </div>
            </div>
        );
    }
}

export default function (props) {
    const navigation = useNavigate();

    const [form, setForm] = useState({
        count: 0,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    return (
        <CreateWallet
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
