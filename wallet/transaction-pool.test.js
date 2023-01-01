const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction')
const Wallet = require('./index');
const Blockchain = require('../blockchain')

describe('TransactionPool', () => {
    let transactionPool, transaction, poll, senderWallet;

    beforeEach(() => {
        transactionPool = new TransactionPool();
        senderWallet = new Wallet();
        poll = senderWallet.createPoll({
            name: 'foo-poll',
            options: ['option 1', 'option 2', 'option 3'],
            voters: ['Sara', 'Ziyad']
        });

        transaction = new Transaction({
            senderWallet,
            recipient: 'fake-recipient',
            amount: 50
        });

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
    })

    describe('existingTransaction()', () => {


        it('returns an existing transaction given an input address', () => {

            transactionPool.setTransaction(transaction);
            expect(
                transactionPool.existingTransaction({ inputAddress: senderWallet.publicKey })
            ).toBe(transaction);
        });


        it('returns an existing poll given an input address', () => {

            transactionPool.setTransaction(poll);
            expect(
                transactionPool.existingTransaction({ inputAddress: senderWallet.publicKey })
            ).toBe(poll);
        });


    });


    describe('validTransactions()', () => {
        let validTransactions, errorMock;

        beforeEach(() => {
            validTransactions = [];
            errorMock = jest.fn();
            global.console.error = errorMock;

            // we make 20  tansactions  [10 polls 10 normal transactions] some are invalid due to wrong input amount and some have invalid signature
            // some are vaild we will save in our array then we will comapare the vaild ones with the output of this method to see if it works correctly 
            for (let i = 0; i < 10; i++) {

                poll = senderWallet.createPoll({
                    name: 'foo-poll',
                    options: ['option 1', 'option 2', 'option 3'],
                    voters: ['Sara', 'Ziyad']
                });

                transaction = new Transaction({
                    senderWallet,
                    recipient: 'any-recipient',
                    amount: 30
                });

                if (i % 3 === 0) {
                    transaction.input.amount = 9999999;
                    poll.output.name = undefined;
                } else if (i % 3 === 1) {
                    transaction.input.signature = new Wallet().sign('foo');
                    poll.input.signature = new Wallet().sign('fake');
                } else {
                    //else  i = [2,5,8] we are saving the valid ones
                    validTransactions.push(poll);
                    validTransactions.push(transaction);
                }
                //add polls and transactions to the pool
                transactionPool.setTransaction(poll);
                transactionPool.setTransaction(transaction);

            }
        });

        it('returns vaild transactions', () => {
            expect(transactionPool.validTransactions()).toEqual(validTransactions);
        });

        it('logs errors for the invalid transactions', () => {
            transactionPool.validTransactions();
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

                const transaction = new Wallet().createTransaction({
                    recipient: "foo",
                    amount: 20
                });

                //we fill the pool with all the  polls and transactions 
                transactionPool.setTransaction(poll);
                transactionPool.setTransaction(transaction);

                if (i % 2 === 0) {

                    //some polls and transactions will be added to the blockchain
                    blockchain.addBlock({ data: [poll] })
                    blockchain.addBlock({ data: [transaction] })

                } else {

                    //we will record the other transactons that haven't been added to the blockchain yet and expect them to stay in the pool
                    expectedTransactionMap[poll.id] = poll;
                    expectedTransactionMap[transaction.id] = transaction;
                }
            }

            //we clear the pool of all the transactions that are already in the blockchain
            transactionPool.clearBlockchainTransactions({ chain: blockchain.chain });

            expect(transactionPool.transactionMap).toEqual(expectedTransactionMap)
        });
    });

});