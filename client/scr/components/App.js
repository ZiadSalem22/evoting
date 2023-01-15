import React,{Component} from "react";// default, {secondary}
import logo from '../assests/HNEC_Logo.png'
import { Link } from "react-router-dom";

class App extends Component {
    state = {
        minerWalletInfo :{}
    }

    componentDidMount(){
        fetch('http://localhost:3000/api/miner-wallet-info')
        .then(response => response.json())
        .then(json => this.setState({minerWalletInfo:json}));
    }
    render() {
        const { address, privateKey, balance} = this.state.minerWalletInfo;
        return(
            <div className="App"> 
                <img className="logo" src={logo}></img>
                <br/>
                <div>Welcome to the Libyan E-Voting Platform Blockchain</div>
                <br/>
                <div> <Link to="/blocks">Blocks</Link></div>
                <div> <Link to="/conduct-transaction">Create a Currency Transaction</Link></div>
                <br/>
                <div className="WalletInfo">
                <div>Address: {address}</div>
                <div>PrivateKey: {privateKey}</div>
                <div>Balance: {balance}</div>
                </div>
            </div>
        )
    }
}

export default App;