//import the hexToBinary module form the hex-to-binary lib
const hexToBinary = require('hex-to-binary');

const { GENESIS_DATA, MINE_RATE } = require("../config");
const {cryptoHash} = require("../util");



class Block {

    constructor({ timeStamp, lastHash, hash, data, nonce, difficulty }) {
        this.timeStamp = timeStamp;
        this.lastHash = lastHash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
        this.hash = hash;
    }

    static genesis() {
        return new this(GENESIS_DATA);
    }

    static mineBlock({ lastBlock, data }) {

        let timeStamp, hash;

        const lastHash = lastBlock.hash;
        let { difficulty } = lastBlock;
        let nonce = 0;

        do {
            nonce++;
            timeStamp = Date.now();
            difficulty = Block.adjustDifficulty({orginalBlock:lastBlock,timeStamp});
            hash = cryptoHash(timeStamp, lastHash, data, nonce, difficulty);

            //we convert the hash to binary so it checks in binary
        } while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));

        return new Block({
            timeStamp,
            lastHash,
            data,
            nonce,
            difficulty,
            hash,
        });
    }
 
    // this method with will allow us to check and adjust the difficulty
    // depending on the our targeted mine rate and 
    // the time stamps of the old and new block
    static adjustDifficulty({orginalBlock,timeStamp}){
        
        const {difficulty} = orginalBlock;

        if (difficulty < 1) return  1;


        const difference = timeStamp - orginalBlock.timeStamp;

        // if the difference is higher than the mine rate it means
        // its taking too much time to mine
        if (difference > MINE_RATE )
            return difficulty - 1;
        
        
        if (difference == MINE_RATE)
            return difficulty;

        return difficulty + 1;
    }
}

module.exports = Block;

