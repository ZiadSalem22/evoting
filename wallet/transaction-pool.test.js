const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction')
const Wallet = require('./index');
const Blockchain = require('../blockchain');
const Ballot = require('../voting/ballot');
const { TRANSACTION_TYPE } = require('../config');

describe('TransactionPool', () => {
    let transactionPool, transaction, poll, ballot, senderWallet, blockchain;

    beforeEach(() => {
        blockchain = new Blockchain();
        transactionPool = new TransactionPool();
        senderWallet = new Wallet();
        poll = senderWallet.createPoll({
            name: 'foo-poll',
            options: ['option 1', 'option 2', 'option 3'],
            voters: [senderWallet.publicKey, 'Ziyad']
        });

        transaction = new Transaction({
            senderWallet,
            recipient: 'fake-recipient',
            amount: 50
        });
        blockchain.addBlock({ data: [transaction, poll] });

        ballot = new Ballot({
            createrWallet: senderWallet,
            pollId: poll.id,
            voteOption: 'option 1',
            chain: blockchain.chain
        })

    });

    describe('setTransaction()', () => {

        //we need to make sure it adds a transaction

        it('adds a transaction', () => {
            transactionPool.setTransaction(transaction);

            //we are using the toBe validation to make sure it is the exact same instances and not a copy of an object  even if the propties change  so it can be updated 
            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);

        });

        it('adds a poll', () => {
            //we use to be to make sure it;s the same instance 
            transactionPool.setTransaction(poll);
            expect(transactionPool.transactionMap[poll.id]).toBe(poll)
        });

        it('adds a ballot', () => {
            //we use to be to make sure it;s the same instance 
            transactionPool.setTransaction(ballot);
            expect(transactionPool.transactionMap[ballot.id]).toBe(ballot)
        });
    })

    describe('existingTransaction()', () => {

        describe('Pool already has transaction', () => {

            it('returns an existing transaction given an input address', () => {

                transactionPool.setTransaction(transaction);
                expect(
                    transactionPool.existingTransaction({
                        inputAddress: senderWallet.publicKey,
                        transactionType: transaction.transactionType
                    })
                ).toBe(transaction);
            });
        });

        describe('Pool already dose not have this transaction', () => {

            it('returns undefined', () => {

                expect(
                    transactionPool.existingTransaction({
                        inputAddress: senderWallet.publicKey,
                        transactionType: transaction.transactionType
                    })
                ).toBe(undefined);
            });

            describe('there is a poll before it ', () => {

                it('returns undefiend', () => {
                    
                    transactionPool.setTransaction(poll);
    
                    expect(
                        transactionPool.existingTransaction({
                            inputAddress: senderWallet.publicKey,
                            transactionType: transaction.transactionType
                        })
                    ).toBe(undefined);
                });
            });

            describe('there was a transaction then poll then we emptied it ', () => {

                it('returns undefiend', () => {
                    
                    transactionPool.setTransaction(poll);
    
                    expect(
                        transactionPool.existingTransaction({
                            inputAddress: senderWallet.publicKey,
                            transactionType: transaction.transactionType
                        })
                    ).toBe(undefined);
                });
            });
        });

        describe('Pool already has Poll', () => {

            it('returns an existing poll given an input address', () => {

                transactionPool.setTransaction(poll);
                expect(
                    transactionPool.existingTransaction({
                        inputAddress: senderWallet.publicKey,
                        transactionType: poll.transactionType
                    })
                ).toBe(poll);
            });
        });

        describe('Pool already has ballot', () => {

            it('returns an existing Ballot throgh out  pool given an input address', () => {

                transactionPool.setTransaction(ballot);
                expect(
                    transactionPool.existingTransaction({
                        inputAddress: senderWallet.publicKey,
                        transactionType: ballot.transactionType
                    })
                ).toBe(ballot);
            });
        });

        describe('Blockchain already has the same ballot', () => {

            it('returns an existing Ballot through out blockchain given an input address', () => {

                blockchain.addBlock({ data: [transaction, poll, ballot] });

                expect(
                    transactionPool.existingTransaction({
                        inputAddress: senderWallet.publicKey,
                        transactionType: ballot.transactionType,
                        pollId: poll.id,
                        chain: blockchain.chain
                    })
                ).toBe(ballot);
            });
        });


        describe('give it new poll', () => {

            it('returns undefined', () => {
                expect(
                    transactionPool.existingTransaction({
                        inputAddress: 'never used to make a poll',
                        transactionType: TRANSACTION_TYPE.POLL,
                        chain: blockchain.chain
                    })
                ).toEqual(undefined);
            });
        });

        describe('give it new ballot', () => {

            it('returns undefined', () => {
                expect(
                    transactionPool.existingTransaction({
                        inputAddress: senderWallet.publicKey,
                        transactionType: ballot.transactionType,
                        pollId: poll.id,
                        chain: blockchain.chain
                    })
                ).toEqual(undefined);
            });
        });


    });


    describe('validTransactions()', () => {
        let validTransactions, errorMock, tempBlockchain, tempPoll;

        let walltes = []; //wallets to add to your poll to use for ballots test
        let voters = []; //public key for wallets 

        beforeEach(() => {
            tempBlockchain = new Blockchain();

            for (let i = 0; i < 10; i++) {
                walltes[i] = new Wallet();
                voters[i] = walltes[i].publicKey;
            }


            tempWallet = new Wallet();
            tempPoll = tempWallet.createPoll({
                name: `poll for ballot test`,
                options: ['option 1', 'option 2', 'option 3'],
                voters: voters
            });
            tempBlockchain.addBlock({ data: [tempPoll] });

            validTransactions = [];
            errorMock = jest.fn();
            global.console.error = errorMock;

            // we make 30  tansactions  [10 ballots 10 polls 10 normal transactions] some are invalid due to wrong input amount and some have invalid signature
            // some are vaild we will save in our array then we will comapare the vaild ones with the output of this method to see if it works correctly 
            for (let i = 0; i < 10; i++) {

                senderWallet = new Wallet();

                poll = senderWallet.createPoll({
                    name: `foo-poll #${i + 1}`,
                    options: ['option 1', 'option 2', 'option 3'],
                    voters: [senderWallet.publicKey, 'Ziyad']
                });

                //valid Poll
                transaction = new Transaction({
                    senderWallet,
                    recipient: 'any-recipient',
                    amount: 30
                });

                //valid Ballot that uses temp-poll and temp-blockchain
                ballot = new Ballot({
                    createrWallet: walltes[i],
                    pollId: tempPoll.id,
                    voteOption: 'option 1',
                    chain: tempBlockchain.chain
                });

                if (i % 3 === 0) {
                    transaction.input.amount = 9999999;//we change input amout to an invalid amount to make it unvalid 
                    poll.output.name = undefined;//we change name of poll to make it unvalid 

                    //siwtch for illegal ballot cases 
                    switch (i) {

                        // Case 1 we have two ballots in the pool with the same voter and poll only one can be saved
                        case 0: {
                            const evilOutput = {
                                pollId: tempPoll.id,
                                voteOption: 'option 1'
                            };

                            const evilBallot = {
                                input: {
                                    timeStamp: Date.now(),
                                    address: walltes[i].publicKey,
                                    signature: walltes[i].sign(evilOutput)
                                },
                                output: evilOutput,
                                transactionType: TRANSACTION_TYPE.BALLOT,
                                id: 'evild Ballot id'
                            };

                            transactionPool.setTransaction(ballot); 
                            transactionPool.setTransaction(evilBallot); 
                            validTransactions.push(ballot); break;
                        }

                        // case 2  invalid poll id
                        case 3: ballot.output.pollId = 'fake'; break;

                        //case 3 invalid vote option
                        case 6: ballot.output.voteOption = 'fake'; break;

                        //case 4 voter already voted to the poll
                        case 9: tempBlockchain.addBlock({ data: [ballot] }); break;
                    }
                } else if (i % 3 === 1) {
                    //fake signatures 
                    transaction.input.signature = new Wallet().sign('foo');
                    poll.input.signature = new Wallet().sign('fake');
                    ballot.input.signature = new Wallet().sign('foo');
                } else {
                    //else  i = [2,5,8] we are saving the valid cases to compare them with the result
                    validTransactions.push(ballot);
                    validTransactions.push(poll);
                    validTransactions.push(transaction);
                }

                //add polls and transactions to the pool
                if (i !== 0) {transactionPool.setTransaction(ballot);}// since we alreadt set Transaction [just for making things simple ]
                transactionPool.setTransaction(poll);
                transactionPool.setTransaction(transaction);

            }
        });

        it('returns vaild transactions', () => {
            expect(transactionPool.validTransactions({ chain: tempBlockchain.chain })).toEqual(validTransactions);
        });

        it('logs errors for the invalid transactions', () => {
            transactionPool.validTransactions({ chain: blockchain.chain });
            expect(errorMock).toHaveBeenCalled();
        });



    });

    describe('clear()', () => {

        it('clears the transactions', () => {
            transactionPool.clear();

            //we expect it to be blank 
            expect(transactionPool.transactionMap).toEqual({});
        });
    });

    describe('clearBlockchainTransactions()', () => {

        it('clears the pool of any existing blockchain transactions', () => {

            const blockchain = new Blockchain();
            const expectedTransactionMap = {};

            for (let i = 0; i < 6; i++) {
                const poll = new Wallet().createPoll({
                    name: 'foo-poll',
                    options: ['option 1', 'option 2', 'option 3'],
                    voters: ['Sara', 'Ziyad']
                });

                const tempWallet = new Wallet();

                const tempPoll = new Wallet().createPoll({
                    name: 'temp-poll',
                    options: ['option 1', 'option 2', 'option 3'],
                    voters: [tempWallet.publicKey, 'Ziyad']
                });

                blockchain.addBlock({ data: [tempPoll] });

                const ballot = new Ballot({
                    createrWallet: tempWallet,
                    pollId: tempPoll.id,
                    voteOption: 'option 1',
                    chain: blockchain.chain
                });

                const transaction = new Wallet().createTransaction({
                    recipient: "foo",
                    amount: 20
                });


                //we fill the pool with all the  polls and transactions 
                transactionPool.setTransaction(poll);
                transactionPool.setTransaction(ballot);
                transactionPool.setTransaction(transaction);

                if (i % 2 === 0) {

                    //some polls and transactions will be added to the blockchain
                    blockchain.addBlock({ data: [poll] });
                    blockchain.addBlock({ data: [ballot] });
                    blockchain.addBlock({ data: [transaction] });

                } else {

                    //we will record the other transactons that haven't been added to the blockchain yet and expect them to stay in the pool
                    expectedTransactionMap[poll.id] = poll;
                    expectedTransactionMap[ballot.id] = ballot;
                    expectedTransactionMap[transaction.id] = transaction;
                }
            }

            //we clear the pool of all the transactions that are already in the blockchain
            transactionPool.clearBlockchainTransactions({ chain: blockchain.chain });

            expect(transactionPool.transactionMap).toEqual(expectedTransactionMap)
        });
    });

});