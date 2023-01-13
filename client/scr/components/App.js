import React,{Component} from "react";// default, {secondary}
import Blocks from "./Blocks";
import logo from '../assests/HNEC_Logo.png'

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
                <div>Welcome to the E-Voting Blockchain</div>
                <div className="WalletInfo">
                <div>Address: {address}</div>
                <div>PivateKey: {privateKey}</div>
                <div>Balnace: {balance}</div>
                </div>
                <br/>
                <Blocks/>
            </div>
        )
    }
}

export default App;