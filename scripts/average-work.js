const Blockchain = require("../blockchain");


const blockchain = new Blockchain();

blockchain.addBlock({data: 'initial experment block'});

console.log('firstBlock', blockchain.chain[blockchain.chain.length - 1]);

let prevTimeStamp, nextTimeStamp, nextBlock, Timediff, average;

const times = [];

for (let i=0 ; i<10000 ; i++){
    
    //get the time stamp of the last block in chain
    prevTimeStamp = blockchain.chain[blockchain.chain.length -1 ].timeStamp;

    //add new block 
    blockchain.addBlock({data: `block ${i}` });

    //get the new block
    nextBlock = blockchain.chain[blockchain.chain.length - 1 ];

    //new block timeStamp 
    nextTimeStamp = nextBlock.timeStamp;

    //compare difference
    Timediff = nextTimeStamp - prevTimeStamp;

    //saving time diff
    times.push(Timediff);

    //at every itteraction of this array of every item 
    //we're gonna add the currtent item number to the growing total
    // so this over all gonna reduce times array to a sum 
    // from that sum we divid by  length of time to get true average 
    average = times.reduce((total, num) =>(total + num))/times.length;

    console.log(`Block #: ${i} Time to mine block: ${Timediff}ms. Difficulty: ${nextBlock.difficulty}. Average time: ${average.toFixed(2)}ms`);

}