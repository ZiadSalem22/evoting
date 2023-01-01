const Wallet = require('./index');
const { verifySignature } = require('../util');
const Transaction = require('./transaction');
const Blockchain = require('../blockchain');
const { STARTING_BALANCE } = require('../config');

describe('Wallet', () => {

    let wallet;
    //new wallet for each test
    beforeEach(() => {
        wallet = new Wallet();
    });

    //check properties
    it('has a `balance`', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('has a `publicKey`', () => {

        expect(wallet).toHaveProperty('publicKey');
    });

    //tests for sigining data 
    describe('signing data', () => {
        const data = 'foobar';

        //verfies valid signature 
        it('verifies a signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: wallet.sign(data)

                })
            ).toBe(true);
        });

        it('does not verify an invalid signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: new Wallet().sign(data)
                })
            ).toBe(false);
        });
    });

    describe('createPoll()', () => {

        let name, options, voters;
        beforeEach(() => {
            name = 'foo-poll';
            options = ['option 1', 'option 2', 'option 3'];
            voters = ['Ziad', 'Sara'];
        });


        describe('when one of the parmenters is null/empty', () => {

            it('throws an error', () => {

                expect(
                    () => { wallet.createPoll({ name: '', options, voters }) }

                ).toThrow('Invalid name');

                expect(
                    () => { wallet.createPoll({ options, voters }) }

                ).toThrow('Invalid name');


                expect(
                    () => { wallet.createPoll({ name, voters }) }

                ).toThrow('Invalid options');

                expect(
                    () => { wallet.createPoll({ name, options }) }

                ).toThrow('Invalid voters');
            });
        });

        describe('Valid data passed', () => {

            beforeEach(() => {
                let poll;
                poll = Wallet.createPoll({ name, options, voters })
            });

            it('creates and instance of `Poll`', () => {
                expect(poll instanceof Poll).toBe(true);
            });

            it('matchs poll `input` with the wallet info', () => {
                expect(poll.input.address).toEqual(wallet.publicKey);
            });

            it('outputs the right `name`', () => {
                expect(poll.output.name).toEqual(name);
            });

            it('outputs the right `options`', () => {
                expect(poll.output.options).toEqual(options);
            });

            it('outputs the right `voters`', () => {
                expect(poll.output.voters).toEqual(voters);
            });
            
            it('is valid poll', () => {
                expect(poll.ValidPoll()).toEqual(true);
            });
            
        });

    });
    describe('createTransaction()', () => {

        describe('the amount of the transaction exceeds the account balance', () => {

            //we want to test if the test might not complete its functionality
            it('throws an error', () => {
                expect(
                    () => { wallet.createTransaction({ amount: 9999999, recipient: 'foo-reci' }) }
                )
                    .toThrow('Amount exceeds balance');
            });
        });

        describe('the amount of the transaction is vaild with the account balance', () => {
            let tracnsaction, amount, recipient;

            beforeEach(() => {
                amount = 50;
                recipient = 'foo-recipient';
                tracnsaction = wallet.createTransaction({ amount, recipient });
            });

            //creates the real instance of our transaction class
            it('creates an instance of `transaction`', () => {
                expect(tracnsaction instanceof Transaction).toBe(true);
            });

            //to make use the createTransaction has the same  public key and signatude of the wallet who used the method its self
            it('matches the transaction input with the wallet', () => {
                expect(tracnsaction.input.address).toEqual(wallet.publicKey);
            });

            //the create tracnsaction sends the amount to the output recipient
            it('outputs the amount of the recipient', () => {
                expect(tracnsaction.outputMap[recipient]).toEqual(amount);
            });

            describe('and a chain is passed ', () => {
                it('calls `Wallet.calculateBalance()`', () => {

                    const calculateBalanceMock = jest.fn();

                    const originalCalculateBalance = Wallet.calculateBalance;
                    Wallet.calculateBalance = calculateBalanceMock;

                    wallet.createTransaction({
                        recipient: 'foo',
                        amount: 10,
                        chain: new Blockchain().chain
                    });

                    expect(calculateBalanceMock).toHaveBeenCalled();

                    Wallet.calculateBalance = originalCalculateBalance;

                });
            });

        });




    });

    describe('calculateBalance()', () => {

        let blockchain;

        beforeEach(() => {
            blockchain = new Blockchain();
        });


        describe('and there are no outputs for the wallet', () => {

            it('returns the `STARTING_BALANCE`', () => {
                expect(
                    Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.publicKey
                    })
                ).toEqual(STARTING_BALANCE);

            });
        });

        describe('and there are outputs for the wallet', () => {
            let transactionOne, transactionTwo;

            beforeEach(() => {
                transactionOne = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 50
                });

                transactionTwo = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 60
                });

                blockchain.addBlock({ data: [transactionOne, transactionTwo] });
            });

            it('adds the sum of all outputs to the wallet balance', () => {
                expect(
                    Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.publicKey
                    })
                ).toEqual(STARTING_BALANCE
                    + transactionOne.outputMap[wallet.publicKey]
                    + transactionTwo.outputMap[wallet.publicKey]);
            });

            describe('and the wallet has made at least one transaction', () => {
                let recentTranscation;

                beforeEach(() => {
                    recentTranscation = wallet.createTransaction({
                        recipient: 'foo',
                        amount: 30
                    });
                    blockchain.addBlock({ data: [recentTranscation] });
                });


                it('returns the output amount of the recent transaction', () => {
                    expect(
                        Wallet.calculateBalance({
                            chain: blockchain.chain,
                            address: wallet.publicKey
                        })
                    ).toEqual(recentTranscation.outputMap[wallet.publicKey]);
                });

                describe('and there are outputs next to and after the recent transaction ', () => {

                    let sameBlockTransaction, nextBlockTransaction;

                    beforeEach(() => {
                        recentTranscation = wallet.createTransaction({
                            recipient: 'later-foo-transaction',
                            amount: 60
                        });

                        //for the same block transactions the only case it would the same wallet have two transactions in the same block is when it has a normal transaction and a reward transaction
                        sameBlockTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
                        blockchain.addBlock({ data: [recentTranscation, sameBlockTransaction] });


                        //next block transaction 
                        nextBlockTransaction = new Wallet().createTransaction({
                            recipient: wallet.publicKey,
                            amount: 75
                        });
                        blockchain.addBlock({ data: [nextBlockTransaction] });
                    });

                    it('includes the output amounts in the returnd balance', () => {

                        expect(
                            Wallet.calculateBalance({
                                chain: blockchain.chain,
                                address: wallet.publicKey
                            })
                        ).toEqual(
                            recentTranscation.outputMap[wallet.publicKey] +
                            sameBlockTransaction.outputMap[wallet.publicKey] +
                            nextBlockTransaction.outputMap[wallet.publicKey]
                        );
                    });
                });

            });
        });
    });

});