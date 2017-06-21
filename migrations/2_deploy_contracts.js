var RocketShip = artifacts.require("./RocketShip.sol");
var SafeMath = artifacts.require("../installed_contracts/zeppelin/contracts/SafeMath.sol");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, RocketShip);
  deployer.deploy(RocketShip, {value: 1000000000000000});
};
