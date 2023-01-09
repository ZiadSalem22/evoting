const MINE_RATE = 4000;
const INITIAL_DIFFICULTY = 3;
const STARTING_BALANCE = 1000;
const REWARD_INPUT = {address:'*authorized-reward*'};//miner reward
const MINING_REWARD = 50;
//voting
const CHAR_MAX_LENGTH = 300;
const GENESIS_DATA = {
    timeStamp : 1,
    lastHash: '----',
    data: [],
    nonce: 0,
    difficulty: INITIAL_DIFFICULTY,
    hash: 'hash-one',
};

const TRANSACTION_TYPE = {
    CURRENCY: 'CURRENCY',
    POLL: 'POLL',
    BALLOT: 'BALLOT'
}
//date format ISO expample 2001-24-24T20:30:20
 const ISOregex = /^(?:\d{4})-(?:\d{2})-(?:\d{2})T(?:\d{2}):(?:\d{2}):(?:\d{2}(?:\.\d*)?)(?:(?:-(?:\d{2}):(?:\d{2})|Z)?)$/;



//polls and ballots branch 

module.exports ={
    GENESIS_DATA, 
    MINE_RATE,
    STARTING_BALANCE,
    REWARD_INPUT,
    MINING_REWARD,
    CHAR_MAX_LENGTH,
    TRANSACTION_TYPE,
    ISOregex
};