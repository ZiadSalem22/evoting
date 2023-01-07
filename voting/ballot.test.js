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
        voters = [createrWallet.publicKey, 'Sara'];
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
        evildVoteOption = 'fake option';
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

                    expect(() => {

                        new Ballot({
                            createrWallet: new Wallet(),
                            pollId: poll.id,
                            voteOption,
                            chain: blockchain.chain
                        })
                    }
                    ).toThrow('Invalid wallet: wallet not eligible for poll');
                });

                describe('wallet already used its vote', () => {

                    it('throws an error', () => {

                        expect(() => {

                            blockchain.addBlock({ data: [ballot] });

                            new Ballot({
                                createrWallet,
                                pollId: poll.id,
                                voteOption,
                                chain: blockchain.chain
                            });
                        }
                        ).toThrow('Invalid wallet: wallet already voted for this poll');
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
                    ).toThrow('Invalid poll id: poll not found');
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
                    ).toThrow('Invalid vote option: vote option not found in pull');
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

                        expect(Ballot.validBallot({ ballot, votingData})).toBe(false);
                    });
                });

                describe('when Pollid in output  is invalid', () => {
                    it('returns false and logs an error', () => {

                        ballot.output.pollId = 'evil-poll';

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

                        expect(Ballot.validBallot({ ballot, chain: blockchain.chain })).toBe(false);
                        expect(errorMock).toHaveBeenCalled();
                    });
                });

                describe('when option of the ballot is not in the poll', () => {

                    it('it returns false and logs an error', () => {

                        ballot.output.voteOption = 'evil option';

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