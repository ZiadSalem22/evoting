import { json } from "body-parser";
import React, { Children, Component, useState } from "react";
import {
    FormGroup,
    FormControl,
    Button,
    Form,
    Row,
    Col,
    Badge,
    Spinner,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

class ConductBallot extends Component {
    state = {
        polls: [],
        options: [],
        ballots: [],
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
        const { pollId, voteOption, privateKey } = this.props.form;
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

        if (!pollId || pollId.trim() === "" || pollId === "Select Poll") {
            newErrors.pollId = "please select a valid poll";
        }

        if (
            !voteOption ||
            voteOption.trim() === "" ||
            voteOption === "Select option"
        ) {
            newErrors.voteOption =
                "please select a valid option for poll this poll";
        }

        return newErrors;
    };

    fetchValidToVotePolls = async () => {
        const formErrors = this.validateForm();

        if (formErrors.privateKey !== undefined) {
            this.props.setErrors(formErrors);
        } else {
            const { privateKey } = this.props.form;
            let tempPolls;

            this.props.setLoading(true);
            await fetch(`${document.location.origin}/api/wallet-info`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ privateKey }),
            })
                .then((response) => response.json())
                .then((json) => {
                    this.setState({
                        polls: json.data.validToVotePolls,
                        ballots: json.data.ballots,
                        options: [],
                    }),
                        (tempPolls = json.data.validToVotePolls);
                    this.props.setLoading(false);
                });

            const Errors = {};
            this.props.setErrors(Errors);

            if (tempPolls.length < 1) {
                Errors.privateKey =
                    "this wallet is not been registered for any polls";
                this.props.setErrors(Errors);
            }
        }
    };

    updatePolls = (event) => {
        const pollId = event.target.value;

        this.setField("pollId", event.target.value);

        if (pollId !== "Select Poll") {
            this.setState({
                options: this.state.polls.find((poll) => poll.id === pollId)
                    .output.options,
            });
        }
    };

    updateVoteOption = (event) => {
        this.setField("voteOption", event.target.value);
    };

    consoleLog = () => {
        console.log("errors", this.props.errors);
    };

    conductBallot = () => {
        const formErrors = this.validateForm();

        if (Object.keys(formErrors).length > 0) {
            this.props.setErrors(formErrors);
        } else {
            const { voteOption, pollId, privateKey } = this.props.form;

            const data = {
                pollId,
                voteOption,
            };
            this.props.setLoading(true);
            fetch(`${document.location.origin}/api/ballot`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ privateKey, data }),
            })
                .then((response) => response.json())
                .then((json) => {
                    alert(json.message || json.type);
                    this.props.setLoading(false);
                    if (!json.message) {
                        this.props.navigation("/transaction-pool");
                    }
                });
        }
    };

    render() {
        return (
            <div className="ConductBallot">
                <Form className="ConductBallotForm">
                    <h3>Conduct a Ballot</h3>

                    <FormGroup controlId="privateKey">
                        <Form.Label>Your Private Key:</Form.Label>
                        <FormControl
                            type="text"
                            className="text"
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
                    {this.props.loading ? (
                        <Spinner animation="border" />
                    ) : (
                        <Button onClick={this.fetchValidToVotePolls}>
                            Get polls
                        </Button>
                    )}

                    <br />

                    <Form.Group
                        controlId="pollId"
                        hidden={this.state.polls.length < 1}
                    >
                        <Form.Label>
                            Available Polls [{`${this.state.polls.length}`}]:
                        </Form.Label>
                        <Form.Control
                            className={
                                !!this.props.errors.pollId && "red-border"
                            }
                            as="select"
                            onChange={this.updatePolls}
                            value={this.props.form.pollId || ""}
                            disabled={this.state.polls.length < 1}
                        >
                            <option>Select Poll</option>
                            {Object.values(this.state.polls).map((poll) => {
                                if (
                                    this.state.ballots
                                        .map((ballot) => ballot.output.pollId)
                                        .find((id) => id === poll.id)
                                ) {
                                    //disabled
                                    return (
                                        <option
                                            key={poll.id}
                                            value={poll.id}
                                            disabled
                                        >
                                            {`${
                                                " ALREADY VOTED FOR THIS POLL :" +
                                                poll.output.name +
                                                "---[" +
                                                poll.id +
                                                "]"
                                            }`}
                                        </option>
                                    );
                                } else {
                                    return (
                                        <option key={poll.id} value={poll.id}>
                                            {`${
                                                poll.output.name +
                                                "---[" +
                                                poll.id +
                                                "]"
                                            }`}
                                        </option>
                                    );
                                }
                            })}
                        </Form.Control>
                        <div className="red">{this.props.errors.pollId}</div>
                    </Form.Group>

                    <br />
                    <Form.Group
                        controlId="exampleForm.SelectCustom"
                        hidden={this.state.options.length < 1}
                    >
                        <Form.Label>
                            Poll Options [{`${this.state.options.length}`}]:
                        </Form.Label>
                        <Form.Control
                            className={
                                !!this.props.errors.pollId && "red-border"
                            }
                            as="select"
                            onChange={this.updateVoteOption}
                            value={this.props.form.voteOption || ""}
                            disabled={this.state.options.length < 1}
                        >
                            <option>Select option</option>
                            {Object.values(this.state.options).map((option) => {
                                return (
                                    <option key={option} value={option}>
                                        {`${option}`}
                                    </option>
                                );
                            })}
                        </Form.Control>
                        <div className="red">
                            {this.props.errors.voteOption}
                        </div>
                    </Form.Group>
                    <br />
                    <div>
                        {this.props.loading ? (
                            <Spinner animation="border" />
                        ) : (
                            <Button
                                // bsStyle="danger"
                                onClick={this.conductBallot}
                            >
                                Vote
                            </Button>
                        )}
                    </div>
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
        <ConductBallot
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
