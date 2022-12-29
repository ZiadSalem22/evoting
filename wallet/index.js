const Blockchain = require('../blockchain');
const { STARTING_BALANCE } = require('../config');
const { ec, cryptoHash } = require('../util');
const Transaction = require('./transaction');

class Wallet {
    constructor() {
        //giving started balance 
        this.balance = STARTING_BALANCE;

        //voting ability
        ////////////////////
        ////////////////////
        ///////////////////
        ///////////////////

        //create key pair
        //key pair uses a module called brorand to create random values based on the running environment 
        this.keyPair = ec.genKeyPair();


        //creating the publicKey //and turn it into hex
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    //sign method to sign data from this wallet
    sign(data) {

        //since we are using key pair attribute  we will use the built in sign data method form the elliptic class
        //we hash the data before signing it
        return this.keyPair.sign(cryptoHash(data));
    };

    createTransaction({ recipient, amount, chain }) {

        if (chain) {
            this.balance = Wallet.calculateBalance({
                chain,
                address: this.publicKeym
            });
        }

        //check if amount to be sent is lager than the balance in this instance of wallet
        if (amount > this.balance) {
            throw new Error('Amount exceeds balance');
        }

        return new Transaction({ senderWallet: this, recipient, amount });
    }

    static calculateBalance({ chain, address }) {

        let hasConductedTransaction = false;//to check if the address has made a transasction 
        let outputsTotal = 0;
    
        //we check from the newest block to the oldest to get the lasted transaction
        for (let i=chain.length-1; i>0; i--) {
          const block = chain[i];
    
          for (let transaction of block.data) {

            //in case this last block has a transacton on this address we save it so we can exit the loop 
            if (transaction.input.address === address) {
              hasConductedTransaction = true;
            }
    
            const addressOutput = transaction.outputMap[address];
    
            if (addressOutput) {
              outputsTotal = outputsTotal + addressOutput;
            }
          }
    
          if (hasConductedTransaction) {
            break;
          }
        }
    
        // in case it has the wallet has made no transactions we will add the statring balance with the total 
        return hasConductedTransaction ? outputsTotal : STARTING_BALANCE + outputsTotal;
      }
}

module.exports = Wallet;