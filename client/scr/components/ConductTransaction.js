import React, { Component } from "react";
import { FormGroup, FormControl,Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";


class ConductTransaction extends Component {

    state = {
        privateKey: '',
        recipient: '',
        amount: 0
    };

    //an event object created with react
    updatePrivateKey = event => {
        this.setState({ privateKey: event.target.value });
    }

    //an event object created with react
    updateRecipient = event => {
        this.setState({ recipient: event.target.value });
    }

    //an event object created with react
    updateAmount = event => {
        this.setState({ amount: Number(event.target.value) });
    }

    conductTransaction = () =>{
        const {privateKey, recipient, amount} = this.state;

        const data = {
                recipient,
                amount
        }

        fetch(`${document.location.origin}/api/transact`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({privateKey,data})
        }).then(response => response.json())
        .then(json =>{
            alert(json.message || json.type);//message when error
            this.props.navigation('/transaction-pool') 
        })
    };


    render() {
        // console.log('this.state', this.state);
        return (
            <div className="ConductTransaction">
                {/* <Link to='/'>Home</Link> */}
                <h3>Conduct a Currency Transaction</h3>
                <FormGroup>
                    <FormControl
                        inputMode='text'
                        placeholder="Private Key 041eb5ggfccex234...."
                        value={this.state.privateKey}
                        onChange={this.updatePrivateKey}
                    />
                </FormGroup>
                <FormGroup>
                    <FormControl
                        input='text'
                        placeholder="recipient"
                        value={this.state.recipient}
                        onChange={this.updateRecipient}
                    />
                </FormGroup>
                <FormGroup>
                    <FormControl
                        inputMode='number'
                        placeholder="amount"
                        value={this.state.amount}
                        onChange={this.updateAmount}
                    />
                </FormGroup>
                <div>
                    <Button
                    // bsStyle="danger"
                    onClick={this.conductTransaction}
                    >
                        Submit
                    </Button>
                </div>
            </div>
        )
    }
};

export default function(props) {
    const navigation = useNavigate();
  
    return <ConductTransaction {...props} navigation={navigation} />;
  }