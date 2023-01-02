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

    createOutput({ name, options, voters }) {



        if (name === undefined) {
            throw new Error('Invalid name');
        } else {
            name.trim();
            if (name === '') {
                throw new Error('Invalid name');
            }
        }
        //check if the name is more than max length 
        if (name.length > CHAR_MAX_LENGTH) {
            throw new Error('Poll name too long');
        }

        if (options === undefined) {
            throw new Error('Invalid options');
        }

        if (voters === undefined) {
            throw new Error('Invalid voters');
        }


        const output = {
            name,
            options,
            voters
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

        if ( poll.transactionType !== TRANSACTION_TYPE.POLL) {
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