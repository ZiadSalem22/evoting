const { HNEC_PUBLIC_ADDRESS } = require("../config");

class Authority {
    constructor() {

    
        this.adminOnly = false;


        this.adminAddresses = [HNEC_PUBLIC_ADDRESS] ;

    }

    setAdminAddresses({adminAddresses, adminWallet}) {

        if (adminAddresses === undefined){
            throw new Error('admin addresses are not defined ');
        }

        if (adminAddresses.length < 1){
            throw new Error('admin addresses no entered');
        }

        if (this.checkIfAdmin({adminWallet}) === false){
            throw new Error(`only admin can change admin Address: wallet ${adminWallet.publicKey} is not an admin`);
        }

       let SetAA = new Set(adminAddresses)


        return this.adminAddresses = Array.from(SetAA);
    }

    setAdminOnly({adminOnly, adminWallet}){

        if (this.checkIfAdmin({adminWallet}) === false){
            throw new Error(`only admin can change admin Address: wallet ${adminWallet.publicKey} is not an admin`);
        }
        console.log('admin only',adminOnly);
        return this.adminOnly = adminOnly || false;
    }

    checkIfAdmin({adminWallet}){
    
     return  this.adminAddresses.includes( adminWallet.publicKey);
    }


}
module.exports = Authority;