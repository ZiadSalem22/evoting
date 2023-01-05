const { stringify } = require('uuid');
const uuid = require('uuid/'); // uuid v1 is time stamped based 
let Blockchain = require('../blockchain');
const { CHAR_MAX_LENGTH, TRANSACTION_TYPE } = require('../config');
const { verifySignature } = require('../util');
const Wallet = require('../wallet');

class Ballot {
    constructor({ createrWallet, pollId, voteOption, chain }) {

        //ballot Id
        this.id = uuid();
        this.transactionType = TRANSACTION_TYPE.BALLOT;


        this.output = this.createOutput({ createrWallet, pollId, voteOption, chain });

        this.input = this.createInput({
            createrWallet,
            id: this.id,
            output: this.output
        });
    }

    createOutput({ createrWallet, pollId, voteOption, chain }) {

        let poll;



        //check if chain is passed to create ballot for spesific chain that contains the valid poll else
        if (chain === undefined) {
            throw new Error('Invalid chain: chain not entered');

        }       //check if valid chain
        else if (!Blockchain.isValidChain(chain)) {
            throw new Error('Invalid chain: invaild chain entered');

        }
        else {
            //check if poll id is entered
            if (pollId === undefined) {
                throw new Error(' Invalid poll Id');
            }

            // we make sure the pallot is right
            poll = Wallet.getPoll({ chain, pollId })

            if (poll === undefined) {
                throw new Error('Invalid poll id: poll not found');
            }

            if (voteOption === undefined) {
                throw new Error('Invalid voteOption');

            } 
            
            // we check if the option is valid with in the poll
            if ((Object.values(poll.output.options).find(i => i === voteOption) === undefined)) {
                throw new Error('Invalid vote option: vote option not found in pull');
            }

            // we check if the voter is valid with in the poll
            if ((Object.values(poll.output.voters).find(i => i === createrWallet.publicKey) === undefined)) {
                throw new Error('Invalid wallet: wallet not eligible for poll');
            }

            //
            if (Wallet.getBallot({ chain, pollId, voter: createrWallet.publicKey}) !== undefined) {
                throw new Error('Invalid wallet: wallet already voted for this poll');
            }
        }


        const output = {
            pollId,
            voteOption
        };

        return output;
    };

    createInput({ createrWallet, output }) {

        return {
            timeStamp: Date.now(),
            address: createrWallet.publicKey,
            signature: createrWallet.sign(output)
        }
    };

    static validBallot({ballot,chain}) {

        if ( ballot.transactionType !== TRANSACTION_TYPE.BALLOT) {
            return false;
        }
        const { input: { address, signature }, output } = ballot;

        let poll;

         //check if chain is passed to create ballot for spesific chain that contains the valid poll else
         if (chain === undefined) {
            console.error(`Invalid Ballot [${ballot.id}]: chain not defined`);
            return false;

        }       //check if valid chain
        else if (!Blockchain.isValidChain(chain)) {
            console.error(`Invalid Ballot [${ballot.id}]: chain not found`);
            return false;
        }
        else {
            //check if poll id is entered
            if (output.pollId === undefined) {
                console.error(`Invalid Ballot [${ballot.id}]: poll not defined`);
                return false;
            }

            // we make sure the pallot is right
            poll = Wallet.getPoll({ chain,pollId: output.pollId })

            if (poll === undefined) {
                console.error(`Invalid Ballot [${ballot.id}]: poll not found`);
                return false;
            }

            if (output.voteOption === undefined) {
                console.error(`Invalid Ballot [${ballot.id}]: voteOption not defined`);
                return false;
            } 
            
            // we check if the option is valid with in the poll
            if ((Object.values(poll.output.options).find(i => i === output.voteOption) === undefined)) {
                console.error(`Invalid Ballot [${ballot.id}]: voteOption [${output.voteOption}] : is not found within poll :[${poll.output.name}]`);
                return false;
            }

            // we check if the voter is valid with in the poll
            if ((Object.values(poll.output.voters).find(i => i === ballot.input.address) === undefined)) {
                console.error(`Invalid Ballot [${ballot.id}]: voter [${address}] : is not found within poll:[${poll.output.name}] voters`);
                return false;
            }

            //
            if (Wallet.getBallot({ chain, pollId: output.pollId, voter: ballot.input.address}) !== undefined) {
                console.error(`Invalid Ballot [${ballot.id}]: voter [${address}] : has already voted for poll: [${poll.output.name}] `);
                return false;
            }
        }



        //if signature is invalid we will return false
        if (!verifySignature({
            publicKey: address,
            data: output,
            signature
        })) {
            console.error(`Invalid Ballot [${ballot.id}]: invalid signature`);
            return false;
        }

        return true;
    }

}

module.exports = Ballot;