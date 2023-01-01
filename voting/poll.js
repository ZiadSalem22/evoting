const uuid = require('uuid/'); // uuid v1 is time stamped based 
const { CHAR_MAX_LENGTH } = require('../config');
const { verifySignature } = require('../util');

class Poll {
    constructor({ createrWallet, name, options, voters }) {

        //poll Id
        this.id = uuid();

        this.output = this.createOutput({ name, options, voters });

        this.input = this.createInput({
            createrWallet,
            id: this.id,
            output: this.output
        });
    }

    createOutput({ name, options, voters }) {

        //check if the name is more than max length 
        if (name.length > CHAR_MAX_LENGTH) {
            throw new Error('Poll name too long');
        }

        if (name === null || name.trim() === '') {
            throw new Error('invaild name');
        }

        if (options === null ) {
            throw new Error('invaild optoins');
        }

        if (voters === null ) {
            throw new Error('invaild voters');
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
        const { input: { address, signature }, output } = poll;

        if (output.name.length > CHAR_MAX_LENGTH) {
             console.error('Poll name too long');
             return false;
        }

        //if signature is invalid we will return false
        if (!verifySignature({
            publicKey: address,
            data: output,
            signature
        })) 
        {
            console.error(`Invalid Signature from this address and data`);
            return false;
        }

        return true;
    }

}

module.exports = Poll;