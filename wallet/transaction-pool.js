const Wallet = require('.');
const { TRANSACTION_TYPE } = require('../config');
const Ballot = require('../voting/ballot');
const Poll = require('../voting/poll');
const Transaction = require('./transaction')

class TransactionPool {

    constructor() {

        this.transactionMap = {};//our map
    }


    setTransaction(transaction) {

        this.transactionMap[transaction.id] = transaction;
    }

    setMap(transactionMap) {
        this.transactionMap = transactionMap

    }

    existingTransaction({ inputAddress, transactionType, pollId,chain }) {

        const transactions = Object.values(this.transactionMap);

        //it checks every transaction value to check if that transaction input address matchs our address
        // let transaction = transactions.find(transaction => (transaction.input.address === inputAddress && transaction.transactionType === transactionType ));
        let transaction = transactions.find(transaction => (() => {

            if (transaction.transactionType !== TRANSACTION_TYPE.BALLOT) {

                if (transaction.input.address === inputAddress
                    && transaction.transactionType === transactionType)
                    return true;
            }
            // if it is a ballot we check if the ballot is already in the transaction pool or chain
            else if (transaction.input.address === inputAddress
                      && transaction.transactionType === transactionType
                      && transaction.output.pollId === pollId
                      && pollId !== undefined)
                    return true;
    

            return false;

        }));

        if (transaction === undefined){
            if (transactionType === TRANSACTION_TYPE.BALLOT){
                return  Wallet.getBallot({ chain, pollId, voter : inputAddress}) ;
            }
        }

        return transaction;
    }

    validTransactions({chain}) {

        let transactions = Object.values(this.transactionMap).filter(
            transaction => (Transaction.validTransaction(transaction) || Poll.validPoll(transaction) || Ballot.validBallot({ballot:transaction,  chain}) )
        );


        for (let ballot of transactions){
            let count = 0 ;
            if (ballot.transactionType === TRANSACTION_TYPE.BALLOT){

                for (let i = 0; i < transactions.length ; i++){
                    if ((transactions[i].transactionType === TRANSACTION_TYPE.BALLOT ) && transactions[i].output.pollId === ballot.output.pollId && transactions[i].input.address === ballot.input.address) {

                            count++;
                            if (count >1){
                                    transactions.splice(i,1)
                            }
                        }
                        
                }

            }
        }

        return transactions;
    }

    clear() {
        this.transactionMap = {};
    }

    clearBlockchainTransactions({ chain }) {

        for (let i = 1; i < chain.length; i++) {

            // we will go through everyblock of this data
            const block = chain[i];

            // check every transaction in the block and compare them with the transaction map in this block if they are found in the blockchain we will delete them in this instence
            for (let transaction of block.data) {

                if (this.transactionMap[transaction.id]) {
                    delete this.transactionMap[transaction.id];
                }
            }
        }
    }


}

module.exports = TransactionPool;