let Blockchain = require("../blockchain");
const { TRANSACTION_TYPE } = require("../config");
const { verifySignature } = require("../util");
const Wallet = require("../wallet");
const Ballot = require("./ballot");
const Poll = require("./poll");



describe('Ballot', () => {
    let errorMock;

    beforeEach(() => {
        errorMock = jest.fn();

        global.console.error = errorMock;
    });

    let ballot, createrWallet, voteOption, evildVoteOption;
    let poll, evilPoll, name, options, voters;
    let blockchain, votingData;

    beforeEach(() => {
        createrWallet = new Wallet();
        blockchain = new Blockchain();
        name = 'foo-poll';
        options = ['option 1', 'option 2', 'option 3'];
        voters = [createrWallet.publicKey, "041edb189e622ad16be5342e58b62ad4b792238db92470518234733a4bc8e043517896747117fa3cde0173b87edd671e41c220fad9c00640111d5f2ea67d8a7512"];
        poll = new Poll({
            createrWallet,
            name,
            options,
            voters
        });
        //we create a new ballot that has not been added to the blockchain and try to create a ballot with it
        evilPoll = new Poll({
            createrWallet,
            name,
            options,
            voters
        });

        //we add the poll to the blockaing to make it valid
        blockchain.addBlock({ data: [poll] });

        voteOption = options[0];
        evildVoteOption = new Wallet().publicKey;
        ballot = new Ballot({
            createrWallet,
            pollId: poll.id,
            voteOption,
            chain: blockchain.chain
        });

        votingData = Blockchain.getVotingData({ chain: blockchain.chain });

    });

    //Ballot must have ids
    it('has an `id`', () => {
        expect(ballot).toHaveProperty('id');
    });

    describe('`transactionType`', () => {

        //ballot must have transactionType
        it('has an `transactionType`', () => {
            expect(ballot).toHaveProperty('transactionType');
        });



        //ballot must have transactionType set as BALLOT
        it('to have valid value`', () => {
            expect(
                (ballot.transactionType === TRANSACTION_TYPE.BALLOT)
                // (Object.values(TRANSACTION_TYPE).find(i => i === ballot.transactionType) !== typeof 'undefined')
            ).toBe(true);
        });
    });

    describe('output', () => {

        it('has an `output`', () => {
            expect(ballot).toHaveProperty('output');
        });

        describe('wallet not eligible for poll', () => {

            describe('wallet is not in `poll.voters`', () => {

                it('throws an error', () => {

                    let evilWallet = new Wallet();
                    expect(() => {

                        new Ballot({
                            createrWallet: evilWallet,
                            pollId: poll.id,
                            voteOption,
                            chain: blockchain.chain
                        })
                    }
                    ).toThrow(`Invalid wallet: wallet [${evilWallet.publicKey}] not eligible for poll[${poll.id}]`);
                });

                describe('wallet already used its vote', () => {

                    it('throws an error', () => {

                        blockchain.addBlock({ data: [ballot] });
                        expect(
                            () => {
                                new Ballot({
                                    createrWallet,
                                    pollId: poll.id,
                                    voteOption,
                                    chain: blockchain.chain
                                });
                            }
                        ).toThrow(`Invalid wallet: wallet[${createrWallet.publicKey}] already voted for this poll[${[poll.id]}] `);
                    });
                });

                describe('Poll has not started', () => {
                    it('throws an error', () => {

                        poll = new Poll({
                            createrWallet,
                            name,
                            options,
                            voters,
                            startDate: "2025-12-06T00:00:00"
                        });

                        blockchain.addBlock({ data: [poll] });

                        expect(() => {
                            new Ballot({
                                createrWallet,
                                pollId: poll.id,
                                voteOption,
                                chain: blockchain.chain
                            });
                        }
                        ).toThrow(`Invalid Ballot: poll [${poll.id}] has not started yet`);
                    });
                });

                describe('Poll has ended', () => {
                    it('throws an error', () => {
                        const oldOutput = {
                            name: 'old poll',
                            options: options,
                            voters: [createrWallet.publicKey],
                            startDate: new Date('2000-02-22T00:00:00'),
                            endDate: new Date('2000-02-25T00:00:00')
                        };

                        const oldPoll = {
                            id: '22',
                            input: {
                                timeStamp: new Date('1999-02-22T00:00:00'),
                                address: createrWallet.publicKey,
                                signature: createrWallet.sign(oldOutput)
                            },
                            output: oldOutput,
                            transactionType: TRANSACTION_TYPE.POLL
                        };

                        blockchain.addBlock({ data: [oldPoll] });

                        expect(() => {
                            new Ballot({
                                createrWallet,
                                pollId: oldPoll.id,
                                voteOption,
                                chain: blockchain.chain
                            });
                        }
                        ).toThrow(`Invalid Ballot: poll [${oldPoll.id}] has already ended`);
                    });
                });

            });
        });





        describe('chain', () => {

            describe('`chain` not entered ', () => {

                it('throw error invalid `chain`', () => {

                    expect(() => {
                        new Ballot({ createrWallet, pollId: poll.id, voteOption })
                    }
                    ).toThrow('Invalid chain: chain not entered');
                });
            });

            describe(' invalid `chain` entered ', () => {

                it('throw error invalid `chain`', () => {

                    expect(() => {

                        blockchain.chain[0] = { data: 'fake-genesis' }
                        new Ballot({ createrWallet, pollId: poll.id, voteOption, chain: blockchain.chain })
                    }
                    ).toThrow('Invalid chain: invaild chain entered');
                });
            });
        });

        describe('pollId', () => {

            describe('valid pollId', () => {

                it('sets the `pollId`', () => {
                    expect(ballot.output.pollId).toEqual(poll.id);
                });
            });

            describe('invalid pollId', () => {

                it('throw error invalid `pollId`', () => {

                    expect(() => {
                        new Ballot({ createrWallet, pollId: evilPoll.id, voteOption, chain: blockchain.chain })
                    }
                    ).toThrow(`Invalid poll id: poll [${evilPoll.id}] not found in the blockchain`);
                });
            });

        });

        describe('voteOption', () => {
            describe('valid `voteOption`', () => {

                it('sets the `voteOption`', () => {
                    expect(ballot.output.voteOption).toEqual(voteOption);
                });
            });

            describe('invalid voteOption', () => {

                it('throw error invalid `voteOption`', () => {

                    expect(() => {
                        new Ballot({ createrWallet, pollId: poll.id, voteOption: evildVoteOption, chain: blockchain.chain })
                    }
                    ).toThrow(`Invalid vote option: vote option [${evildVoteOption}] not found in poll[${poll.id}]`);
                });
            });
        });

    });


    describe('input', () => {

        //the ballot must have input
        it('has an `input`', () => {
            expect(ballot).toHaveProperty('input');
        });

        //has   Time Stamp
        it('has a `timeStamp`', () => {
            expect(ballot.input).toHaveProperty('timeStamp');
        });


        it('sets the `address` to the `createrWallet` public key', () => {
            expect(ballot.input.address).toEqual(createrWallet.publicKey);
        });

        //signs the input of the ballot
        it('signs the input', () => {

            expect(verifySignature({
                publicKey: createrWallet.publicKey,
                data: ballot.output,
                signature: ballot.input.signature
            })
            ).toBe(true);
        });

    });

    //validates Ballot 
    describe('validBallot()', () => {

        describe('give chain and the Ballot is Valid', () => {

            it('return true', () => {
                expect(Ballot.validBallot({ ballot, chain: blockchain.chain })).toBe(true);
            })
        });

        describe('give votingData and the Ballot is Valid', () => {

            it('return true', () => {
                expect(Ballot.validBallot({ ballot, votingData })).toBe(true);
            })
        });

        describe('when the Ballot is InValid', () => {

            describe('giving it voting data to validate from', () => {

                describe('when a transactionType  value is Invalid', () => {
                    it('returns false', () => {

                        ballot.transactionType = TRANSACTION_TYPE.CURRENCY;

                        expect(Ballot.validBallot({ ballot, votingData })).toBe(false);
                    });
                });

                describe('when Pollid in output  is invalid', () => {
                    it('returns false and logs an error', () => {

                        ballot.output.pollId = 'evil-poll';
                        ballot.input.signature = createrWallet.sign(ballot.output);

                        expect(Ballot.validBallot({ ballot, votingData })).toBe(false);
                        expect(errorMock).toHaveBeenCalled();
                    });
                });

                describe('when a Ballot  inputSignature is Invalid', () => {
                    it('it returns false and logs an error', () => {

                        ballot.input.signature = new Wallet().sign('fake data');

                        expect(Ballot.validBallot({ ballot, votingData })).toBe(false);
                        expect(errorMock).toHaveBeenCalled();
                    });
                });

                describe('when ballot is not from a voter wallet', () => {

                    it('it returns false and logs an error', () => {

                        ballot.input.address = new Wallet().publicKey;

                        expect(Ballot.validBallot({ ballot, votingData })).toBe(false);
                        expect(errorMock).toHaveBeenCalled();
                    });
                });

                describe('when option of the ballot is not in the poll', () => {

                    it('it returns false and logs an error', () => {

                        ballot.output.voteOption = 'evil option';
                        ballot.input.signature = createrWallet.sign(ballot.output);

                        expect(Ballot.validBallot({ ballot, votingData })).toBe(false);
                        expect(errorMock).toHaveBeenCalled();
                    });
                });

            });


            describe('giving it chain to validate from', () => {

                describe('when a transactionType  value is Invalid', () => {
                    it('returns false', () => {

                        ballot.transactionType = TRANSACTION_TYPE.CURRENCY;

                        expect(Ballot.validBallot({ ballot, chain: blockchain.chain })).toBe(false);
                    });
                });

                describe('when Pollid in output  is invalid', () => {
                    it('returns false and logs an error', () => {

                        ballot.output.pollId = 'evil-poll';
                        ballot.input.signature = createrWallet.sign(ballot.output);

                        expect(Ballot.validBallot({ ballot, chain: blockchain.chain })).toBe(false);
                        expect(errorMock).toHaveBeenCalled();
                    });
                });

                describe('when a Ballot  inputSignature is Invalid', () => {
                    it('it returns false and logs an error', () => {

                        ballot.input.signature = new Wallet().sign('fake data');

                        expect(Ballot.validBallot({ ballot, chain: blockchain.chain })).toBe(false);
                        expect(errorMock).toHaveBeenCalled();
                    });
                });

                describe('when ballot is not from a voter wallet', () => {

                    it('it returns false and logs an error', () => {

                        ballot.input.address = new Wallet().publicKey;
                        ballot.input.signature = createrWallet.sign(ballot.output);

                        expect(Ballot.validBallot({ ballot, chain: blockchain.chain })).toBe(false);
                        expect(errorMock).toHaveBeenCalled();
                    });
                });

                describe('when option of the ballot is not in the poll', () => {

                    it('it returns false and logs an error', () => {

                        ballot.output.voteOption = 'evil option';
                        ballot.input.signature = createrWallet.sign(ballot.output);

                        expect(Ballot.validBallot({ ballot, chain: blockchain.chain })).toBe(false);
                        expect(errorMock).toHaveBeenCalled();
                    });
                });


                describe('when ballot creation date is before poll started', () => {

                    it('it returns false and logs an error', () => {

                        const soonOutput = {
                            name: 'soon poll',
                            options: options,
                            voters: [createrWallet.publicKey],
                            startDate: new Date('2023-02-22T00:00:00'),
                            endDate: new Date('2023-02-25T00:00:00')
                        };

                        const oldPoll = {
                            id: '22',
                            input: {
                                timeStamp: new Date('1999-02-22T00:00:00'),
                                address: createrWallet.publicKey,
                                signature: createrWallet.sign(soonOutput)
                            },
                            output: soonOutput,
                            transactionType: TRANSACTION_TYPE.POLL
                        };

                        blockchain.addBlock({ data: [oldPoll] });

                        ballot.output.pollId = '22';
                        ballot.input.signature = createrWallet.sign(ballot.output);

                        expect(Ballot.validBallot({ ballot, chain: blockchain.chain })).toBe(false);
                        expect(errorMock).toHaveBeenCalled();
                    });
                });

                describe('when ballot creation date is after poll ended', () => {

                    it('it returns false and logs an error', () => {

                        const oldOutput = {
                            name: 'old poll',
                            options: options,
                            voters: [createrWallet.publicKey],
                            startDate: new Date('2000-02-22T00:00:00'),
                            endDate: new Date('2000-02-25T00:00:00')
                        };

                        const oldPoll = {
                            id: '22',
                            input: {
                                timeStamp: new Date('1999-02-22T00:00:00'),
                                address: createrWallet.publicKey,
                                signature: createrWallet.sign(oldOutput)
                            },
                            output: oldOutput,
                            transactionType: TRANSACTION_TYPE.POLL
                        };

                        blockchain.addBlock({ data: [oldPoll] });

                        ballot.output.pollId = '22';
                        ballot.input.signature = createrWallet.sign(ballot.output);

                        expect(Ballot.validBallot({ ballot, chain: blockchain.chain })).toBe(false);
                        expect(errorMock).toHaveBeenCalled();
                    });
                });

                // describe('when voter already voted', () => {

                //     it('it returns false and logs an error', () => {

                //         blockchain.addBlock({ data: [ballot] });

                //         new Ballot({
                //             createrWallet,
                //             pollId: poll.id,
                //             voteOption,
                //             chain: blockchain.chain
                //         });

                //         expect(Ballot.validBallot({ballot, chain: blockchain.chain})).toBe(false);
                //         expect(errorMock).toHaveBeenCalled();
                //     });
                // });


            });
        });

    });

});
