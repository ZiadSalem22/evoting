const uuid = require('uuid/'); // uuid v1 is time stamped based 
const { CHAR_MAX_LENGTH, TRANSACTION_TYPE } = require('../config');
const { verifySignature } = require('../util');

class Ballot {
    constructor({ createrWallet, pollID, voteOption }) {

        //ballot Id
        this.id = uuid();
        this.transactionType = TRANSACTION_TYPE.Ballot;

        this.pollID =pollID;

        this.voteOption = voteOption;
    }
}

module.exports = Ballot;