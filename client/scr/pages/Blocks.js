import React, { Component, useState } from "react";
import Block from "../components/Block";
import { Link } from "react-router-dom";
import { Spinner } from "react-bootstrap";

class Blocks extends Component {
    state = {
        blocks: [],
    };

    componentDidMount() {
        this.props.setLoading(true);
        fetch(`${document.location.origin}/api/blocks`)
            .then((response) => response.json())
            .then((json) => {
                this.setState({ blocks: json.reverse() });
                this.props.setLoading(false);
            });
    }

    render() {
        return (
            <div className="Blocks">
                {/* <div><Link to="/">Home</Link></div> */}
                <h3>Blocks</h3>

                {this.props.loading ? (
                            <Spinner animation="border" />
                        ) : (
                            this.state.blocks.map((block) => {
                                return (
                                    <Block
                                        key={block.hash}
                                        block={block}
                                        blockNumber={
                                            this.state.blocks.length -
                                            1 -
                                            this.state.blocks.indexOf(block)
                                        }
                                    />
                                );
                            })
                        )}
            </div>
        );
    }
}

export default function (props) {
    const [loading, setLoading] = useState(false);

    return <Blocks {...props} loading={loading} setLoading={setLoading} />;
}
