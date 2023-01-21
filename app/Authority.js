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
            throw new Error(`only admin can change admin Address: wallet ${adminWallet.publicKey} is not an admin`);
        }

       let SetAA = new Set(adminAddresses)


        return this.adminAddresses = Array.from(SetAA);
    }

    setAdminOnly({adminOnly, adminWallet}){

        if (this.checkIfAdmin({adminWallet}) === false){
            throw new Error(`only admin can change admin Address: wallet ${adminWallet.publicKey} is not an admin`);
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

    
    


}
module.exports = Authority;