import React,{Component} from "react";// default, {secondary}
import logo from '../assets/HNEC_Logo.png'
import { Link } from "react-router-dom";

class Home extends Component {
    state = {
        minerWalletInfo :{}
    }

    componentDidMount(){
        fetch(`${document.location.origin}/api/miner-wallet-info`)
        .then(response => response.json())
        .then(json => this.setState({minerWalletInfo:json}));
    }
    render() {
        const { address, privateKey, balance} = this.state.minerWalletInfo;
        return(
            <div className="Home"> 
                <img className="logo" src={logo}></img>
                <br/>
                <div>Welcome to the Libyan E-Voting Platform Blockchain</div>
                <br/>
                {/* <div> <Link to="/blocks">Blocks</Link></div>
                <div> <Link to="/conduct-transaction">Create a Currency Transaction</Link></div>
                <div> <Link to="/transaction-pool">Transaction Pool</Link></div> */}
                <div className="WalletInfo">
                <div>Address: {address}</div>
                <div>PrivateKey: {privateKey}</div>
                <div>Balance: {balance}</div>
                </div>
            </div>
        )
    }
}

export default Home;