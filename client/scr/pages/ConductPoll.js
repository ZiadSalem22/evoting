import React, { Component, useState } from "react";
import { FormGroup, FormControl, Button, Form, Row, Col,Spinner, InputGroup } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";


class ConductPoll extends Component {


    setField = (field, value) => {

        this.props.setForm({
            ...this.props.form,
            [field]: value,
        });

        if (!!this.props.errors[field]) {
            this.props.setErrors({
                ...this.props.errors,
                [field]: null
            });
        }


    }

    setOptions

    validateForm = () => {
        const { privateKey,name,voters,options } = this.props.form
        const newErrors = {}


        if (!privateKey || privateKey.trim() === '') {
            newErrors.privateKey = 'please enter your privateKey';
        } else if (privateKey.length < '55685527491970eb3000f6cd279e43151cb854fb2fa2c44e23ffb985c841d850'.length) {
            newErrors.privateKey = 'please enter valid private address example: \n 55685527491970eb3000f6cd279e43151cb854fb2fa2c44e23ffb985c841d850 ';
        }

        if (!name || name.trim() === '') {
            newErrors.name = 'please enter  Poll name';
        }

        if (!voters || voters.trim() === '') {
            newErrors.voters = 'please enter  voters  example: \n  041edb189e622ad16be5342e58b62ad4b792238db92470518234733a4bc8e043517896747117fa3cde0173b87edd671e41c220fad9c00640111d5f2ea67d8a7512, 0488da83e234c789f84f1a2f9181f71b3b8b4d413031a902cb377431a30ebaf783e4f33b798a6895ab4fff56afa60b18dd2ff5ba347f12207e0cd1064d1a56eb28,    04e9a612720f08aa9f423e5016919fa9f2f40031c0e1505789ac8f930d60dcea117b1f4416bbf8a1135409efdc022d9028cf61a7b7e7955fc5d61aac5b834e410e';
        }

        if (!options || options.trim() === '') {
            newErrors.options = 'please enter options example: \n option 1, option 2 , option 3';
        }



        return newErrors
    }


    // //an event object created with react
    // updatePrivateKey = event => {
    //     this.setState({ privateKey: event.target.value });
    // }



    conductPoll = () => {

        const formErrors = this.validateForm();

        if (Object.keys(formErrors).length > 0) {
            this.props.setErrors(formErrors);

        } else {
            const { name, options, voters, startDate, endDate, privateKey, } = this.props.form;

            let nSD, nED;
            if (startDate) {
                nSD = startDate + ':00'
            }

            if (endDate) {
                nED = endDate + ':00'
            }

            const data = {
                name: name.trim() || undefined,
                options: options.split(',').map(s => s.trim()).filter(s => s !== ''),
                voters: voters.split(',').map(s => s.trim()).filter(s => s !== ''),
                startDate: nSD || undefined,
                endDate: nED || undefined
            }
            this.props.setLoading(true);
            fetch(`${document.location.origin}/api/poll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ privateKey, data })
            }).then(response => response.json())
                .then(json => {
                    alert(json.message || json.type);
                    this.props.setLoading(false);
                    if (!json.message || json.message === 'Please mine a new new block before adding another Poll to the Pool from the same wallet') {
                        this.props.navigation('/transaction-pool');
                    }
                })
        }


    };


    render() {
        return (
            <div className="ConductPoll">
                <Form className="ConductPollForm">

                    <h3>Conduct a New Poll</h3>
                    <FormGroup controlId="privateKey">
                        <Form.Label>Your Private Key: *</Form.Label>
                        <FormControl
                            type='text'
                            className="text"
                            placeholder="Private Key 041eb5ggfccex234...."
                            value={this.props.form.privateKey || ''}
                            onChange={(e) => this.setField('privateKey', e.target.value.trim())}
                            isInvalid={!!this.props.errors.privateKey}
                        />
                        <Form.Control.Feedback type="invalid">
                            {this.props.errors.privateKey}
                        </Form.Control.Feedback>
                    </FormGroup>
                    <br />
                    <FormGroup controlId="pollName" >
                        <Form.Label>Name:  *</Form.Label>
                        <FormControl
                            type='text'
                            className="text"
                            placeholder="enter poll name"
                            value={this.props.form.name || ''}
                            onChange={(e) => this.setField('name', e.target.value)}
                            isInvalid={!!this.props.errors.name}
                        />
                        <Form.Control.Feedback type="invalid">
                            {this.props.errors.name}
                        </Form.Control.Feedback>
                    </FormGroup>

                    <FormGroup controlId="pollOptions" className="pollOptions">
                        <Form.Label>Poll Options: *</Form.Label>
                        <FormControl
                            className="text"
                            type='text'
                            as="textarea"
                            rows={5}
                            placeholder="enter voting options separated by ',' example: option1,option2 "
                            value={this.props.form.options || ""}
                            onChange={(e) => this.setField('options', e.target.value)}
                            isInvalid={!!this.props.errors.options}
                        />
                        <Form.Control.Feedback type="invalid">
                            {this.props.errors.options}
                        </Form.Control.Feedback>
                    </FormGroup>

                    <FormGroup controlId="pollVoters" className="pollVoters">
                        <Form.Label>Poll Voters: *</Form.Label>
                        <FormControl
                            className="text"
                            type='text'
                            as="textarea"
                            rows={5}
                            placeholder="enter voters addresses separated by ',' example: 0e3...,04e"
                            value={this.props.form.voters || ""}
                            onChange={(e) => this.setField('voters', e.target.value)}
                            isInvalid={!!this.props.errors.voters}
                        />
                        <Form.Control.Feedback type="invalid">
                            {this.props.errors.voters}
                        </Form.Control.Feedback>
                    </FormGroup>

                    <FormGroup controlId="pollStartDate" className="formDate">
                        <Form.Label>Start Date:</Form.Label>
                        <FormControl
                            className="text"
                            type='datetime-local'
                            value={this.props.form.startDate || ""}
                            onChange={(e) => this.setField('startDate', e.target.value)}
                            isInvalid={!!this.props.errors.startDate}
                        />
                        <Form.Control.Feedback type="invalid">
                            {this.props.errors.startDate}
                        </Form.Control.Feedback>
                    </FormGroup>


                    <FormGroup controlId="pollEndDate" className="formDate">
                        <Form.Label>End Time:</Form.Label>
                        <FormControl
                            className="text"
                            type='datetime-local'
                            value={this.props.form.endDate || ""}
                            onChange={(e) => this.setField('endDate', e.target.value)}
                            isInvalid={!!this.props.errors.endDate}
                        />
                        <Form.Control.Feedback type="invalid">
                            {this.props.errors.endDate}
                        </Form.Control.Feedback>
                    </FormGroup>





                    <br />
                    <div>
                    {this.props.loading ? (
                            <Spinner animation="border" />
                        ) : (
                            <Button
                            // bsStyle="danger"
                            onClick={this.conductPoll}
                        >
                            Submit
                        </Button>
                        )}

                      
                    </div>
                </Form>
            </div>
        )
    }
};

export default function (props) {
    const navigation = useNavigate();

    const [form, setForm] = useState({
        name:"",
        options: "",
        voters: ""
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false);


    return <ConductPoll {...props}
        navigation={navigation} form={form} setForm={setForm} errors={errors} setErrors={setErrors}
        loading={loading}
        setLoading={setLoading} />;
}
