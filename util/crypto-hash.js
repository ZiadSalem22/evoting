
//crypto is a native js lib 
const crypto = require('crypto');


//... inputs is used to cobaine N arguments in inputs array into the funchtin 
const cryptoHash  = (...inputs) =>{

// we create our hashing function 
const hash = crypto.createHash('sha256');

//sorts and joins inputs so even if they are the same but in diffrent order they still give the same value
hash.update(inputs.map(input => JSON.stringify(input)).sort().join(' '));

//digest is used t o hash the input in 64 digit hexa vaules
return hash.digest('hex');
};

module.exports = cryptoHash;
