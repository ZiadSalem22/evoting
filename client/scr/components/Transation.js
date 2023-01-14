import React from "react";
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
                <div className="Transaction">
                    <div>Transaction/Poll Id: {`${id}`} | Transaction Type: {`${transactionType}`} </div>
                    <div>TimeStamp: {`${new Date(input.timeStamp).toLocaleString()}`} </div>
                    <div>From address: {`${input.address}`} </div>
                    <div>Signature: </div>
                    <div>{`r:${input.signature.r}`}</div>
                    <div>{`s: ${input.signature.s}`}</div>
                    <div>{`recoveryParam: ${input.signature.recoveryParam}`} </div>
                    <div>Poll Name: {`${output.name}`} </div>
                    <div>Strat Date: {`${new Date(output.startDate).toLocaleString()}`} | End Date {`${endDate}`} </div>
                    <br></br>
                    <div>Options [{options.length}]:  {
                        options.map(option => (
                            <div key={option}>{`${option}`}</div>
                        )
                        )
                    } </div>
                    <br></br>
                    <div>Voters [{voters.length}]:  {
                        voters.map(voter => (
                            <div key={voter}>{`${voter}`}</div>
                        )
                        )
                    }</div>
                   
                </div>
            )
            break;

        case TRANSACTION_TYPE.BALLOT:

            return (
                <div className="Transaction">
                    <div>Transaction/Ballot Id: {`${id}`} | Transaction Type: {`${transactionType}`} </div>
                    <div>TimeStamp: {`${new Date(input.timeStamp).toLocaleString()}`} </div>
                    <div>From address: {`${input.address}`} </div>
                    <div>Signature: </div>
                    <div>{`r:${input.signature.r}`}</div>
                    <div>{`s: ${input.signature.s}`}</div>
                    <div>{`recoveryParam: ${input.signature.recoveryParam}`} </div>
                    <div>Poll Id:{`${output.pollId}`} </div>
                    <div>voted Option:  {`[${output.voteOption}]`} </div>
                </div>
            )
            break;

        default:
            const recipient = Object.keys(outputMap);

            return (
                <div className="Transaction">
                    <div>Transaction Id: {`${id}`} | transaction Type: {`${transactionType}`}</div>
                    <div>TimeStamp: {`${new Date(input.timeStamp).toLocaleString()}`} </div>
                    <div>From address: {`${input.address}`} </div>
                    {/* <div>Signature: </div>
                    <div>{`r:${input.signature.r}`}</div>
                    <div>{`s: ${input.signature.s}`}</div>
                    <div>{`recoveryParam: ${input.signature.recoveryParam}`} </div> */}
                    <div>From: {`${input.address}`} | Balnace: {input.amount}</div>
                    {
                        recipient.map(recipient => (
                            <div key={recipient}>
                                To:{`${recipient}`} : sent {outputMap[recipient]}
                            </div>
                        )
                        )
                    }
                </div>
            )
    }
};

export default Transaction;