const uuid = require('uuid/'); // uuid v1 is time stamped based 
const { CHAR_MAX_LENGTH, TRANSACTION_TYPE, ISOregex } = require('../config');
const { verifySignature } = require('../util');

class Poll {
    constructor({ createrWallet, name, options, voters, startDate, endDate }) {

        //poll Id
        this.id = uuid();
        this.transactionType = TRANSACTION_TYPE.POLL;

        this.output = this.createOutput({ name, options, voters, startDate, endDate });

        this.input = this.createInput({
            createrWallet,
            id: this.id,
            output: this.output
        });
    }

    //method to validate the entered options 
    static vaildOptions(options) {

        let vaildOptions = new Set();

        if (Array.isArray(options) === false) {
            throw new Error('Invalid Options: please enter an array of vaild strings');
        }

        for (let option of options) {

            //check if element is string 
            if (typeof option !== 'string') {
                throw new Error('Invalid Options: please enter an array of vaild strings');
            }

            //check if element does not exceed the limit number of char 
            if (option.trim().length > CHAR_MAX_LENGTH) {
                throw new Error(`Invalid Options: option index of (${options.indexOf(option)}) has value of [${option}] that exeeds Max limit`);
            }

            //check if element does not an empty string
            if (option.trim().length === ''.length) {
                throw new Error(`Invalid Options: option index of (${options.indexOf(option)}) has value of empty string`);
            }

            //add it to a set to prevent duplicates 
            vaildOptions.add(option.trim());
        }

        return [...vaildOptions];
    }

    //method to validate the entered voters 
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
            if (voter.replace(/ /g, "").length !== "041edb189e622ad16be5342e58b62ad4b792238db92470518234733a4bc8e043517896747117fa3cde0173b87edd671e41c220fad9c00640111d5f2ea67d8a7512".length) {
                throw new Error(`Invalid Voters: voter index of (${voters.indexOf(voter)}) has value of [${voter}] which is not a public key`);
            }

            //add it to a set to prevent duplicates 
            vaildVoters.add(voter.replace(/ /g, ""));
        }

        return [...vaildVoters];
    }


    createOutput({ name, options, voters, startDate, endDate }) {



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

        if (startDate === undefined) {
            startDate = new Date (Date.now());

        } else if (ISOregex.test(startDate) === false) {
            throw new Error(`Invalid dates: invalid start date please enter data in this format "2006-06-06T22:50:30"`);

        } else if(new Date(startDate) <= new Date(Date.now())){

            throw new Error(`Invalid  dates: start date [${new Date(startDate)}] is in past`);
        }
        else{startDate = new Date(startDate);}

        if (endDate !== undefined) {
            if (ISOregex.test(endDate) === false) {
                throw new Error(`Invalid dates: invalid end date please enter data in this format "2006-06-06T22:50:30"`);
            }
            
            endDate = new Date(endDate);
            if( new Date (startDate.getTime() + 5*60000)  >= endDate){
             throw new Error( `Invalid dates: invalid end date [${endDate}]: is before start date [${startDate}], end date has to be at lease 5 minutes after start date`);
            }

        }



        const output = {
            name,
            options: Poll.vaildOptions(options),
            voters: Poll.vaildVoters(voters),
            startDate,
            endDate
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

        if (output.endDate !== undefined){

            if (new Date (new Date(output.startDate).getTime() + 5*60000)  >= new Date(output.endDate)){
                console.error(`Invalid Poll Dates: from ${address}`);
                return false;
            }
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