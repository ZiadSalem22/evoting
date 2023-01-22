const { HNEC_PUBLIC_ADDRESS } = require("../config");

class Authority {
    constructor() {

    
        this.adminOnly = false;


        this.adminAddresses = [HNEC_PUBLIC_ADDRESS] ;

    }

    setAuthority(authority){
        this.adminOnly = authority.adminOnly;
        this.adminAddresses = authority.adminAddresses;
    }

    setAdminAddresses({adminAddresses, adminWallet}) {

        if (adminAddresses === undefined){
            throw new Error('admin addresses are not defined ');
        }

        if (adminAddresses.length < 1){
            throw new Error('admin addresses no entered');
        }

        if (this.checkIfAdmin({adminWallet}) === false){
            throw new Error(`only admin can change admin Address: wallet [${adminWallet.publicKey}] is not an admin`);
        }


        return this.adminAddresses = Authority.validAdminAddresses(adminAddresses);
    }

    setAdminOnly({adminOnly, adminWallet}){

        if (this.checkIfAdmin({adminWallet}) === false){
            throw new Error(`only admin can change admin Address: wallet [${adminWallet.publicKey}] is not an admin`);
        }
        return this.adminOnly = adminOnly || false;
    }

    checkIfAdmin({adminWallet}){
    
     return  this.adminAddresses.includes( adminWallet.publicKey);
    }

    replaceAuthority(authority){
        this.adminAddresses = authority.adminAddresses;
        this.adminOnly = authority.adminOnly;
    }


    
   //method to validate the entered address
   static validAdminAddresses(adminAddresses) {

    let validAdminAddresses = new Set();

    if (Array.isArray(adminAddresses) === false) {
        throw new Error('Invalid Admin addresses: please enter an array of public keys');
    }

    for (let address of adminAddresses) {

        //check if element is string 
        if (typeof address !== 'string') {
            throw new Error('Invalid Admin addresses: please enter an array of public keys');
        }

        //check if element is string 
        if (address.replace(/ /g, "").length !== "041edb189e622ad16be5342e58b62ad4b792238db92470518234733a4bc8e043517896747117fa3cde0173b87edd671e41c220fad9c00640111d5f2ea67d8a7512".length) {
            throw new Error(`Invalid Admin addresses: admin address of (${adminAddresses.indexOf(address)}) has value of [${address}] which is not a public key`);
        }

        //add it to a set to prevent duplicates 
        validAdminAddresses.add(address.replace(/ /g, ""));
    }

    return [...validAdminAddresses];
}

    
    


}
module.exports = Authority;