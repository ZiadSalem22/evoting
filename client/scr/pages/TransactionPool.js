import React, { Component, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import Transaction from "../components/Transaction";
import { useNavigate } from "react-router-dom";

const POLL_INTERVAL_MS = 10000;

class TransactionPool extends Component {
    state = {
        transactionPoolMap: {},
    };

    fetchTransactionPoolMap = () => {

        this.props.setLoading(true);
        fetch(`${document.location.origin}/api/transaction-pool-map`)
            .then((response) => response.json())
            .then((json) => {
                this.setState({ transactionPoolMap: json });
                this.props.setLoading(false);
            });
    };

    fetchMineTransactions = () => {
        this.props.setLoading(true);
        fetch(`${document.location.origin}/api/mine-transactions`).then(
            (response) => {
                if (response.status == 200) {
                    alert("success");
                    this.props.navigation("/blocks");
                } else {
                    alert(
                        "the mine-transaction block request did not complete"
                    );
                }
                this.props.setLoading(false);
            }
        );
    };

    // run code as soon as we call the component  on html document it will fetch the pool
    componentDidMount() {
        this.fetchTransactionPoolMap();

        //this is how we set interval for js components
        this.fetchPoolInterval = setInterval(
            () => this.fetchTransactionPoolMap(),
            POLL_INTERVAL_MS
        );
    }

    //run code when we the component is removed from html document
    componentWillUnmount() {
        clearInterval(this.fetchPoolInterval);
    }

    render() {
        const { navigation } = this.props;
        return (
            <div className="TransactionPool">
                <h3>Transaction Pool</h3>
                {Object.values(this.state.transactionPoolMap).map(
                    (transaction) => {
                        return (
                            <div key={transaction.id}>
                                <hr />
                                <Transaction transaction={transaction} />
                            </div>
                        );
                    }
                )}
                <hr />
                {this.props.loading ? (
                            <Spinner animation="border" />
                        ) : (
                            <Button onClick={this.fetchMineTransactions}>
                            Mine the Transactions
                        </Button>
                        )}
               
            </div>
        );
    }
}

export default function (props) {
    const navigation = useNavigate();
    const [loading, setLoading] = useState(false);

    return (
        <TransactionPool
            {...props}
            navigation={navigation}
            loading={loading}
            setLoading={setLoading}
        />
    );
}
