const Transaction = require('./transaction');
const Wallet = require('./index');
const { verifySignature } = require('../util');
const { REWARD_INPUT, MINING_REWARD, TRANSACTION_TYPE } = require('../config');

describe('Transaction', () => {

    let errorMock;

    beforeEach(() => {
        errorMock = jest.fn();

        global.console.error = errorMock;
    });

    //sender wallet the person who will send
    //recipient the public key
    //amount the amount in which they will send 
    let transaction, transactionType, senderWallet, recipient, amount;

    beforeEach(() => {
        senderWallet = new Wallet();
        transactionType = TRANSACTION_TYPE.CURRENCY;
        recipient = 'recipient-public-key';
        amount = 50;
        transaction = new Transaction({ senderWallet, transactionType, recipient, amount });
    });

    //transactions must have ids
    it('has an `id`', () => {
        expect(transaction).toHaveProperty('id');
    });

    describe('`transactionType`', () => {

        //transactions must have ids
        it('has an `transactionType`', () => {
            expect(transaction).toHaveProperty('transactionType');
        });

        //transactions must have ids
        it('to have valid value`', () => {
            expect(
                () => {
                    transaction.transactionType === TRANSACTION_TYPE.CURRENCY
                ||  transaction.transactionType === TRANSACTION_TYPE.POLL
                ||  transaction.transactionType === TRANSACTION_TYPE.BALLOT

                }).toBe(true);
        });



         //transactions must have ids
         it('to have valid value`', () => {
            expect(
                () => {
                    Object.values(transaction.transactionType).includes(TRANSACTION_TYPE)   
                }
                     ).toBe(true);
        });

    });


    //transaction  outputMap
    describe('outputMap', () => {


        it('has an `outputMap`', () => {
            expect(transaction).toHaveProperty('outputMap');
        });

        it('outputs the amount to the recipient', () => {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });

        it('outputs the remaining balance for the `senderWallet`', () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
        });
    });

    //trasaction input
    describe('input', () => {

        it('has an `input`', () => {
            expect(transaction).toHaveProperty('input');
        });

        it('has a `timeStamp`', () => {
            expect(transaction.input).toHaveProperty('timeStamp');
        });

        it('sets the `amount` to the `senderWallet` balance', () => {
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        });

        it('sets the `address` to the `senderWallet` public key', () => {
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        })

        it('signs the input', () => {

            expect(verifySignature({
                publicKey: senderWallet.publicKey,
                data: transaction.outputMap,
                signature: transaction.input.signature
            })
            ).toBe(true);
        });

    });

    //validates transcations 
    describe('ValidTransaction()', () => {

        describe('when the transaction is Valid', () => {

            it('return true', () => {
                expect(Transaction.validTransaction(transaction)).toBe(true);
            })
        });

        describe('when the transaction is InValid', () => {

            describe('when a transaction outputMap value is Invalid', () => {
                it('returns false and logs an error', () => {

                    transaction.outputMap[senderWallet.publicKey] = 99999;

                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                })
            });

            describe('when a transaction inputSignature is Invalid', () => {
                it('it returns false and logs an error', () => {

                    transaction.input.signature = new Wallet().sign('fake data');

                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                })
            });
        });


    });

    //the update function will have the ability to add a new amount to a new recipient in an existing transaction outputMap
    //it should consider 
    describe('update()', () => {

        let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

        describe('and the amount is invali', () => {
            //it should throw and error and kill the whole process
            it('throws an error', () => {
                expect(() => {
                    transaction.update({
                        senderWallet,
                        recipient: 'foo',
                        amount: 99999999
                    })
                }).toThrow('Amount exceeds balance');

            });
        });
        describe('and the amount is valid', () => {
            beforeEach(() => {
                originalSignature = transaction.input.signature;
                originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
                nextRecipient = 'next-recipient';
                nextAmount = 50;

                transaction.update({
                    senderWallet,
                    recipient: nextRecipient,
                    amount: nextAmount
                });
            });

            it('outputs the amount to the next recipient', () => {
                expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
            });

            it('subtracts the amount from the original sender amount ', () => {
                expect(transaction.outputMap[senderWallet.publicKey])
                    .toEqual(originalSenderOutput - nextAmount);
            });

            it('maintains a total output value that still matches the input amount', () => {
                expect(
                    Object.values(transaction.outputMap)
                        .reduce((total, outputAmount) => total + outputAmount))
                    .toEqual(transaction.input.amount);

            });


            it('re-signs the transaction', () => {
                expect(transaction.input.signature).not.toEqual(originalSignature);
            });

            describe('and another update for the same recipient', () => {
                let addedAmount;
                beforeEach(() => {
                    addedAmount = 80;
                    transaction.update({
                        senderWallet,
                        recipient: nextRecipient,
                        amount: addedAmount
                    });
                })

                it('it added to recipient amount', () => {
                    expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount + addedAmount);
                });

                it('subtracts the amount from the original sender output amount', () => {
                    expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount - addedAmount);
                });
            });
        });


    });

    describe('rewardTransaction()', () => {

        let rewardTransaction, minerWallet;

        beforeEach(() => {
            minerWallet = new Wallet();
            rewardTransaction = Transaction.rewardTransaction({ minerWallet });
        });

        it('creates a transaction with the reward input', () => {

            expect(rewardTransaction.input).toEqual(REWARD_INPUT);
        });

        it('creates one transaction for the miner with the `MINING_REWARD`', () => {

            expect(rewardTransaction.outputMap[minerWallet.publicKey]).toEqual(MINING_REWARD);
        });
    });

});