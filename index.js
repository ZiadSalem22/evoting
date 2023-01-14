//body parser is is a middleware to config json with our express function
const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');//for HTTP Requests
const path = require('path');
const BlockChain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet/index');
const TransactionMiner = require('./app/transaction-miner');
const { TRANSACTION_TYPE } = require('./config');
const Ballot = require('./voting/ballot');
const { createWallets, toMatrix, getReadyVotingData } = require('./util/helpers');

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


//we use the use method to inject the middleware to express

//this is body paraser
app.use(bodyParser.json());

// express static will allow us to surve static vibes from a dir
app.use(express.static(path.join(__dirname, 'client/dist')));

//using the get method , first 
// get first parm is the end point location on the server
// get second parm the call back function has two perms which request and response
// req : is the requested data
// res: is the response 
app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

//get voting Data Get Polls and ballots;
app.get('/api/voting-data', (req, res) => {
  
    const data = getReadyVotingData({chain : blockchain.chain});

    res.json({     
        data
    });
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


    const { data: { name, options, voters, startDate, endDate }, privateKey } = req.body;
    let clientWallet = new Wallet(privateKey);


    //if the wallet has an existing identical poll in transaction pool we cancel request
    let poll = transactionPool.existingTransaction({ inputAddress: clientWallet.publicKey, transactionType: TRANSACTION_TYPE.POLL });

    //in case of an error we handle it using the try catch method
    try {

        //if poll already exists  we will return it 
        if (poll !== undefined) {
            return res.status(400).json({ type: 'error', message: 'Please mine a new new block before adding another Poll to the Pool from the same wallet' });
        } else {
            poll = clientWallet.createPoll({
                name,
                options,
                voters,
                startDate,
                endDate
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

//api to  a post Ballot into pool 
//this will be a post request to allow the requester to offially conduct a Ballot to an existing Poll using their application wallet
app.post('/api/ballot', (req, res) => {


    const { data: { pollId, voteOption }, privateKey } = req.body;

    let clientWallet = new Wallet(privateKey);

    //if the wallet has an existing identical poll in transaction pool we cancel request
    let ballot = transactionPool.existingTransaction({
        inputAddress: clientWallet.publicKey,
        transactionType: TRANSACTION_TYPE.BALLOT,
        pollId: pollId,
        chain: blockchain.chain
    });

    //in case of an error we handle it using the try catch method
    try {

        //if poll already exists  we will return it 
        if (ballot !== undefined) {
            return res.status(400).json({ type: 'error', message: 'Ballot already used' });
        } else {
            ballot = new Ballot({
                createrWallet: clientWallet,
                pollId,
                voteOption,
                chain: blockchain.chain
            });
        }

    } catch (error) {
        //if error is to be found we send an error in a proper form 
        return res.status(400).json({ type: 'error', message: error.message });
    }

    transactionPool.setTransaction(ballot);

    pubsub.broadcastTransaction(ballot);

    res.json({ type: 'success', ballot });
});




//api to  post Transactions into pool 
//this will be a post request to allow the requester to offially conduct a transaction  using their application wallet
app.post('/api/transact', (req, res) => {

    const { data: { recipient, amount }, privateKey } = req.body;

    let clientWallet = new Wallet(privateKey);

    //if the wallet has an existing tansaction in transaction pool we will update it , if not it will return undefined 
    let transaction = transactionPool.existingTransaction({ inputAddress: clientWallet.publicKey, transactionType: TRANSACTION_TYPE.CURRENCY });

    //in case of an error we handle it using the try catch method
    try {

        //if it has an already transaction we will update 
        if (transaction !== undefined) {
            transaction.update({
                senderWallet: clientWallet,
                recipient,
                amount
            });

            //else create new transaction
        } else {

            transaction = clientWallet.createTransaction({
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



//get miner wallet info
app.get('/api/miner-wallet-info', (req, res) => {

    const address = wallet.publicKey;
    const privateKey = wallet.privateKey;

    //comment
    res.json({
        address,
        privateKey,
        balance: Wallet.calculateBalance({
            chain: blockchain.chain,
            address
        })
    });
})


//get  wallet info by private key
app.get('/api/wallet-info', (req, res) => {

    const { privateKey } = req.body;

    if (privateKey === undefined) {
        return res.status(400).json({ type: 'error', message: 'please enter private key' });

    }

    let clientWallet = new Wallet(privateKey);

    //comment
    res.json({
        address: clientWallet.publicKey,
        privateKey: clientWallet.privateKey,

        balance: Wallet.calculateBalance({
            chain: blockchain.chain,
            address: clientWallet.publicKey
        })
    });
});


//get create wallets
app.get('/api/create-wallets', (req, res) => {

    //number of wallets
    const { data: { count } } = req.body;

    if (count === undefined) {
        count = 1;
    }

    if ((count > 2000000) || (count <= 0)) {
        return res.status(400).json({ type: 'error', message: 'please enter a valid count from 1 to 2000000 ' });
    }

    let wallets = [];

    for (let i = 0; i < count; i++) {

        let clientWallet = new Wallet();
        wallets[i] = {
            address: clientWallet.publicKey,
            privateKey: clientWallet.privateKey,

            balance: Wallet.calculateBalance({
                chain: blockchain.chain,
                address: clientWallet.publicKey
            }),
            count: i + 1
        };
    }

    //comment
    res.json({
        wallets
    });
});


app.get('/api/seed', (req, res) => {


       //number of wallets
       const { data: { count } } = req.body;

       if (count === undefined) {
           count = 100;
       }
   

    //first we create our wallets

    let wallets = createWallets(count);
    let voters = [];

    for (let wallet of wallets) {
        voters.push(wallet.publicKey);
    }



    let poll1 = wallet.createPoll({
        name: 'الانتخابات الرئاسية الليبية 2023',
        options: ['سيف الاسلام القذافي ', 'عبدالحميد الدبيبة', 'فتحي باشاغا'],
        voters: voters
    });

    let poll2 = new Wallet().createPoll({
        name: 'استفتاء علي المسودة الدستورية رقم 1 2023',
        options: ['نعم', 'لا'],
        voters: voters
    });


    transactionPool.setTransaction(poll1);
    pubsub.broadcastTransaction(poll1);

    transactionPool.setTransaction(poll2);
    pubsub.broadcastTransaction(poll2);

    transactionMiner.mineTransactions();

    let ballot1, ballot2;

    for (let wallet of wallets) {

        ballot1 = new Ballot({
            createrWallet: wallet,
            pollId: poll1.id,
            voteOption: poll1.output.options[Math.floor(Math.random() * poll1.output.options.length)],
            chain: blockchain.chain
        });

        ballot2 = new Ballot({
            createrWallet: wallet,
            pollId: poll2.id,
            voteOption: poll2.output.options[Math.floor(Math.random() * poll2.output.options.length)],
            chain: blockchain.chain
        });

        transactionPool.setTransaction(ballot1);
        pubsub.broadcastTransaction(ballot1);

        transactionPool.setTransaction(ballot2);
        pubsub.broadcastTransaction(ballot2);

        if (wallets.indexOf(wallet) % 30 === 0) {
            transactionMiner.mineTransactions();
        }
    }

    transactionMiner.mineTransactions();


    res.redirect('/api/blocks');


});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});


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

