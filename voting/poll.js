const uuid = require('uuid/'); // uuid v1 is time stamped based 
const { CHAR_MAX_LENGTH, TRANSACTION_TYPE } = require('../config');
const { verifySignature } = require('../util');

class Poll {
    constructor({ createrWallet, name, options, voters }) {

        //poll Id
        this.id = uuid();
        this.transactionType = TRANSACTION_TYPE.POLL;

        this.output = this.createOutput({ name, options, voters });

        this.input = this.createInput({
            createrWallet,
            id: this.id,
            output: this.output
        });
    }

    static vaildVoters(voters) {

        let vaildVoters = new Set();

        if (Array.isArray(voters) === false) {
            throw new Error('Invalid Voters: please enter an array of public keys');
        }

        for (let voter of voters) {

            //check if element is string 
            if (typeof voter !== 'string') {
                throw new Error('Invalid Voters: please enter an array of public keys');
            }

            //check if element is string 
            if (voter.replace(/ /g, "").length !== "041edb189e622ad16be5342e58b62ad4b792238db92470518234733a4bc8e043517896747117fa3cde0173b87edd671e41c220fad9c00640111d5f2ea67d8a7512".length ) {
                throw new Error(`Invalid Voters: voter index of (${voters.indexOf(voter)}) has value of [${voter}] which is not a public key`);
            }

            //add it to a set to prevent duplicates 
            vaildVoters.add(voter.replace(/ /g, ""));
        }

        return [...vaildVoters];
    }
    createOutput({ name, options, voters }) {



        if (name === undefined) {
            throw new Error('Invalid name : name not entered ');
        } else {
            name.trim();
            if (name === '') {
                throw new Error('Invalid name: name empty');
            }
        }
        //check if the name is more than max length 
        if (name.length > CHAR_MAX_LENGTH) {
            throw new Error('Invalid name: name too long');
        }

        if (options === undefined) {
            throw new Error('Invalid options: options not entered');
        }

        if (voters === undefined) {
            throw new Error('Invalid voters: voters not entered');
        }


        const output = {
            name,
            options,
            voters : Poll.vaildVoters(voters)
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

    static validPoll(poll) {

        if (poll.transactionType !== TRANSACTION_TYPE.POLL) {
            return false;
        }
        const { input: { address, signature }, output } = poll;


        if (output?.name?.length > CHAR_MAX_LENGTH) {
            console.error(`Invalid Poll name: ${output.name} from ${address}`);
            return false;
        }


        //if signature is invalid we will return false
        if (!verifySignature({
            publicKey: address,
            data: output,
            signature
        })) {
            console.error(`Invalid Signature from this address and data`);
            return false;
        }

        return true;
    }

}

module.exports = Poll;