//import the hexToBinary module form the hex-to-binary lib
const hexToBinary = require('hex-to-binary');

const Block = require('./block');
const { GENESIS_DATA, MINE_RATE } = require('../config');
const {cryptoHash} = require('../util');


describe('Block', () => {

    const timeStamp = 2000;
    const lastHash = 'foo-hash';
    const hash = 'bar-hash';
    const data = ['blockchain', 'data'];
    const nonce = 1;
    const difficulty = 1;

    const block = new Block({ timeStamp, lastHash, hash, data, nonce, difficulty });

    it('has a time stamp, last hash, hash, data property', () => {
        expect(block.timeStamp).toEqual(timeStamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);

    });

    describe('genesis()', () => {
        const genesisBlock = Block.genesis();


        it('returns a Block instance', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        })

        it('returns genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });

    });

    describe('mineBlock()', () => {
        const lastBlock = Block.genesis();
        const data = 'mined data';
        const minedBlock = Block.mineBlock({ lastBlock, data });

        it("it returns block instance", () => {
            expect(minedBlock instanceof Block).toBe(true);
        });

        it("sets the the `lastHash` to be the `hash` of the lastBloack", () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash)
        });

        it("sets the `data`", () => {
            expect(minedBlock.data).toEqual(data);
        });

        it('sets a `timeStamp', () => {
            expect(minedBlock.timeStamp).not.toEqual(undefined);
        });

        it('creates a real SHA-256 `hash` based on the preper inputs', () => {
            expect(minedBlock.hash)
                .toEqual(
                    cryptoHash(
                        minedBlock.timeStamp,
                        lastBlock.hash,
                        data,
                        minedBlock.nonce,
                        minedBlock.difficulty
                    )
                )
        });

        //checks if minedBlock difficulty matches the string of zeros of the leading bits of the blocks hash
        it('sets a `hash` that meets difficultu criteria', () => {
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
        });

        //checks if difficulty is adjusted while block is mined 
        it('adjusts the difficulty', () => {

            const possibleResults = [lastBlock.difficulty + 1, lastBlock.difficulty - 1];

            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);

        });

       
    })

    //tests for adjust difficulty function
    describe('adjustDifficulty()', () => {

        //checks if difficulty increses if the mine is too fast
        it('rasise the difficulty for a quickly mined block', () => {
            // we're giving the adjust difficulty function the last block in the chain
            // and adding its   mined timeStamp plus 900 mil secs (to act like the new block timeStamp)
            // which is lower than 1000 (the targeted time) 
            // so the difficulty should increse 
            expect(
                Block.adjustDifficulty({
                    orginalBlock: block,
                    timeStamp: block.timeStamp + MINE_RATE - 100
                }))
                .toEqual(block.difficulty + 1)
        });

        //checks if difficulty lowers  if the mine is too slow
        it('lowers the difficulty for a slowly mined block', () => {
            // we're giving the adjust difficulty function the last block in the chain
            // and adding mined timeStamp plus 1100 mil secs (to act like the new block timeStamp)
            // which is higher than 1000 (the targeted time) 
            // so the difficulty should lower 
            expect(Block.adjustDifficulty({
                orginalBlock: block,
                timeStamp: block.timeStamp + MINE_RATE + 100
            }))
                .toEqual(block.difficulty - 1)
        });

        //checks if difficulty stays the same if the mine is perfect (rare case)
        it('keeps the difficulty for a perfectly mined block', () => {
            expect(Block.adjustDifficulty({
                orginalBlock: block,
                timeStamp: block.timeStamp + MINE_RATE
            }))
                .toEqual(block.difficulty)
        });

         //to make sure difficulty is always 1 or higher
         it('difficulty has lower limit of 1',() => {
            
            block.difficulty = -1;

            expect(Block.adjustDifficulty({orginalBlock: block})).toEqual(1);
         });

    });
});