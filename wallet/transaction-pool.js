const Transaction  = require('./transaction')

class TransactionPool{

    constructor(){

        this.transactionMap = {};//our map
    }


    setTransaction(transaction){

        this.transactionMap[transaction.id] = transaction;
    }

    setMap(transactionMap){
        this.transactionMap = transactionMap 

    }

    existingTransaction({inputAddress}){

        const transactions = Object.values(this.transactionMap);

        //it checks every transaction value to check if that transaction input address matchs our address
        return transactions.find(transaction => transaction.input.address === inputAddress);
    }

    validTransactions(){

       return Object.values(this.transactionMap).filter(
             transaction => Transaction.validTransaction(transaction)
             );
    }

    clear(){
        this.transactionMap = {};
    }

    clearBlockchainTransactions({chain}){

        for (let i = 1; i < chain.length; i++){

            // we will go through everyblock of this data
            const block = chain[i];

            // check every transaction in the block and compare them with the transaction map in this block if they are found in the blockchain we will delete them in this instence
            for (let transaction of block.data){

                if (this.transactionMap[transaction.id]){
                    delete this.transactionMap[transaction.id];
                }
            }
        }
    }


}

module.exports= TransactionPool;