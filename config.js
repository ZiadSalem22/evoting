const MINE_RATE = 4000;
const INITIAL_DIFFICULTY = 3;
const STARTING_BALANCE = 1000;
const REWARD_INPUT = {address:'*authorized-reward*'};//miner reward
const MINING_REWARD = 50;
//voting
const HNEC_PUBLIC_ADDRESS = "041edb189e622ad16be5342e58b62ad4b792238db92470518234733a4bc8e043517896747117fa3cde0173b87edd671e41c220fad9c00640111d5f2ea67d8a7512"
const CHAR_MAX_LENGTH = 50;
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
//date format ISO example 2001-24-24T20:30:20
 const ISOregex = /^(?:\d{4})-(?:\d{2})-(?:\d{2})T(?:\d{2}):(?:\d{2}):(?:\d{2}(?:\.\d*)?)(?:(?:-(?:\d{2}):(?:\d{2})|Z)?)$/;



//polls and ballots branch 

module.exports ={
    GENESIS_DATA, 
    MINE_RATE,
    STARTING_BALANCE,
    REWARD_INPUT,
    MINING_REWARD,
    HNEC_PUBLIC_ADDRESS,
    CHAR_MAX_LENGTH,
    TRANSACTION_TYPE,
    ISOregex
};