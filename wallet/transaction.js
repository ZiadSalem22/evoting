const uuid = require('uuid'); // uuid v1 is time stamped based 
const { REWARD_INPUT, MINING_REWARD } = require('../config');
const { verifySignature } = require('../util');
const Poll = require('../voting/poll');

class Transaction {
    constructor({ senderWallet, recipient, amount, outputMap, input }) {

        this.id = uuid();

        this.outputMap = outputMap || this.createOutputMap({ senderWallet, recipient, amount });

        this.input = input || this.createInput({
            senderWallet,
            outputMap: this.outputMap
        });

    }

    createOutputMap({ senderWallet, recipient, amount }) {
        const outputMap = {};

        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

        return outputMap;
    };


    createInput({ senderWallet, outputMap }) {

        return {
            timeStamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(outputMap)
        }
    };

    update({ senderWallet, recipient, amount }) {

        //check if the sender wallet has enough amount
        if (amount > this.outputMap[senderWallet.publicKey]) {
            throw new Error('Amount exceeds balance');
        }

        //check if the recipient is new to the outputMap
        if (!this.outputMap[recipient]) {

            //maping out the new recipient amount
            this.outputMap[recipient] = amount;
        } else {
            //otherwise the recipient already exists in this outputMap
            this.outputMap[recipient] = this.outputMap[recipient] + amount;
        }






        //maping the subtraction of the sender wallet balance
        this.outputMap[senderWallet.publicKey] =
            this.outputMap[senderWallet.publicKey] - amount;

        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });

    }

    static validTransaction(transaction) {

        if ( !(transaction instanceof  Transaction)){
            return false;
        }

        const { input: { address, amount, signature }, outputMap } = transaction;
        
        //check if the input amount eguals all the values contianed in outputMap // in short checks if the wallet input to the transactions equals the wallet output of the transactions 
        const outputTotal = Object.values(outputMap)
            .reduce((total, outputAmount) => total + outputAmount);

        if (amount !== outputTotal) {
            console.error(`Invalid transaction from ${address}`);
            return false;
        }


        //if signature is invalid we will return false
        if (!verifySignature({
            publicKey: address,
            data: outputMap,
            signature
        }
        )) {
            console.error(`Invalid Signature from this address`);
            return false;
        }
        return true;
    }


    static rewardTransaction({ minerWallet }) {

        return new this({
            input: REWARD_INPUT,
            outputMap: { [minerWallet.publicKey]: MINING_REWARD }
        });
    }
}

module.exports = Transaction;