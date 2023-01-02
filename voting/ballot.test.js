const Wallet = require("../wallet");
const Ballot = require("./ballot");
const Poll = require("./poll");



describe('Ballot', () => {
    let errorMock;

    beforeEach(() => {
        errorMock = jest.fn();

        global.console.error = errorMock;
    });

    let ballot,  createrWallet,  voteOption;
    let  poll, name,  options, voters;
    let blockchain ;

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



        ballot = new Ballot({
            createrWallet,
            pollID: poll.id,
            voteOption
        });

    });

     //Ballot must have ids
     it('has an `id`', () => {
        expect(ballot).toHaveProperty('id');
    });

});