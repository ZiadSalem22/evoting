const uuid = require('uuid/v1'); // uuid v1 is time stamped based 


class Poll {
    constructor({createrWallet,pollName}) {
        
        //poll Id
        this.id = uuit();

        // this.voters = voters;
        // this.createrWallet = createrWallet;
        this.input = this.createInput({
            createrWallet,
            pollName,
            id: this.id
        });
    }

    createInput({ createrWallet,pollName, id }) {

        return {
            timeStamp: Date.now(),
            pollName ,
            address: createrWallet.publicKey,
            signature: createrWallet.sign(timeStamp,pollName,address,id)
        }
    };
    
}

module.exports = Poll;