const Blockchain = require('.');
const Block = require('./block');
const { GENESIS_DATA, TRANSACTION_TYPE } = require('../config');
const { cryptoHash } = require('../util');
const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');
const Ballot = require('../voting/ballot');

describe('Blockchain', () => {

    let blockchain, newChain, orginalChain, errorMock;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        errorMock = jest.fn();

        orginalChain = blockchain.chain;
        global.console.error = errorMock;
    });

    //check if the chain in an array
    it('contains a `chain` Array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    //check if first block is genesis block
    it('starts with genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    //check if adds new block to the end of the chain
    it('adds a new block to the end of the chain', () => {

        const newData = 'foo bar';

        blockchain.addBlock({ data: newData });

        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
    });

    // tests to check chain valiedtiy 
    describe('isValidChain()', () => {

        //tests to check if chain does not start with genesis blocl
        describe('when the chain does not start with the genesis block', () => {
            it('returns false', () => {
                blockchain.chain[0] = { data: 'fake-genesis' }

                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        //tests to check  if it starts with genesis block and has more than one block
        describe('when the chain starts with the genesis block and has multiple blocks', () => {

            // add blocks to the block chain
            beforeEach(() => {
                blockchain.addBlock({ data: 'first votes block' })
                blockchain.addBlock({ data: 'second votes block' })
                blockchain.addBlock({ data: 'thrid votes block' })
            });

            //tests if last hash has been changed 
            describe('and a lastHash refrence has changed', () => {
                it('returns fales', () => {

                    blockchain.chain[2].lastHash = 'fake last hash';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);

                });
            });

            //tests if chain contains a block with an invalid field
            describe('and the chain contains a block with an invalid field', () => {
                it('returns false', () => {

                    blockchain.chain[2].data = 'fake secon votes block';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });


            describe('and the chain contaions a block with a jumped difficulty', () => {
                it('returns false', () => {

                    const lastBlock = blockchain.chain[blockchain.chain.length - 1];
                    const lastHash = lastBlock.hash;
                    const timeStamp = Date.now();
                    const nonce = 0;
                    const data = [];
                    const difficulty = lastBlock.difficulty - 3;
                    const hash = cryptoHash(timeStamp, lastHash, nonce, data, difficulty);

                    const badBlock = new Block({ timeStamp, lastHash, nonce, data, difficulty, hash });

                    blockchain.chain.push(badBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
            //tests to know that all blocks in the chain are valid 
            describe('and the chain does not cotain any invalid blocks', () => {
                it('returns true', () => {


                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
        });
    });

    describe('replaceChain()', () => {
        //mocks to cointain console log and console error
        //tests if the new chain is not longer
        let logMock;

        beforeEach(() => {
            logMock = jest.fn();

            global.console.log = logMock;
        });

        describe('when the new chain is not longer', () => {

            beforeEach(() => {
                //since newChain and BlockChain are the same they might be at the same length so we modify New chain to be distinct 
                newChain[0] = { new: 'new field' }

                //we try to replace it even though they are the same length at this point
                blockchain.replaceChain(newChain.chain);
            });

            it('does not replace the chain', () => {


                expect(blockchain.chain).toEqual(orginalChain)

            });


            it('logs an error', () => {
                expect(errorMock).toHaveBeenCalled();
            });
        });

        //tests when the new chain is longer 
        describe('when the new chain is longer', () => {

            // add blocks to the newChain
            beforeEach(() => {
                newChain.addBlock({ data: 'first votes block' })
                newChain.addBlock({ data: 'second votes block' })
                newChain.addBlock({ data: 'thrid votes block' })
            });

            //if the new long chain is invalid 
            describe('and the chain invalid', () => {

                beforeEach(() => {
                    //change hash of one of the blocks
                    newChain.chain[2].hash = 'fake hash'

                    blockchain.replaceChain(newChain.chain);
                });

                it('does not replace the chain', () => {
                    blockchain.replaceChain(newChain.chain);

                    expect(blockchain.chain).toEqual(orginalChain);
                });


                it('logs an error', () => {
                    expect(errorMock).toHaveBeenCalled();
                });

            });

            //if the new long chain is valid 
            describe('and the chain is valid', () => {

                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                });

                it('replaces the chain', () => {
                    expect(blockchain.chain).toEqual(newChain.chain)

                });


                it('logs about the chain replacement', () => {
                    expect(logMock).toHaveBeenCalled();
                });
            });

            describe('and the validateTransaction flag is true', () => {
                it('calls validTrancationData()', () => {
                    const validateTransactionMock = jest.fn();
                    blockchain.validTransactionData = validateTransactionMock;


                    newChain.addBlock({ data: 'foo' });
                    blockchain.replaceChain(newChain.chain, true);

                    expect(validateTransactionMock).toHaveBeenCalled();

                });
            });

        });
    });

    describe('getVotingData()', () => {

        let validTransactions, errorMock, tempBlockchain, tempWallet;

        let walltes = []; //wallets to add to your poll to use for ballots test
        let voters = []; //public key for wallets 
        let polls = []; //our polls


        let votingData = {
            polls: [],
            ballots: []
        }

        beforeEach(() => {
            tempBlockchain = new Blockchain();
            tempWallet = new Wallet();


            for (let i = 0; i < 10; i++) {
                walltes[i] = new Wallet();
                voters[i] = walltes[i].publicKey;
            }

            for (let i = 0; i < 10; i++) {

                polls[i] = tempWallet.createPoll({
                    name: `poll number${i + 1}`,
                    options: ['option 1', 'option 2', 'option 3'],
                    voters: voters
                });

                tempBlockchain.addBlock({ data: [polls[i]] });
                votingData.polls.push(polls[i]);

                for (let j = 0; j < 10; j++) {

                    //valid Ballot that uses temp-poll and temp-blockchain
                    let ballot = new Ballot({
                        createrWallet: walltes[j],
                        pollId: polls[i].id,
                        voteOption: 'option 1',
                        chain: tempBlockchain.chain
                    });
                    votingData.ballots.push(ballot);
                }
            }
            tempBlockchain.addBlock({ data: votingData.ballots});
            



            validTransactions = [];
            errorMock = jest.fn();
            global.console.error = errorMock;

        });

        describe('blockChain has voting data', () => {
            it('returns voting data', () => {
                expect(Blockchain.getVotingData({chain: tempBlockchain.chain})).toEqual(votingData);
            });
        });

        describe('blockChain has voting data', () => {

            it('reutns undeifiend', async () => {
                
                expect(Blockchain.getVotingData({chain: new Blockchain().chain})).toEqual(undefined);
            });
        });

    });

    //tests for valid Transaction data
    describe('validTransactionData()', () => {
        let poll, ballot, transaction, rewardTransaction, wallet;

        beforeEach(() => {
            wallet = new Wallet();

            poll = wallet.createPoll({
                name: 'foo-poll',
                options: ['option 1', 'option 2', 'option 3'],
                voters: [wallet.publicKey, 'Ziyad']
            });

            transaction = wallet.createTransaction({
                recipient: 'foo',
                amount: 20
            });

            
            
            rewardTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
            newChain.addBlock({ data: [ poll, rewardTransaction] });

            ballot = new Ballot({
                createrWallet : wallet,
                pollId: poll.id,
                voteOption: 'option 1',
                chain: newChain.chain
            })

        });

        describe('and the transaction data is valid', () => {

            it('returns true', () => {
                newChain.addBlock({ data: [transaction, ballot,rewardTransaction] })
                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(true);
                expect(errorMock).not.toHaveBeenCalled();

            });
        });

        describe('and the transaction data has multiple rewards', () => {
            it('returns false and logs an error', () => {

                newChain.addBlock({ data: [transaction, rewardTransaction, rewardTransaction] });

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('and the  transaction data for Ballots ', () => {

            describe(' has at least one malformed outputMap', () => {

                describe(' invail pollId', () => {
                    it('returns false and logs an error', () => {

                        ballot.output.pollId = 'fake poll id ';
                        newChain.addBlock({ data: [ballot, rewardTransaction] });

                        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                        expect(errorMock).toHaveBeenCalled();
                    });
                });

                describe(' invail voteOption', () => {
                    it('returns false and logs an error', () => {

                        ballot.output.voteOption = 'foo';
                        newChain.addBlock({ data: [ballot, rewardTransaction] });

                        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                        expect(errorMock).toHaveBeenCalled();
                    });
                });

            });

            describe('and the ballot data has at least one malformed input', () => {
                it('returns false and logs an error', () => {
                    ballot.input.signature = wallet.sign('foo');

                    newChain.addBlock({ data: [ballot, rewardTransaction] });

                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();

                });
            });

            describe('and a block has a ballot for invaild voter ', () => {
                it('returns false and logs an error', () => {

                    let evilVoter = new Wallet();

                    const evilOutput = {
                        pollId: poll.id,
                        voteOption: 'option 1'
                    };

                    const evilBallot = {
                        input: {
                            timeStamp: Date.now(),
                            address: evilVoter.publicKey,
                            signature: evilVoter.sign(evilOutput)
                        },
                        output: evilOutput,
                        transactionType: TRANSACTION_TYPE.BALLOT,
                        id: 'evild Ballot id'
                    };

                    newChain.addBlock({ data: [ evilBallot, rewardTransaction] })

                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and a block contains multiple identical ballots', () => {
                it('returns false and logs an error', () => {
                    newChain.addBlock({ data: [ballot, ballot, rewardTransaction] })

                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and a block contaions multiple ballots that have same voters and same polls ', () => {
                it('returns false and logs an error', () => {

                    const evilOutput = {
                        pollId: poll.id,
                        voteOption: 'option 1'
                    };

                    const evilBallot = {
                        input: {
                            timeStamp: Date.now(),
                            address: wallet.publicKey,
                            signature: wallet.sign(evilOutput)
                        },
                        output: evilOutput,
                        transactionType: TRANSACTION_TYPE.BALLOT,
                        id: 'evild Ballot id'
                    };

                    newChain.addBlock({ data: [ballot, evilBallot, rewardTransaction] })

                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });

        describe('and the transaction data for polls', () => {
            beforeEach(() => {
               poll = wallet.createPoll({
                    name: 'foo-poll #2',
                    options: ['option 1', 'option 2', 'option 3'],
                    voters: ['Sara', 'Ziyad']
                });
            });
            describe('has at least one malformed output', () => {
                it('returns false and logs an error', () => {

                    poll.output.voters = undefined;
                    newChain.addBlock({ data: [poll, rewardTransaction] });
                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('has at least one malformed input', () => {
                it('returns false and logs an error', () => {

                    poll.input.signature = new Wallet().sign("evil output");
                    newChain.addBlock({ data: [poll, rewardTransaction] });
                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

        });
        describe('and the transaction data for transactions', () => {
            describe(' has at least one malformed outputMap', () => {

                describe('and the transaction is not a reward transaction', () => {
                    it('returns false and logs an error', () => {

                        transaction.outputMap[wallet.publicKey] = 999999;
                        newChain.addBlock({ data: [transaction, rewardTransaction] });

                        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                        expect(errorMock).toHaveBeenCalled();
                    });
                });

                describe('and the transaction is a reward transaciton', () => {
                    it('returns false and logs an error', () => {
                        rewardTransaction.outputMap[wallet.publicKey] = 999999;

                        newChain.addBlock({ data: [transaction, rewardTransaction] });

                        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                        expect(errorMock).toHaveBeenCalled();
                    });
                });
            });

            describe('and the transaction data has at least one malformed input', () => {
                it('returns false and logs an error', () => {
                    wallet.balance = 9000;

                    const evilOutputMap = {
                        [wallet.publicKey]: 8900,
                        fooRecipient: 100
                    };

                    const evilTransaction = {
                        input: {
                            timeStamp: Date.now(),
                            amount: wallet.balance,
                            address: wallet.publicKey,
                            signature: wallet.sign(evilOutputMap)
                        },
                        outputMap: evilOutputMap,
                        transactionType: TRANSACTION_TYPE.CURRENCY
                    };

                    newChain.addBlock({ data: [evilTransaction, rewardTransaction] });

                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();

                });
            });

            describe('and a block contaions multiple identical transactions', () => {
                it('returns false and logs an error', () => {
                    newChain.addBlock({ data: [transaction, transaction, transaction, rewardTransaction] })

                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });



    });
});