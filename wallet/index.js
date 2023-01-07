const Blockchain = require('../blockchain');
const { STARTING_BALANCE, TRANSACTION_TYPE } = require('../config');
const { ec, cryptoHash } = require('../util');
const Poll = require('../voting/poll');
const Transaction = require('./transaction');

class Wallet {
  constructor(secert) {
    //giving started balance 
    this.balance = STARTING_BALANCE;

    //create key pair
    //key pair uses a module called brorand to create random values based on the running environment 
    this.keyPair = this.createKeyPair({privateKey: secert});


    //creating the publicKey //and turn it into hex
    this.publicKey = this.keyPair.getPublic('hex');
    this.privateKey = this.keyPair.getPrivate('hex');
  }

  createKeyPair({privateKey}){
    if (privateKey === undefined){
      return ec.genKeyPair();
    }
    return ec.keyFromPrivate(privateKey);
  }

  //sign method to sign data from this wallet
  sign(data) {

    //since we are using key pair attribute  we will use the built in sign data method form the elliptic class
    //we hash the data before signing it
    return this.keyPair.sign(cryptoHash(data));
  };

  createPoll({ name, options, voters }) {

    return new Poll({ createrWallet: this, name, options, voters });

  }



  createTransaction({ recipient, amount, chain }) {

    if (chain) {
      this.balance = Wallet.calculateBalance({
        chain,
        address: this.publicKey
      });
    }

    //check if amount to be sent is lager than the balance in this instance of wallet
    if (amount > this.balance) {
      throw new Error('Amount exceeds balance');
    }

    return new Transaction({ senderWallet: this, recipient, amount });
  }

  static getWallet({privateKey}){
 
    let oldkeyPair =ec.keyFromPrivate(privateKey);
    
    const oldWallet ={
            //giving started balance 
            balance :STARTING_BALANCE,

            //create key pair
            //key pair uses a module called brorand to create random values based on the running environment 
            keyPair :oldkeyPair,


            //creating the publicKey //and turn it into hex
            publicKey : oldkeyPair.getPublic('hex'),
            privateKey : oldkeyPair.getPrivate('hex')
    }
  
    return oldWallet;

  }

  
  static getPoll({ chain, pollId }) {

    //loop for each block in blockchain
    for (let i = chain.length - 1; i > 0; i--) {
      const block = chain[i];

      //loop for each transaction in blochain
      for (let poll of block.data) {

        if (poll.transactionType === TRANSACTION_TYPE.POLL) {
          //we check transaction 
          if (poll.id === pollId) {
            return poll;
          }
        }
      }
    }

    return undefined;
  }

  static getBallot({ chain, pollId, voter }) {


    //loop for each block in blockchain
    for (let i = chain.length - 1; i > 0; i--) {
      const block = chain[i];

      //loop for each transaction in blochain
      for (let ballot of block.data) {

        if (ballot.transactionType === TRANSACTION_TYPE.BALLOT) {
          //we check transaction 
          if (ballot.output.pollId === pollId && ballot.input.address === voter) {
            return ballot;
          }
        }
      }
    }

    return undefined;
  }

  static calculateBalance({ chain, address }) {

    let hasConductedTransaction = false;//to check if the address has made a transasction 
    let outputsTotal = 0;

    //we check from the newest block to the oldest to get the lasted transaction
    for (let i = chain.length - 1; i > 0; i--) {
      const block = chain[i];

      for (let transaction of block.data) {

        if (transaction.transactionType === TRANSACTION_TYPE.CURRENCY) {

          //in case this last block has a transacton on this address we save it so we can exit the loop 
          if (transaction.input.address === address) {
            hasConductedTransaction = true;
          }

          const addressOutput = transaction.outputMap[address];

          if (addressOutput) {
            outputsTotal = outputsTotal + addressOutput;
          }
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