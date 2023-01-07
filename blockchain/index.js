const Block = require("./block");
const { cryptoHash, verifySignature } = require("../util");
const Transaction = require("../wallet/transaction");
const { REWARD_INPUT, MINING_REWARD, TRANSACTION_TYPE } = require("../config");
const Wallet = require("../wallet");
const Poll = require("../voting/poll");

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

    static getVotingData({ chain }) {

        let votingdata = {
            polls: [],
            ballots: []
        }

        if (chain === undefined) {
            console.error(`chain not defined`);
            return undefined;
        }
        if (!Blockchain.isValidChain(chain)) {
            console.error(` chain not defined`);
            return undefined;
        }

        //loop for each block in blockchain
        for (let i = 0; i < chain.length; i++) {
            const block = chain[i];

            //loop for each transaction in blochain
            for (let transaciton of block.data) {

                if (transaciton.transactionType === TRANSACTION_TYPE.BALLOT) {
                    //we check transaction 
                    votingdata.ballots.push(transaciton)
                }
                if (transaciton.transactionType === TRANSACTION_TYPE.POLL) {
                    //we check transaction 
                    votingdata.polls.push(transaciton)
                }
            }
        }

        if (votingdata.polls.length === 0 && votingdata.ballots.length === 0) {
            return undefined
        }

        return votingdata;
    }

    validTransactionData({ chain }) {

        let votingData = Blockchain.getVotingData({ chain });

        const BallotSet = new Set();
        for (let i = 1; i < chain.length; i++) {
            const transacitonSet = new Set();
            const block = chain[i];
            let rewardTransactionCount = 0;

            for (let transaction of block.data) {

                switch (transaction.transactionType) {

                    case TRANSACTION_TYPE.POLL:
                        //check if valid poll
                        if (!Poll.validPoll(transaction)) {
                            console.error('Invalid Poll');
                            return false;
                        }

                        //check if poll is duplicated 
                        if (transacitonSet.has(transaction)) {
                            console.error('duplicate Poll');
                            return false;
                        } else {
                            transacitonSet.add(transaction);
                        }
                        break;

                    case TRANSACTION_TYPE.BALLOT:
                        //check if valid ballot

                        let poll, previousBallot;

                        poll = votingData.polls.find(x => x.id === transaction.output.pollId);

                        previousBallot = Array.from(BallotSet).find(x => (x.output.pollId === transaction.output.pollId && x.input.address === transaction.input.address));

                        if (poll === undefined) {
                            console.error(`Invalid Ballot [${transaction.id}]: poll not found`);
                            return false;
                        }

                        if (transaction.output.voteOption === undefined) {
                            console.error(`Invalid Ballot [${transaction.id}]: voteOption not defined`);
                            return false;
                        }

                        // we check if the option is valid with in the poll
                        if ((Object.values(poll.output.options).find(i => i === transaction.output.voteOption) === undefined)) {
                            console.error(`Invalid Ballot [${transaction.id}]: voteOption [${transaction.output.voteOption}] : is not found within poll :[${poll.output.name}]`);
                            return false;
                        }

                        // we check if the voter is valid with in the poll
                        if ((Object.values(poll.output.voters).find(i => i === transaction.input.address) === undefined)) {
                            console.error(`Invalid Ballot [${transaction.id}]: voter [${transaction.input.address}] : is not found within poll:[${poll.output.name}] voters`);
                            return false;
                        }

                        //
                        if (previousBallot !== undefined) {
                            console.error(`Invalid Ballot [${transaction.id}]: voter [${transaction.input.address}] : has already voted for poll: [${poll.output.name}] `);
                            return false;
                        }


                        //if signature is invalid we will return false
                        if (!verifySignature({
                            publicKey: transaction.input.address,
                            data: transaction.output,
                            signature: transaction.input.signature
                        })) {
                            console.error(`Invalid Ballot [${transaction.id}]: invalid signature`);
                            return false;
                        }


                        //check if ballot is duplicated 
                        if (transacitonSet.has(transaction)) {
                            console.error('duplicate Ballot');
                            return false;
                        } else {
                            transacitonSet.add(transaction);
                            BallotSet.add(transaction);
                        }
                        break;

                    case TRANSACTION_TYPE.CURRENCY:

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

                            let trueBalance = Wallet.calculateBalance({
                                chain: this.chain.slice(0, i),
                                address: transaction.input.address
                            });

                            if (transaction.input.amount !== trueBalance) {
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
                        break;
                    default: continue;
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

    replaceChain(newChain, validateTransactions, onSuccess) {

        //check newChain length if short or equal do nothing
        if (newChain.length <= this.chain.length) {
            console.error('incoming chain must be longer');
            return;
        }

        if (Blockchain.isValidChain(newChain) == false) {
            console.error('the incoming chain must be a valid chain');
            return;
        }

        if (validateTransactions && !this.validTransactionData({ chain: newChain })) {
            console.error('the incoming chain has some Invalid data');
            return;
        }

        if (onSuccess) onSuccess();
        console.log('replacing chain with', newChain);
        this.chain = newChain;
    }


}

module.exports = Blockchain;