import React,{Component} from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Transaction from "./Transaction";
import history from "../history";

const POLL_INTERVAL_MS = 10000;

class TransactionPool extends Component{

    state = {
        transactionPoolMap:{}
    };

    fetchTransactionPoolMap = () =>{

        fetch(`${document.location.origin}/api/transaction-pool-map`)
        .then(response => response.json())
        .then(json => this.setState({ transactionPoolMap : json}));
    }
    
    fetchMineTransactions =() =>{
        
        fetch(`${document.location.origin}/api/mine-transactions`)
        .then(response =>{
            if (response.status == 200){
                alert('success');
                history.push('/blocks');
            } else {
                alert('the mine-transaction block request did not complete')
                
            }
        })
    }

    // run code as soon as we call the component  on html document it will fetch the pool
    componentDidMount(){
        this.fetchTransactionPoolMap();

        //this is how we set interval for js components 
        this.fetchPoolInterval = setInterval(() => this.fetchTransactionPoolMap(),
        POLL_INTERVAL_MS
        );
    }

    //run code when we the component is removed from html document
    componentWillUnmount(){
        clearInterval(this.fetchPoolInterval);
    }

    render(){
        return(
            <div className="TransactionPool"> 
                <div><Link to='/'>Home</Link></div>
                <h3>Transaction Pool</h3>
                {
                    Object.values(this.state.transactionPoolMap).map(transaction =>{
                        return(
                            <div key={transaction.id}>
                                <hr/>
                                <Transaction transaction={transaction}/>
                            </div>
                        )
                    } )
                }
                <hr/>
                <Button 
                bsStyle="success"
                onClick={this.fetchMineTransactions}
                >
                    Mine the Transactions
                </Button>
            </div>
        )
    }

}

export default TransactionPool;