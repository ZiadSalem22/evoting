import React, { Component } from "react";
import { Button } from "react-bootstrap";
import Transaction from "./Transaction";


class Block extends Component {

    //to select if we want a brief display or detailed  
    state = {
        displayTransaction: false
    };

    //to change the transaction display
    toggleTransaction = () => {
        this.setState({ displayTransaction: !this.state.displayTransaction });
    }


    //this is a computer function that returns any vaule we set for it in this case it returns a jsx div
    get displayTransaction() {
        const { data } = this.props.block;

        const stringifiedData = JSON.stringify(data);

        const dataDisplay = stringifiedData.length > 35 ?
            `${stringifiedData.substring(0, 35)}...` :
            stringifiedData;

        if (this.state.displayTransaction) {
            return (
                <div>
                    {
                        data.map(transaction =>(
                            <div key={transaction.id}>
                                <hr/>
                                <Transaction transaction={transaction}/>
                            </div>
                        ))
                    }
                    <br />
                    <Button
                        // bsStyle="success"
                        // bsSize="small"
                        onClick={this.toggleTransaction}
                    >Show Less
                    </Button>
                </div>
            )
        }


        return (
            <div>
                <div>Data: {dataDisplay}</div>
                <Button
                    // bsStyle="success"
                    // bsSize="small"
                    onClick={this.toggleTransaction}
                >Show More
                </Button>
            </div>
        );

    }

    render() {


        const { timeStamp, hash, lastHash, nonce, difficulty } = this.props.block;

        // const hashDisplay = `${hash.substring(0, 15)}...`;
        const hashDisplay = `${hash}`;


        return (
            <div className="Block"  onDoubleClick={this.toggleTransaction}>
                <div> TimeStamp: {new Date(timeStamp).toLocaleString()}</div>
                <div> Hash: {hash}</div>
                <div> Last Hash: {lastHash}</div>
                <div> Difficulty: {difficulty}</div>
                <div> nonce: {nonce}</div>
                {this.displayTransaction}
            </div>
        );
    }
};

export default Block;