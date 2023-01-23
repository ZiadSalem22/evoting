const Blockchain = require("../blockchain");
const Wallet = require("../wallet");

//create wallets 
const createWallets = (count) => {

    let wallets = [];

    for (let i = 0; i < count; i++) {
        wallets.push(new Wallet());
    }

    return wallets;
}

//get ready voting data 
const getReadyVotingData = ({ chain }) => {

    let rawVotingData = Blockchain.getVotingData({ chain });

    let pollCount = rawVotingData.polls.length;
    let ballotCount = rawVotingData.ballots.length;

    //we map all the votes 
    const votesMap = {};

    for (let ballot of rawVotingData.ballots) {

        if (votesMap[ballot.output.pollId] === undefined) {
            votesMap[ballot.output.pollId] = [];
        }
        votesMap[ballot.output.pollId].push(ballot.output.voteOption);
    }

    //we then get all the voted options
    let votedOptions = Object.create(votesMap);
    for (let key in votedOptions) {

        //get voted options without duplicates
        votedOptions[key] = [...new Set(votedOptions[key])];

        //put them in sperate arrays 
        votedOptions[key] = toMatrix(votedOptions[key], 1);

        //count votes for each vote option in each poll;
        for (option of votedOptions[key]) {
            votedOptions[key][votedOptions[key].indexOf(option)] = [option[0], votesMap[key].filter(x => x == option).length];
        }
    }

    return {
        votedOptions,
        votesMap,
        pollCount,
        ballotCount,
        rawVotingData
    };
}
//split one array  more than one array
function toMatrix(arr, width) {
    return arr.reduce(function (rows, key, index) {
        return (index % width == 0 ? rows.push([key])
            : rows[rows.length - 1].push(key)) && rows;
    }, []);
}


module.exports = { createWallets, toMatrix, getReadyVotingData };