const { verifySignature } = require("../util");
const Wallet = require("../wallet");
const Poll = require("./poll");


describe('Poll', () => {

    let errorMock;

    beforeEach(() => {
        errorMock = jest.fn();

        global.console.error = errorMock;
    });

    let poll,createrWallet, name;

    beforeEach(() => {
        createrWallet = new Wallet();
        name = 'foo-poll';
        options = ['option 1', 'option 2', 'option 3'];
        voters = ['Ziad', 'Sara'];
        poll = new Poll({ createrWallet, name , options, voters });
    });

    //poll must have ids
    it('has an `id`', () => {
        expect(poll).toHaveProperty('id');
    });

    describe('output', () => {
        
        it('has an `output`',() => {
            console.log(poll);

            expect(poll).toHaveProperty('output');
        });

        it('sets the `name`', () => {
            expect(poll.output.name).toEqual(name);
        });

        it('sets the `options`', () => {
            expect(poll.output.options).toEqual(options);
        });

        it('sets the `voters`', () => {
            expect(poll.output.voters).toEqual(voters);
        });


        
    });

    describe('input', () => {

        //the poll must have input
        it('has an `input`', () => {
            expect(poll).toHaveProperty('input');
        });

        //has   Time Stamp
        it('has a `timeStamp`', () => {
            expect(poll.input).toHaveProperty('timeStamp');
        });

        
        it('sets the `address` to the `createrWallet` public key', () => {
            expect(poll.input.address).toEqual(createrWallet.publicKey);
        });

        //signs the input of the poll
        it('signs the input', () => {

            expect(verifySignature({
                publicKey: createrWallet.publicKey,
                data: poll.output,
                signature: poll.input.signature
            })
            ).toBe(true);
        });



    });






});