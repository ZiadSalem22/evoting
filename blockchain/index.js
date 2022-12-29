const Block = require("./block");
const { cryptoHash } = require("../util");
const Transaction = require("../wallet/transaction");
const { REWARD_INPUT, MINING_REWARD } = require("../config");
const Wallet = require("../wallet");

class Blockchain {

    //create chain array with genesis block at the start
    constructor() {
        this.chain = [Block.genesis()];
    }

    //add block method
    addBlock({ data }) {

        //create the new block
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length - 1],
            data
        });

        //push the new block in the end of the chain
        this.chain.push(newBlock);

    }

    validTransactionData({ chain }) {

        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            const transacitonSet = new Set();
            let rewardTransactionCount = 0;

            for (let transaction of block.data) {

                //in case of there is more than one miner reward per block we return false
                if (transaction.input.address === REWARD_INPUT.address) {
                    rewardTransactionCount += 1;

                    if (rewardTransactionCount > 1) {
                        console.error('Miner rewards exceeds limit');
                        return false;
                    }

                    if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                        console.error('Miner reward amount is invalid');
                        return false;
                    }
                } else {
                    if (!Transaction.validTransaction(transaction)) {
                        console.error('Invalid Transaction');
                        return false;
                    }

                    const trueBalance = Wallet.calculateBalance({chain: this.chain, address: transaction.input.address});

                    if (transaction.input.amount !== trueBalance){
                        console.error('Invalid input amount');
                        return false;
                    }

                    if (transacitonSet.has(transaction)) {
                        console.error('duplicate transaction');
                        return false;
                    } else {
                        transacitonSet.add(transaction);
                    }
                }
            }
        }

        return true;
    }

    //check if chain is valid method as a static method (so we call it from class not object)
    static isValidChain(chain) {

        //check if genesis block is invalid
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
            return false;

        //check if all  hashs and last hashes  are valid and if 
        for (let i = 1; i < chain.length; i++) {

            //take block i 
            const block = chain[i];

            //destruct block i
            const { timeStamp, lastHash, hash, data, nonce, difficulty } = block;

            //take real hash of block before i
            const actualLastHash = chain[i - 1].hash;

            //get last difficulty
            const lastDifficulty = chain[i - 1].difficulty

            //check if last hash is valid
            if (lastHash !== actualLastHash) return false;

            //check if difficulty changed more by one factor
            if (Math.abs(lastDifficulty - difficulty) > 1) return false;

            //create  validted hash for block
            const validedHash = cryptoHash(timeStamp, lastHash, data, nonce, difficulty);

            //check if hash is valid with 
            if (hash !== validedHash) return false;
        }

        return true;
    }

    replaceChain(newChain,validateTransactions, onSuccess) {

        //check newChain length if short or equal do nothing
        if (newChain.length <= this.chain.length) {
            console.error('incoming chain must be longer');
            return;
        }

        if (Blockchain.isValidChain(newChain) == false) {
            console.error('the incoming chain must be a valid chain');
            return;
        }

        if(validateTransactions && !this.validTransactionData({newChain})){
            console.error('the incoming chain has some Invalid data');
            return;
        }

        if (onSuccess) onSuccess();
        console.log('replacing chain with', newChain);
        this.chain = newChain;
    }


}

module.exports = Blockchain;