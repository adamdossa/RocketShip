const RocketShip = artifacts.require("./RocketShipMock.sol");
const SafeMath = artifacts.require("../installed_contracts/zeppelin/contracts/SafeMath.sol");

const assertFail = require("./helpers/assertFail");

//Buy ticket - before and after liftOffBlock
//Check cargo as % of balance
//engageThrusters before / after liftOff, as / as not ticket owner
//formal verification

//get acc1 (owner)
//get acc2 (buyer 1)
//get acc3 (buyer 2)

const account_one = web3.eth.accounts[0];
const account_two = web3.eth.accounts[1];
const account_three = web3.eth.accounts[2];

const account_one_starting_balance = web3.eth.getBalance(account_one);
const account_two_starting_balance = web3.eth.getBalance(account_two);
const account_three_starting_balance = web3.eth.getBalance(account_three);

const initialValue = 1000000000000000;
const gasPrice = 4e9;

contract('RocketShip', function(accounts) {
  it("account_two should buy a ticket, then engageThrusters after liftOffBlock, then account_one closeLaunchPad", async () => {
    //Create rocketShip
    var rocketShip = await RocketShip.new({from: account_one, value: initialValue});
    //Set current block to just before liftOffBlock
    var liftOffBlock = await rocketShip.liftOffBlock.call();
    await rocketShip.setMockedBlockNumber(liftOffBlock.toNumber());
    //account_two buys a ticket just in time
    var ticketPrice = await rocketShip.ticketPrice.call();
    await rocketShip.buyTicket({from: account_two, value: ticketPrice});
    //set current block past liftOffBlock
    liftOffBlock = await rocketShip.liftOffBlock.call();
    await rocketShip.setMockedBlockNumber(liftOffBlock.toNumber() + 1);
    //engageThrusters
    var beforeBalance = web3.eth.getBalance(account_two);
    var cargo = await rocketShip.cargo.call();
    var txId = await rocketShip.engageThrusters({from: account_two});
    var gasCost = txId.receipt.gasUsed * gasPrice;
    var afterBalance = web3.eth.getBalance(account_two);
    assert.equal(beforeBalance.add(cargo).toNumber() - gasCost, afterBalance.toNumber(), "Cargo should be paid out to account_two");
    //closeLaunchPad
    beforeBalance = web3.eth.getBalance(account_one);
    cargo = await rocketShip.cargo.call();
    txId = await rocketShip.closeLaunchPad({from: account_one});
    gasCost = txId.receipt.gasUsed * gasPrice;
    afterBalance = web3.eth.getBalance(account_one);
    assert.equal(beforeBalance.add(cargo.div(0.9).mul(0.1)).toNumber() - gasCost, afterBalance.toNumber(), "Refund should be paid out to account_one");
    //check final rocketShip balance is 0
    var finalBalance = web3.eth.getBalance(rocketShip.address);
    assert.equal(finalBalance.toNumber(), 0, "Final rocketShip balance should be 0");
  });
  it("account_two should buy a ticket and increment liftOffBlock by blocksPerTicket", async () => {
    //Create rocketShip
    var rocketShip = await RocketShip.new({from: account_one, value: initialValue});
    //Set current block to just before liftOffBlock
    var liftOffBlock = await rocketShip.liftOffBlock.call();
    await rocketShip.setMockedBlockNumber(liftOffBlock.toNumber());
    //account_two buys a ticket just in time
    var ticketPrice = await rocketShip.ticketPrice.call();
    var txId = await rocketShip.buyTicket({from: account_two, value: ticketPrice});
    var ticketAddress = await rocketShip.ticketAddress.call();
    assert.equal(ticketAddress, account_two, "account_two should be the ticket holder");
    var newLiftOffBlock = await rocketShip.liftOffBlock.call();
    var blocksPerTicket = await rocketShip.blocksPerTicket.call();
    assert.equal(newLiftOffBlock.toNumber(), liftOffBlock.add(blocksPerTicket).toNumber(), "liftOffBlock should be moved forward by blocksPerTicket");
  });
  it("account_two should fail to buy a ticket after liftOffBlock", async () => {
    //Create rocketShip
    var rocketShip = await RocketShip.new({from: account_one, value: initialValue});
    //Set current block to just after liftOffBlock
    var liftOffBlock = await rocketShip.liftOffBlock.call();
    await rocketShip.setMockedBlockNumber(liftOffBlock.toNumber() + 1);
    //account_two buys a ticket too late
    var ticketPrice = await rocketShip.ticketPrice.call();
    await assertFail(async () => {
      await rocketShip.buyTicket({from: account_two, value: ticketPrice});
    })
    //account_one should still be the ticket holder
    var ticketAddress = await rocketShip.ticketAddress.call();
    assert.equal(ticketAddress, account_one, "account_one should still be the ticket holder");
  });
});
