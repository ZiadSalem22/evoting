import React, { Component, useState } from "react"; // default, {secondary}
import logo from "../assets/HNEC_Logo.png";
import { Link } from "react-router-dom";
import { Spinner, Table } from "react-bootstrap";

class Home extends Component {
    state = {
        blocks: [],
        votes: {},
        polls:[],
    };

    componentDidMount() {

        this.props.setLoading(true);

        fetch(`${document.location.origin}/api/blocks`)
            .then((response) => response.json())
            .then((json) => {
                this.setState({ blocks: json.reverse() });
            });
        fetch(`${document.location.origin}/api/voting-data`)
            .then((response) => response.json())
            .then((json) => {
                this.setState({ votes: json.data.votedOptions,polls: json.data.rawVotingData.polls });
            });

        this.props.setLoading(false);
    }
    render() {
        return (
            <div className="Home">
                <img className="logo" src={logo}></img>
                <br />
                <div>
                    <h1>Welcome to the Libyan E-Voting Blockchain Platform </h1>
                </div>
                <br />
                <h2>Votes</h2>
                {this.props.loading ? (
                    <Spinner animation="border" />
                ) : (
                    <div className="HomeTable">
                        <Table striped bordered hover variant="dark">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Poll Id</th>
                                    <th>Poll name</th>
                                    <th>Votes</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(this.state.votes).map((poll, index) => {
                                    return (
                                        <tr key={poll[0]}className="longTextTable">
                                            <td>{`${index} `}</td>
                                            <td >{`${poll[0]}`}</td>
                                            <td className="longTextTable" style={{ whiteSpace: "nowrap" }}>{`${this.state.polls.find(p => p.id ===poll[0]).output.name}`}</td>
                                            <td className="longTextTable">

                                             {  poll[1].sort(function(a, b) {return b[1] - a[1];}).map((option,index) =>{
                                                return(<div key={option} dir="rtl">
                                                   {
                                                     `[ `+ `${option[1]} ` + '-' + ` ${option[0]} ] ` +':'+`${ index+1}`
                                                    }
                                                    </div>)
                                                }) }
                                            </td>
                                            {
                                                (new Date(this.state.polls.find(p => p.id === poll[0]).output.endDate )< new Date(Date.now()) ) ?
                                                <td>Ended</td> :
                                                <td>
                                                    <div>Live</div>
                                                    <div>End Date: </div>
                                                    <div>{`${new Date(this.state.polls.find(p => p.id === poll[0]).output.endDate ).toLocaleString()}`}  </div>
                                                </td>
                                            }
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>
                )}
                <br />
                <h3>Blocks</h3>
                {this.props.loading ? (
                    <Spinner animation="border" />
                ) : (
                    <div className="HomeTable">
                        <Table striped bordered hover variant="dark">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Time Stamp</th>
                                    <th>Hash</th>
                                    <th>Last Hash</th>
                                    <th>Transactions</th>
                                    <th>Difficulty</th>
                                    <th>nonce</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.blocks.map((block, index) => {
                                    return (
                                        <tr
                                            key={block.hash}
                                            className="longTextTable"
                                        >
                                            <td
                                                style={{ whiteSpace: "nowrap" }}
                                            >{`${this.state.blocks.length -
                                                1 -
                                                this.state.blocks.indexOf(block)
                                                }`}</td>
                                            <td className="longTextTable">{`${new Date(
                                                block.timeStamp
                                            ).toLocaleString()}`}</td>
                                            <td>{`${block.hash} `}</td>
                                            <td className="longTextTable">
                                                {" "}
                                                {`${block.lastHash}`}
                                            </td>
                                            <td className="longTextTable">
                                                {" "}
                                                {`${Object.keys(block.data)
                                                        .length + 1
                                                    }`}
                                            </td>
                                            <td className="longTextTable">
                                                {" "}
                                                {`${block.difficulty}`}
                                            </td>
                                            <td className="longTextTable">
                                                {" "}
                                                {`${block.nonce}`}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>
                )}
            </div>
        );
    }
}

export default function (props) {
    const [loading, setLoading] = useState(false);

    return <Home {...props} loading={loading} setLoading={setLoading} />;
}
