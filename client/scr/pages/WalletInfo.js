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

class WalletInfo extends Component {
    state = {
        WalletInfo: {
            address: "",
            privateKey:"",
            data: {
                createdPolls:[],
                validToVotePolls:[],
                ballots:[],
            },
            balance:0
        },
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
        const { privateKey } = this.props.form;
        const newErrors = {};

       
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
        
        return newErrors;
    };


    getWalletInfo = () => {
        const formErrors = this.validateForm();

        if (Object.keys(formErrors).length > 0) {
            this.props.setErrors(formErrors);
        } else {
            const {  privateKey } = this.props.form;

            this.props.setLoading(true);
            fetch(`${document.location.origin}/api/wallet-info`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ privateKey }),
            })
                .then((response) => response.json())
                .then((json) => {
                    alert(json.message || json.type); //message when error
                    this.setState({ WalletInfo: json });
                    this.props.setLoading(false);
                });
        }
    };

    render() {
        return (
            <div className="CreateWallet">
                <Form className="WalletInfoForm">
                    <h3>My Wallet Info</h3>

                    <br />

                    <FormGroup
                        controlId="privateKey"
                    >
                        <Form.Label>
                            Enter your private Key:{" "}
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
                            isInvalid={!!this.props.errors.privateKey}
                        />
                        <Form.Control.Feedback type="invalid">
                            {this.props.errors.privateKey}
                        </Form.Control.Feedback>
                    </FormGroup>
                    <br />

                    <div>
                        {this.props.loading ? (
                            <Spinner animation="border" />
                        ) : (
                            <Button
                                // bsStyle="danger"
                                onClick={this.getWalletInfo}
                            >
                                Get
                            </Button>
                        )}
                    </div>
                </Form>

                <div hidden={this.state.WalletInfo.data.createdPolls.length < 1} className="WalletInfoTable">
                    <h3>Polls Created by This Wallet </h3>
                    <br></br>
                    <Table striped bordered hover variant="dark" >
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Id</th>
                                <th>name</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                            </tr>
                        </thead>
                        <tbody>
                    {this.state.WalletInfo.data.createdPolls.map((poll,index) => {
                        return (
                            <tr key={index} className="longTextTable">
                                <td style={{whiteSpace: "nowrap"}}>{`${index+1}`}</td>
                                <td  className="longTextTable">{`${poll.id}`}</td>
                                <td  style={{whiteSpace: "nowrap"}}>{`${poll.output.name} `}</td>
                                <td className="longTextTable"> {`${new Date(poll.output.startDate)}`}</td>
                                <td className="longTextTable"> {`${new Date(poll.output.endDate)}`}</td>
                            </tr>
                        );
                    })}
                       
                        </tbody>
                    </Table>
                </div>
                    <br/>
                <div hidden={this.state.WalletInfo.data.validToVotePolls.length < 1} className="WalletInfoTable">
                    <h3>Polls this Wallet is Registered on to Vote </h3>
                    <br></br>
                    <Table striped bordered hover variant="dark" >
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Id</th>
                                <th>name</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Created Date</th>
                            </tr>
                        </thead>
                        <tbody>
                    {this.state.WalletInfo.data.validToVotePolls.map((poll,index) => {
                        return (
                            <tr key={poll.Id } className="longTextTable" >
                                <td style={{whiteSpace: "nowrap"}}>{`${index+1}`}</td>
                                <td  className="longTextTable">{`${poll.id}`}</td>
                                <td  style={{whiteSpace: "nowrap"}}>{`${poll.output.name} `}</td>
                                <td className="longTextTable"> {`${new Date(poll.output.startDate)}`}</td>
                                <td className="longTextTable"> {`${new Date(poll.output.endDate)}`}</td>
                                <td className="longTextTable"> {`${new Date(poll.input.timeStamp)}`}</td>
                            </tr>
                        );
                    })}
                       
                        </tbody>
                    </Table>
                </div>

                
                <br/>
                <div hidden={this.state.WalletInfo.data.ballots.length < 1} className="WalletInfoBallotTable">
                    <h3>Ballots Created by This Wallet </h3>
                    <br></br>
                    <Table striped bordered hover variant="dark" >
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Id</th>
                                <th>Poll Id</th>
                                <th>Poll name</th>
                                <th  style={{whiteSpace: "nowrap"}}>Voted For</th>
                                <th>Vote Date</th>
                            </tr>
                        </thead>
                        <tbody>
                    {this.state.WalletInfo.data.ballots.map((ballot,index) => {
                        return (
                            <tr key={ballot.Id } className="longTextTable">
                                <td style={{whiteSpace: "nowrap"}}>{`${index+1}`}</td>
                                <td  className="longTextTable">{`${ballot.id}`}</td>
                                <td >{`${ballot.output.pollId} `}</td>
                                <td  style={{whiteSpace: "nowrap"}}>{`${this.state.WalletInfo.data.validToVotePolls.find(poll=> poll.id === ballot.output.pollId).output.name} `}</td>
                                <td className="longTextTable" style={{whiteSpace: "nowrap"}}> {`${ ballot.output.voteOption}`}</td>
                                <td className="longTextTable"> {`${new Date(ballot.input.timeStamp)}`}</td>
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
        <WalletInfo
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
