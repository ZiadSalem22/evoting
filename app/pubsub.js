const { json } = require('body-parser');
const redis = require('redis');


const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION',
    AUTHORITY: 'AUTHORITY'
}

class PubSub {
    constructor({ blockchain, transactionPool, authority, redisUrl }) {
    // constructor({ blockchain, transactionPool, authority }) {


        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.authority = authority;

        //the roll to broadcast a message
        this.publisher = redis.createClient(redisUrl);
        // this.publisher = redis.createClient();

        //the roll to read a message
        this.subscriber = redis.createClient(redisUrl);
        // this.subscriber = redis.createClient();

        //subscribe to a channel  
        // this.subscriber.subscribe(CHANNELS.TEST);
        // this.subscribe.subscribe(CHANNELS.BLOCKCHAIN);
        this.subscribeToChannels();

        //config handling the message  to our handling message method
        this.subscriber.on(
            'message',
            (channel, message) => this.handleMessage(channel, message)
        );
    }
    //the method that will handle the message 
    handleMessage(channel, message) {

        //logging the message on console log
        console.log(`Message received. Channel: ${channel}. Message: ${message}`);

        //parse the json object 
        const parsedMessage = JSON.parse(message);

        switch (channel) {
            case CHANNELS.BLOCKCHAIN:
                this.blockchain.replaceChain(parsedMessage, true,() => {
                    this.transactionPool.clearBlockchainTransactions({
                        chain: parsedMessage
                    });
                });//thanks to the replace chain it will only replace with a valid chain
                break;

            case CHANNELS.TRANSACTION:
                this.transactionPool.setTransaction(parsedMessage);
                break;

            case CHANNELS.AUTHORITY:
                this.authority.replaceAuthority(parsedMessage);

            default:
                return;
        }

    }

    //the subscribe method 
    subscribeToChannels() {
        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(channel);
        })
    }

    //the  publish method
    publish({ channel, message }) {
        //unsubscribe to the channel so it doesn't get redundant data
        this.subscriber.unsubscribe(channel, () => {

            //publish th message
            this.publisher.publish(channel, message, () => {

                //resubscribe to the channel
                this.subscriber.subscribe(channel);
            });
        });
    }

    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        });
    }

    broadcastTransaction(transaction) {
        this.publish({
            channel: CHANNELS.TRANSACTION,
            message: JSON.stringify(transaction)
        });

    }

    broadcastAuthority() {
        this.publish({
            channel: CHANNELS.AUTHORITY,
            message: JSON.stringify(this.authority)
        });

    }


}


module.exports = PubSub;

// const testPubSub = new PubSub();

// //we will have to wait for the client to be created before we can publish anything
// setTimeout(() => testPubSub.publisher.publish(CHANNELS.TEST,'foo'),1000);