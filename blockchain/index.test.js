const Blockchain = require('.');
const Block = require('./block');
const { GENESIS_DATA } = require('../config');
const { cryptoHash } = require('../util');
const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');

describe('Blockchain', () => {

    let blockchain, newChain, orginalChain,errorMock;

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
        let  logMock;

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

                    
                    newChain.addBlock({data : 'foo'});
                    blockchain.replaceChain(newChain.chain,true);
                    
                    expect(validateTransactionMock).toHaveBeenCalled();
                    
                });
            });

        });
    });

    //tests for valid Transaction data
    describe('validTransactionData()', () => {
        let transaction, rewardTransaction, wallet;

        beforeEach(() => {
            wallet = new Wallet();
            transaction = wallet.createTransaction({
                recipient: 'foo',
                amount: 20
            });
            rewardTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
        });

        describe('and the transaction data is valid', () => {

            it('returns true', () => {
                newChain.addBlock({ data: [transaction, rewardTransaction] })
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

        describe('and the transaction data has at least one malformed outputMap', () => {

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
                
                const evilOutputMap ={
                    [wallet.publicKey]: 8900,
                    fooRecipient : 100
                };

                const evilTransaction ={
                    input:{
                        timeStamp: Date.now(),
                        amount: wallet.balance,
                        address: wallet.publicKey,
                        signature : wallet.sign(evilOutputMap)
                    },
                    outputMap: evilOutputMap
                };

                newChain.addBlock({data: [evilTransaction,rewardTransaction]});

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                expect(errorMock).toHaveBeenCalled();

            });
        });

        describe('and a block contaions multiple identical transactions', () => {
            it('returns false and logs an error', () => {
                newChain.addBlock({ data : [transaction,transaction,transaction,rewardTransaction]})

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });


    });
});