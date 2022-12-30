const uuid = require('uuid/v1'); // uuid v1 is time stamped based 


class Poll {
    constructor({createrWallet,name}) {
        
        //poll Id
        this.id = uuit();

        // this.voters = voters;
        // this.createrWallet = createrWallet;
        this.input = this.createInput({
            createrWallet,
            name,
            id: this.id
        });
    }

    createInput({ createrWallet,name, id }) {

        return {
            timeStamp: Date.now(),
            name ,
            address: createrWallet.publicKey,
            signature: createrWallet.sign(timeStamp,name,address,id)
        }
    };
    
}

module.exports = Poll;