//body parser is is a middleware to config json with our express function
const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');//for HTTP Requests
const BlockChain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet/index');
const { response } = require('express');
const TrasactionMiner = require('./app/transaction-miner');
const TransactionMiner = require('./app/transaction-miner');
const Poll = require('./voting/poll');

//we create our application  using the express function
const app = express();
const blockchain = new BlockChain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool });
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });



const DEFAULT_PORT = 3000;
let PEER_PORT;


// if the enve genrate peer port is true we can genrate a new instence with a new port
if (process.env.GENERATE_PEER_PORT === 'true') {
    //gives 3000 + random number from 1 to 1000 = [3000 <-> 4000]
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

//if peer port is not defined it will take default port
const PORT = PEER_PORT || DEFAULT_PORT;

const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;




// setTimeout(() => pubsub.broadcastChain(), 1000);

//we use the use method to inject the middleware to express
app.use(bodyParser.json());

//using the get method , first 
// get first parm is the end point location on the server
// get second parm the call back function has two perms which request and response
// req : is the requested data
// res: is the response 
app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

//create post request to add new block to the chain 

app.post('/api/mine', (req, res) => {

    //destructing the data from the requset body
    const { data } = req.body;

    //adding the block 
    blockchain.addBlock({ data });

    //broadcast chain with we mine a block
    pubsub.broadcastChain();

    //redirecting to the get method
    res.redirect('/api/blocks');
});

//api to  a post Poll into pool 
//this will be a post request to allow the requester to offially conduct a poll  using their application wallet
app.post('/api/poll', (req, res) => {

    const { name, options, voters } = req.body;

    //if the wallet has an existing identical poll in transaction pool we cancel request
    let poll = transactionPool.existingTransaction({ inputAddress: wallet.publicKey });

    //in case of an error we handle it using the try catch method
    try {

        //if poll already exists  we will return it 
        if (!poll) {
           //

            poll = wallet.createPoll({
                name,
                options,
                voters
            });
        }

    } catch (error) {
        //if error is to be found we send an error in a proper form 
        return res.status(400).json({ type: 'error', message: error.message });
    }

    transactionPool.setTransaction(poll);

    // console.log('transactionPool', transactionPool);

    pubsub.broadcastTransaction(poll);

    res.json({ type: 'success', poll });
});




//api to  post Transactions into pool 
//this will be a post request to allow the requester to offially conduct a transaction  using their application wallet
app.post('/api/transact', (req, res) => {

    const { amount, recipient } = req.body;

    //if the wallet has an existing tansaction in transaction pool we will update it , if not it will return undefined 
    let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey });

    //in case of an error we handle it using the try catch method
    try {

        //if it has an already transaction we will update 
        if (transaction) {
            transaction.update({
                senderWallet: wallet,
                recipient,
                amount
            });
            //else create new transaction
        } else {

            transaction = wallet.createTransaction({
                recipient,
                amount,
                chain: blockchain.chain
            });
        }

    } catch (error) {
        //if error is to be found we send an error in a proper form 
        return res.status(400).json({ type: 'error', message: error.message });
    }

    transactionPool.setTransaction(transaction);

    // console.log('transactionPool', transactionPool);

    pubsub.broadcastTransaction(transaction);

    res.json({ type: 'success', transaction });
});


//api to get transactions in  pool
app.get('/api/transaction-pool-map', (req, res) => {

    res.json(transactionPool.transactionMap);
});

//mine transactions get method
app.get('/api/mine-transactions', (req, res) => {

    transactionMiner.mineTransactions();

    res.redirect('/api/blocks');
});

//get wallet info
app.get('/api/wallet-info',(req,res)=>{

    const address = wallet.publicKey;

    res.json({ 
        address,
        balance: Wallet.calculateBalance({
            chain: blockchain.chain,
            address
        })
    });
})

//request from root node so it will have the longest node first
const syncWithRootState = () => {

    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {

        if (!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body);

            blockchain.replaceChain(rootChain);

            console.log('replace chain on a sync with', rootChain);
        }

    });

    request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const rootTransactionPoolMap = JSON.parse(body)

            transactionPool.setMap(rootTransactionPoolMap);

            console.log('replace Transaction Pool Map on a sync with', rootTransactionPoolMap);


        }
    });

};

app.listen(PORT, () => {
    console.log(`listening at localhost: ${PORT}`);

    if (PORT !== DEFAULT_PORT) {

        syncWithRootState();
    }
});

