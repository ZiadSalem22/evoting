import React, { Component } from "react";
import { Badge, Button } from "react-bootstrap";
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
            ` Transactions count : ${Object.keys(data).length}` :
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
                <div><Badge  style={{ fontSize: "16px" }} bg="light" text="dark" >Data:</Badge>{dataDisplay}</div>
                <br/>
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
        const blocknumber = this.props.blockNumber;

        // const hashDisplay = `${hash.substring(0, 15)}...`;
        const hashDisplay = `${hash}`;


        return (
            <div className="Block"  onDoubleClick={this.toggleTransaction}>
                <div><Badge style={{ fontSize: "20px" }} bg="dark" text="light">Block#  {`${blocknumber+1}`}</Badge> </div>
                <div><Badge style={{ fontSize: "16px" }} bg="light" text="dark">TimeStamp:  {`${new Date(timeStamp).toLocaleString()}`}</Badge> </div>
                <div> <Badge style={{ fontSize: "16px" }} bg="success" >Hash:</Badge> {hash}</div>
                <div> <Badge style={{ fontSize: "16px" }} bg="secondary" >Last Hash:</Badge> {lastHash}</div>
               <div> <Badge style={{ fontSize: "16px" }} bg="light" text="dark">Difficulty:  {difficulty}</Badge> </div> 
               <div><Badge style={{ fontSize: "16px" }} bg="light" text="dark">nonce:  {nonce}</Badge> </div> 
                {this.displayTransaction}
            </div>
        );
    }
};

export default Block;