import React, {Component} from "react";
import Block from "../components/Block";
import { Link } from "react-router-dom";

class Blocks extends Component {
    state = {
        blocks :[]
    };

    componentDidMount(){
        fetch(`${document.location.origin}/api/blocks`)
        .then(response => response.json())
        .then(json => this.setState({blocks:json.reverse()}));
    }

    render(){
        return (
            <div className="Blocks">
                {/* <div><Link to="/">Home</Link></div> */}
                <h3>Blocks</h3>
                {
                    
                    this.state.blocks.map(block=> {
                        return (                            
                            <Block key={block.hash} block={block}  blockNumber={this.state.blocks.length - 1- this.state.blocks.indexOf(block) }/>
                        )
                    })
                }
            </div>
        );
    }

}

export default Blocks;