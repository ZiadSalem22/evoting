const { CHAR_MAX_LENGTH, TRANSACTION_TYPE } = require("../config");
const { verifySignature } = require("../util");
const Wallet = require("../wallet");
const Poll = require("./poll");


describe('Poll', () => {

    let errorMock;

    beforeEach(() => {
        errorMock = jest.fn();

        global.console.error = errorMock;
    });

    let poll, createrWallet, name, options, voters;

    beforeEach(() => {
        createrWallet = new Wallet();
        name = 'foo-poll';
        options = ['option 1', 'option 2', 'option 3'];
        voters = ["041edb189e622ad16be5342e58b62ad4b792238db92470518234733a4bc8e043517896747117fa3cde0173b87edd671e41c220fad9c00640111d5f2ea67d8a7512", "041edb189e622ad16be5342e58b62ad4b792238db92470518234733a4bc8e043517896747117fa3cde0173b87edd671e41c220fad9c00640111d5f2ea67d8a7513"];
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

    describe('`transactionType`', () => {

        //Polls must have transactionType
        it('has an `transactionType`', () => {
            expect(poll).toHaveProperty('transactionType');
        });



        //Polls must have ids
        it('to have valid value`', () => {
            expect(
                (poll.transactionType === TRANSACTION_TYPE.POLL)
                // (Object.values(TRANSACTION_TYPE).find(i => i === transaction.transactionType) !== typeof 'undefined')
            ).toBe(true);
        });
    });

    // we expect valid vote options to bea static function to check voters to be : 
    // an array of  strings that are trimed  and as is shorter than max limit of char and options are  not duplicated;
    describe('vaildOptions', () => {

        let testOptions, vaildOptions;

        beforeEach(() => {
            testOptions = [];
            vaildOptions = [];
        });

        describe('validate  its an array of strings ', () => {

            it('should  throw error', () => {
                testOptions = 3;
                expect(
                    () => {
                        Poll.vaildOptions(testOptions);
                    })
                    .toThrow('Invalid Options: please enter an array of vaild strings');
            });
        });

        describe('validate  its each element is a string ', () => {

            it('should  throw error', () => {
                testOptions = ['option 1', 3];
                expect(
                    () => {
                        Poll.vaildOptions(testOptions);
                    })
                    .toThrow('Invalid Options: please enter an array of vaild strings');
            });
        });

        describe('validate a  options is not too long ', () => {

            it('should  throw error', () => {
                let longOption = toString().padStart(CHAR_MAX_LENGTH + 1, 1);
                testOptions = ['option 1', longOption];
                expect(
                    () => {
                        Poll.vaildOptions(testOptions);
                    })
                    .toThrow(`Invalid Options: option index of (${testOptions.indexOf(longOption)}) has value of [${testOptions[1]}] that exeeds Max limit`);
            });
        });

        describe('validate a option not a empty string ', () => {

            it('should  throw error', () => {
                let emptyString = '';
                testOptions = ['option 1', emptyString];
                expect(
                    () => {
                        Poll.vaildOptions(testOptions);
                    })
                    .toThrow(`Invalid Options: option index of (${testOptions.indexOf(emptyString)}) has value of empty string`);
            });
        });


        describe('trims elements', () => {

            it('shoud return valid options', () => {
                testOptions = [" option 1 "];
                vaildOptions = ["option 1"];
                expect(Poll.vaildOptions(testOptions))
                    .toEqual(vaildOptions);
            });

        });


        describe('removes duplicates', () => {

            it('should retun vaild options', () => {
                testOptions = ["option 1", "option 2", "option 1"];
                vaildOptions = ["option 1", "option 2"];
                expect(Poll.vaildOptions(testOptions))
                    .toEqual(vaildOptions);
            });
        });
    });

    // we expect valid voters static function to check voters to be : 
    // an array of trimed public keys that are duplicated 
    describe('vaildVoters', () => {

        let testVoters, vaildVoters;

        beforeEach(() => {
            testVoters = [];
            vaildVoters = [];
        });

        describe('validate  its a string of public keys', () => {
            it('should  throw error', () => {
                testVoters = 3;
                expect(
                    () => {
                        Poll.vaildVoters(testVoters);
                    })
                    .toThrow('Invalid Voters: please enter an array of public keys');
            });
        });

        describe('trims elements', () => {

            it('shoud return valid voters', () => {
                testVoters = [" 041edb189e622ad16be5342e58b62ad4b792238db92470518234733a4bc8e043517896747117fa3cde0173b87edd671e41c220fad9c00640111d5f2ea67d8a7512 "];
                vaildVoters = ["041edb189e622ad16be5342e58b62ad4b792238db92470518234733a4bc8e043517896747117fa3cde0173b87edd671e41c220fad9c00640111d5f2ea67d8a7512"];
                expect(Poll.vaildVoters(testVoters))
                    .toEqual(vaildVoters);
            });

        });

        describe('public key lengths', () => {
            it('shoud return valid voters', () => {
                testVoters = ["not a public key", "041edb189e622ad16be5342e58b62ad4b792238db92470518234733a4bc8e043517896747117fa3cde0173b87edd671e41c220fad9c00640111d5f2ea67d8a7512", "041edb189e622ad16be5342e58b62ad4b792238db92470518234733a4bc8e043517896747117fa3cde0173b87edd671e41c220fad9c00640111d5f2ea67d8a7333"];
                expect(
                    () => {
                        Poll.vaildVoters(testVoters);
                    })
                    .toThrow(`Invalid Voters: voter index of (${testVoters.indexOf("not a public key")}) has value of [${testVoters[0]}] which is not a public key`);
            });
        });

        describe('removes duplicates', () => {

            it('should retun vaild voters', () => {
                testVoters = ["041edb189e622ad16be5342e58b62ad4b792238db92470518234733a4bc8e043517896747117fa3cde0173b87edd671e41c220fad9c00640111d5f2ea67d8a7512", "041edb189e622ad16be5342e58b62ad4b792238db92470518234733a4bc8e043517896747117fa3cde0173b87edd671e41c220fad9c00640111d5f2ea67d8a7512", "041edb189e622ad16be5342e58b62ad4b792238db92470518234733a4bc8e043517896747117fa3cde0173b87edd671e41c220fad9c00640111d5f2ea67d8a7333"]
                vaildVoters = ["041edb189e622ad16be5342e58b62ad4b792238db92470518234733a4bc8e043517896747117fa3cde0173b87edd671e41c220fad9c00640111d5f2ea67d8a7512", "041edb189e622ad16be5342e58b62ad4b792238db92470518234733a4bc8e043517896747117fa3cde0173b87edd671e41c220fad9c00640111d5f2ea67d8a7333"]
                expect(Poll.vaildVoters(testVoters))
                    .toEqual(vaildVoters);
            });
        });
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
                name = toString().padStart(CHAR_MAX_LENGTH + 1, 1);
                expect(() => {
                    new Poll({ createrWallet, name, options, voters })
                }
                ).toThrow('Invalid name: name too long');
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

            describe('when a transactionType  value is Invalid', () => {
                it('returns false', () => {

                    poll.transactionType = TRANSACTION_TYPE.CURRENCY;

                    expect(Poll.validPoll(poll)).toBe(false);
                })
            });

            describe('when a Poll name in output  is too long', () => {
                it('returns false and logs an error', () => {
                    name = toString().padStart(CHAR_MAX_LENGTH + 1, 1);
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