const { CHAR_MAX_LENGTH } = require("../config");
const { verifySignature } = require("../util");
const Wallet = require("../wallet");
const Poll = require("./poll");


describe('Poll', () => {

    let errorMock;

    beforeEach(() => {
        errorMock = jest.fn();

        global.console.error = errorMock;
    });

    let poll, createrWallet, name;

    beforeEach(() => {
        createrWallet = new Wallet();
        name = 'foo-poll';
        options = ['option 1', 'option 2', 'option 3'];
        voters = ['Ziad', 'Sara'];
        poll = new Poll({
            createrWallet,
            name,
            options,
            voters
        });
        name = name.trim();
    });

    //poll must have ids
    it('has an `id`', () => {
        expect(poll).toHaveProperty('id');
    });

    describe('output', () => {

        it('has an `output`', () => {
            expect(poll).toHaveProperty('output');
        });

        describe('Name', () => {

            it('sets the `name` and trims it', () => {
                expect(poll.output.name).toEqual(name);
            });

            it('has a valid name under max char limit', () => {
                name = toString().padStart(CHAR_MAX_LENGTH + 1 ,1);
                expect(() => {
                    new Poll({ createrWallet, name, options, voters })
                }
                ).toThrow('Poll name too long');
            });

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


     //validates Poll 
     describe('ValidPoll()', () => {

        describe('when the poll is Valid', () => {

            it('return true', () => {
                expect(Poll.validPoll(poll)).toBe(true);
            })
        });

        describe('when the Poll is InValid', () => {

            describe('when a Poll name in output  is too long', () => {
                it('returns false and logs an error', () => {
                    name = toString().padStart(CHAR_MAX_LENGTH + 1 ,1);
                    poll.output.name = name;

                    expect(Poll.validPoll(poll)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                })
            });

            describe('when a poll inputSignature is Invalid', () => {
                it('it returns false and logs an error', () => {

                    poll.input.signature = new Wallet().sign('fake data');

                    expect(Poll.validPoll(poll)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                })
            });
        });

       
    });






});