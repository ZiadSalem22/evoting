const MINE_RATE = 4000;
const INITIAL_DIFFICULTY = 3;
const STARTING_BALANCE = 1000;
const REWARD_INPUT = {address:'*authorized-reward*'};//miner reward
const MINING_REWARD = 50;
const GENESIS_DATA = {
    timeStamp : 1,
    lastHash: '----',
    data: [],
    nonce: 0,
    difficulty: INITIAL_DIFFICULTY,
    hash: 'hash-one',
};



//polls and ballots branch 

module.exports ={
    GENESIS_DATA, 
    MINE_RATE,
    STARTING_BALANCE,
    REWARD_INPUT,
    MINING_REWARD
};