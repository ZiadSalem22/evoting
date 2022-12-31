const uuid = require('uuid/'); // uuid v1 is time stamped based 

class Poll {
    constructor({createrWallet,name,options,voters}) {
        
        //poll Id
        this.id = uuid();

        this.output =  this.createOutput({ name, options, voters });

        this.input = this.createInput({
            createrWallet,
            id: this.id,
            output: this.output
        });
    }

    createOutput({ name, options, voters }) {
        const output= {
            name ,
            options,
            voters 
        };

        return output;
    };

    createInput({ createrWallet, output }) {

        return {
            timeStamp: Date.now(),
            address: createrWallet.publicKey,
            signature: createrWallet.sign(output)
        }
    };
    
}

module.exports = Poll;