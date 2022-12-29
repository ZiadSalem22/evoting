const cryptoHash = require('./crypto-hash');

const EC = require('elliptic').ec;// getting the ec class from elliptic lib

//theres a lot of versions but we will use the  the same one as bitcoin uses secp2561k1
// Standerds of effitct cryptogrphy , P for prime , 256 for 256 bits , k  for koblets the the Mathematician who helped create this algorthim and one is for v1 
const ec = new EC('secp256k1');

//verify signature method 
const verifySignature = ({ publicKey, data, signature }) => {

    //we will wrap around the verify method that can be found the instanice of a keyfrom public object in the ellipitc lib
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');

    return keyFromPublic.verify(cryptoHash(data), signature);
};

module.exports = { ec, verifySignature, cryptoHash };





