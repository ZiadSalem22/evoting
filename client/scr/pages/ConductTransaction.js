import React, { Component, useState } from "react";
import { FormGroup, FormControl, Button, Form } from "react-bootstrap";
import { ThemeConsumer } from "react-bootstrap/esm/ThemeProvider";
import { Link, useNavigate } from "react-router-dom";


class ConductTransaction extends Component {


    // state = {
    //     privateKey: '',
    //     recipient: '',
    //     amount: 0
    // };

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

    validateForm = () => {
        const { amount, recipient ,privateKey } = this.props.form
        const newErrors = {}

        if (!recipient || recipient.trim() === '') {
            newErrors.recipient = 'please enter your recipient address';
        }else if (recipient.length !== 130){
            newErrors.recipient = 'please enter valid recipient address example \n 0497f2b16ecde8cf1ce5165ce437c6c25db3860606aeed436371cec3fa35c22c378bf1c10ac4f0c53358bbb26ffaef2ad2d0dcf75982fc2b721237ab53ebcc0268 ';
        }

        if (!privateKey || privateKey.trim() === '') {
            newErrors.privateKey = 'please enter your privateKey';
        }else if (privateKey.length < '55685527491970eb3000f6cd279e43151cb854fb2fa2c44e23ffb985c841d850'.length){
            newErrors.privateKey = 'please enter valid private address example \n 55685527491970eb3000f6cd279e43151cb854fb2fa2c44e23ffb985c841d850 ';
        }

        if (!amount || amount < 1) {
            newErrors.amount = 'please enter valid amount > 1 ';
        }



        return newErrors
    }


    // //an event object created with react
    // updatePrivateKey = event => {
    //     this.setState({ privateKey: event.target.value });
    // }

    // //an event object created with react
    // updateRecipient = event => {
    //     this.setState({ recipient: event.target.value });
    // }

    // //an event object created with react
    // updateAmount = event => {
    //     this.setState({ amount: Number(event.target.value) });
    // }

    conductTransaction = () => {

        const formErrors = this.validateForm();

        if (Object.keys(formErrors).length > 0) {
            this.props.setErrors(formErrors);

        } else {
            // const { privateKey, } = this.state;
            const { amount, recipient , privateKey} = this.props.form;

            const data = {
                recipient,
                amount
            }

            fetch(`${document.location.origin}/api/transact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ privateKey, data })
            }).then(response => response.json())
                .then(json => {
                    alert(json.message || json.type);//message when error
                    this.props.navigation('/transaction-pool')
                })
        }


    };


    render() {
        return (
            <div className="ConductTransaction">
                <Form className="ConductTransactionForm">

                    <h3>Conduct a Currency Transaction</h3>
                    <FormGroup controlId="privateKey">
                        <Form.Label>Your Private Key:</Form.Label>
                        <FormControl
                            inputMode='text'
                            style={{fontSize:"15px"}}
                            placeholder="Private Key 041eb5ggfccex234...."
                            value={this.props.form.privateKey || ''}
                            onChange={(e) => this.setField('privateKey', e.target.value.trim())}
                            isInvalid={!!this.props.errors.privateKey}
                        />
                        <Form.Control.Feedback type="invalid">
                            {this.props.errors.privateKey}
                        </Form.Control.Feedback>
                    </FormGroup>
                    <br/>
                    <FormGroup controlId="recipient" >
                        <Form.Label>Recipient Wallet Address:</Form.Label>
                        <FormControl
                            type='text'
                            as="textarea" 
                            rows={2} 
                            style={{fontSize:"15px"}}
                            placeholder="recipient"
                            value={this.props.form.recipient || ''}
                            onChange={(e) => this.setField('recipient', e.target.value.trim())}
                            isInvalid={!!this.props.errors.recipient}
                        />
                        <Form.Control.Feedback type="invalid">
                            {this.props.errors.recipient}
                        </Form.Control.Feedback>
                    </FormGroup>


                    <FormGroup controlId="amount" className="amount">
                        <Form.Label>Currency Amount:</Form.Label>
                        <FormControl
                            type='number'
                            placeholder="amount"
                            value={this.props.form.amount || 0}
                            onChange={(e) => this.setField('amount', e.target.value)}
                            isInvalid={!!this.props.errors.amount}
                        />
                        <Form.Control.Feedback type="invalid">
                            {this.props.errors.amount}
                        </Form.Control.Feedback>
                    </FormGroup>

                 <br/>
                    <div>
                        <Button
                            // bsStyle="danger"
                            onClick={this.conductTransaction}
                        >
                            Submit
                        </Button>
                    </div>
                </Form>
            </div>
        )
    }
};

export default function (props) {
    const navigation = useNavigate();

    const [form, setForm] = useState({})
    const [errors, setErrors] = useState({})

    return <ConductTransaction {...props} navigation={navigation} form={form} setForm={setForm} errors={errors} setErrors={setErrors} />;
}