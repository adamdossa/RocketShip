const RocketShip = artifacts.require("./RocketShipMock.sol");
const SafeMath = artifacts.require("../installed_contracts/zeppelin/contracts/SafeMath.sol");
var BigNumber = require('bignumber.js');
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

const initialValue = 1000000000000000;
const gasPrice = 4e9;

contract('RocketShip', function(accounts) {
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
    var beforeBalanceTwo = await web3.eth.getBalance(account_two);
    var cargoEngage = await rocketShip.cargo.call();
    var rocketBalanceEngage = await web3.eth.getBalance(rocketShip.address);
    var txId = await rocketShip.engageThrusters({from: account_two, gasPrice: gasPrice});
    var gasCostEngage = txId.receipt.gasUsed * gasPrice;
    var afterBalanceTwo = await web3.eth.getBalance(account_two);
    var finalBalanceEngage = await web3.eth.getBalance(rocketShip.address);
    assert.equal(finalBalanceEngage.toNumber(), rocketBalanceEngage.sub(cargoEngage).toNumber(), "Final rocketShip balance should be reduced by cargo");
    // console.log(txId.receipt.gasUsed);
    // console.log(gasPrice);
    // console.log(gasCostEngage);
    // console.log(cargoEngage);
    // console.log(beforeBalanceTwo);
    // console.log(afterBalanceTwo);
    assert.equal(beforeBalanceTwo.add(cargoEngage).sub(new BigNumber(gasCostEngage)).toNumber(), afterBalanceTwo.toNumber(), "Cargo should be paid out to account_two");
    //closeLaunchPad
    beforeBalanceOne = await web3.eth.getBalance(account_one);
    var refund = await web3.eth.getBalance(rocketShip.address);
    txId = await rocketShip.closeLaunchPad({from: account_one, gasPrice: gasPrice});
    var gasCostClose = txId.receipt.gasUsed * gasPrice;
    var afterBalanceOne = await web3.eth.getBalance(account_one);
    assert.equal(beforeBalanceOne.add(refund).sub(new BigNumber(gasCostClose)).toNumber(), afterBalanceOne.toNumber(), "Refund should be paid out to account_one");
    //check final rocketShip balance is 0
    var finalBalance = await web3.eth.getBalance(rocketShip.address);
    assert.equal(finalBalance.toNumber(), 0, "Final rocketShip balance should be 0");
  });
  it("account_two should buy a ticket, then account_one closeLaunchPad, then engageThrusters after liftOffBlock", async () => {
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
    //closeLaunchPad
    var beforeBalanceOne = await web3.eth.getBalance(account_one);
    var cargoClose = await rocketShip.cargo.call();
    var rocketBalanceClose = await web3.eth.getBalance(rocketShip.address);
    var txId = await rocketShip.closeLaunchPad({from: account_one, gasPrice: gasPrice});
    gasCostClose = txId.receipt.gasUsed * gasPrice;
    afterBalanceOne = await web3.eth.getBalance(account_one);
    var finalBalanceClose = await web3.eth.getBalance(rocketShip.address);
    assert.equal(finalBalanceClose.toNumber(), rocketBalanceClose.sub(rocketBalanceClose.sub(cargoClose)).toNumber(), "Final rocketShip balance should be reduced by refund");
    assert.equal(beforeBalanceOne.add(rocketBalanceClose.sub(cargoClose)).sub(gasCostClose).toNumber(), afterBalanceOne.toNumber(), "Refund should be paid out to account_one");
    //engageThrusters
    var beforeBalanceTwo = await web3.eth.getBalance(account_two);
    var cargoEngage = await rocketShip.cargo.call();
    txId = await rocketShip.engageThrusters({from: account_two, gasPrice: gasPrice});
    var gasCostEngage = txId.receipt.gasUsed * gasPrice;
    var afterBalanceTwo = await web3.eth.getBalance(account_two);
    assert.equal(beforeBalanceTwo.add(cargoEngage).sub(new BigNumber(gasCostEngage)).toNumber(), afterBalanceTwo.toNumber(), "Cargo should be paid out to account_two");
    //check final rocketShip balance is 0
    var finalBalance = await web3.eth.getBalance(rocketShip.address);
    assert.equal(finalBalance.toNumber(), 0, "Final rocketShip balance should be 0");
  });
});
