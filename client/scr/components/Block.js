import React, { Component } from "react";
import { Button } from "react-bootstrap";

class Block extends Component {

    //to select if we want a breif display or deatiled  
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
                    {JSON.stringify(data)}
                    <br />
                    <Button
                        bsStyle="danger"
                        bsSize="small"
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
                    bsStyle="danger"
                    bsSize="small"
                    onClick={this.toggleTransaction}
                >Show More
                </Button>
            </div>
        );

    }

    render() {


        const { timeStamp, hash } = this.props.block;

        const hashDisplay = `${hash.substring(0, 15)}...`;


        return (
            <div className="Block">
                <div> Hash: {hashDisplay}</div>
                <div> TimeStamp: {new Date(timeStamp).toLocaleString()}</div>
                {this.displayTransaction}
            </div>
        );
    }
};

export default Block;