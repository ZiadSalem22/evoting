import React from "react";
import { Badge, Col, Container, Row } from "react-bootstrap";
import { TRANSACTION_TYPE } from "../../../config";

//stateless functional style of creating a component
const Transaction = ({ transaction }) => {


    const { id, transactionType, input, output, outputMap } = transaction;

    switch (transactionType) {

        case TRANSACTION_TYPE.POLL:
            const options = Object.values(output.options);
            const voters = Object.values(output.voters);
            const endDate = new Date(output.endDate).toLocaleString() || '';

            return (
                <div className="Poll">
                    <Container>
                        <Row>
                            <Col><Badge style={{ fontSize: "17px" }} bg="light" text="dark">Transaction/Poll Id: {`${id}`}</Badge><br /> <div style={{ whiteSpace: "nowrap" }}></div></Col>
                            <Row>
                                <Col><br /><Badge style={{ fontSize: "14px" }} >Transaction Type: {transactionType}</Badge></Col>
                                <Col><br /><Badge style={{ fontSize: "14px" }} bg="light" text="dark">TimeStamp:  {`${new Date(input.timeStamp).toLocaleString()}`}</Badge>  </Col>
                            </Row>
                        </Row>
                        <br />
                        <Row>
                            <Col><Badge style={{ fontSize: "14px" }} bg="info" text="dark">From Address:</Badge><br />{`${input.address}`} </Col>
                        </Row>
                        <Row>
                            <Col> <Badge style={{ fontSize: "14px" }} bg="info" text="dark">Signature:</Badge>
                                <Row><div>{`r:${input.signature.r}`}</div></Row>
                                <Row><div>{`s: ${input.signature.s}`}</div></Row>
                                <Row><div>{`recoveryParam: ${input.signature.recoveryParam}`} </div></Row>
                            </Col>
                        </Row>
                        <Row>
                            <Col><Badge style={{ fontSize: "14px" }} bg="warning" text="dark">Poll Name:</Badge><br /> <br /><Badge style={{ fontSize: "17px" }} bg="light" text="dark"> {`${output.name}`}</Badge></Col>
                        </Row>
                        <Row>
                            <Col><Badge style={{ fontSize: "14px" }} bg="warning" text="dark">Start Date:</Badge><br /> <Badge style={{ fontSize: "17px" }} bg="light" text="dark"> {`${new Date(output.startDate).toLocaleString()}`}</Badge></Col>
                            <Col><Badge style={{ fontSize: "14px" }} bg="warning" text="dark"> End Date:</Badge><br /><Badge style={{ fontSize: "17px" }} bg="light" text="dark"> {`${new Date(output.endDate).toLocaleString()}`}</Badge></Col>
                        </Row>
                        <br />
                        <Row>
                            <Col><Badge style={{ fontSize: "14px" }} bg="warning" text="dark">Options [{options.length}]: </Badge></Col>
                        </Row>
                        <Row>
                            {
                                options.map(option => (
                                    <div key={option}>
                                        <br />
                                        <Badge style={{ whiteSpace: "normal", fontSize: "14px" }} bg="light" text="dark" >{`${option}`}</Badge>
                                    </div>
                                )
                                )
                            }
                        </Row>
                        <br />
                        <br />

                        <Row>
                            <Col><Badge style={{ fontSize: "14px" }} bg="warning" text="dark">Voters [{voters.length}]: </Badge></Col>
                        </Row>
                        <Row>
                            {
                                voters.map(voter => (
                                    <div key={voter}>
                                        <br />
                                        <div style={{ fontSize: "14px" }} >{`${voter}`}</div>
                                    </div>
                                )
                                )
                            }
                        </Row>
                    </Container>
                </div>
            )
            break;

        case TRANSACTION_TYPE.BALLOT:

            return (
                <div className="Ballot">
                    <Container>

                        <Row>
                            <Col><Badge style={{ fontSize: "17px" }} bg="light" text="dark">Transaction/Ballot Id: {`${id}`}</Badge><br /> <div style={{ whiteSpace: "nowrap" }}></div></Col>
                            <Row>
                                <Col><br /><Badge style={{ fontSize: "14px" }}>Transaction Type: {transactionType}</Badge></Col>
                                <Col><br /><Badge style={{ fontSize: "14px" }} bg="light" text="dark">TimeStamp:  {`${new Date(input.timeStamp).toLocaleString()}`}</Badge>  </Col>
                            </Row>
                        </Row>
                        <br />
                        <Row>
                            <Col><Badge style={{ fontSize: "14px" }} bg="info" text="dark">From Address:</Badge><br />{`${input.address}`} </Col>
                        </Row>
                        <Row>
                            <Col> <Badge style={{ fontSize: "14px" }} bg="info" text="dark">Signature:</Badge>
                                <Row><div>{`r:${input.signature.r}`}</div></Row>
                                <Row><div>{`s: ${input.signature.s}`}</div></Row>
                                <Row><div>{`recoveryParam: ${input.signature.recoveryParam}`} </div></Row>
                            </Col>
                        </Row>
                        <Row>
                            <Col><Badge style={{ fontSize: "14px" }} bg="warning" text="dark">Poll Id:</Badge><br/><br/><Badge style={{ whiteSpace: "normal", fontSize: "14px" }} bg="light" text="dark" >{`${output.pollId}`}</Badge></Col>
                        </Row>
                        <br/>
                        <Row>
                            <Col>
                                <Badge style={{ fontSize: "14px" }} bg="warning" text="dark">Voted Option: </Badge><br /><br/><Badge style={{ whiteSpace: "normal", fontSize: "14px" }} bg="light" text="dark" >{`${output.voteOption}`}</Badge></Col>
                        </Row>

                    </Container>
                </div>
            )
            break;

        default:
            const recipient = Object.keys(outputMap);

            return (
                <div className="Transaction">
                    <Container>
                        <Row>
                            <Col><Badge style={{ fontSize: "17px" }} bg="light" text="dark">Transaction Id: {`${id}`}</Badge><br /> <div style={{ whiteSpace: "nowrap" }}></div></Col>
                            <Row>
                                <Col><br /><Badge style={{ fontSize: "14px" }} bg="success">Transaction Type: {transactionType}</Badge></Col>
                                <Col><br /><Badge style={{ fontSize: "14px" }} bg="light" text="dark">TimeStamp:  {`${new Date(input.timeStamp).toLocaleString()}`}</Badge>  </Col>
                            </Row>
                        </Row>
                        <br />
                        <Row>
                            <Col><Badge style={{ fontSize: "14px" }} bg="danger">From Address:</Badge><br />{`${input.address}`} </Col>
                            <Col><Badge style={{ fontSize: "14px" }} bg="danger">Balance: </Badge>{input.amount}</Col>
                        </Row>
                        <Row>
                            {
                                recipient.map(recipient => (

                                    <div key={recipient}>
                                        <br />
                                        <Badge bg="success" style={{ whiteSpace: "normal", fontSize: "14px" }}> To:</Badge> {`${recipient}`} : <Badge style={{ fontSize: "14px" }} bg="success" > sent: {outputMap[recipient]}</Badge>

                                    </div>
                                )
                                )
                            }
                        </Row>
                    </Container>



                </div>
            )
    }
};

export default Transaction;