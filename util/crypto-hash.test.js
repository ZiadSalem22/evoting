const cryptoHash = require('./crypto-hash');

describe("cryptoHash()",() => {

    it("generates a SHA-256 has hashed output ",() => {
        expect(cryptoHash('foo')).toEqual('b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b')
    });

    it('preduces the same hash with the same arguments in any order',() => {
        expect(cryptoHash('one','two','three')).toEqual(cryptoHash('three','one','two'));
    });

    //we want the object to be uniqe for any instances of an object that has updated properties (JS PROBLEM)
    it('it preduces a uniqe hash when the properties have been changed on an input',()=>{
    
        const foo = {};
        const orginalHash = cryptoHash(foo);
        foo['a'] = 'a';
        const newHash = cryptoHash(foo);

        expect(orginalHash).not.toEqual(newHash);

        
    });

});