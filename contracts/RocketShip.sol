pragma solidity ^0.4.11;

import "../installed_contracts/zeppelin/contracts/SafeMath.sol";

contract RocketShip {

  using SafeMath for uint256;

  event RocketProvisioned(address _owner, uint256 _liftOffBlock);
  event TicketPurchased(address _ticketAddress, uint256 _ticketPrice, uint256 _liftOffBlock);
  event LiftOff(address _ticketAddress, uint256 _cargo);
  event LaunchPadClosed(address _owner, uint256 _refund);

  uint256 public blocksPerTicket = 4;
  uint256 public provisionPercentage = 10;

  address public owner;
  uint256 public liftOffBlock;
  address public currentTicketAddress;
  uint256 public nextTicketPrice;
  bool public launched;
  bool public closed;

  modifier onlyTicketAddress() {
    require(msg.sender == currentTicketAddress);
    _;
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  modifier onlyAfterLiftOff() {
    require(getBlockNumber() > liftOffBlock);
    _;
  }

  modifier onlyBeforeLiftOff() {
    require(getBlockNumber() <= liftOffBlock);
    _;
  }

  function RocketShip() payable {

    //If msg.value <= 1 then the ticket cost would be 0
    require(msg.value > 1);
    require(provisionPercentage < 100);

    owner = msg.sender;
    liftOffBlock = getBlockNumber().add(blocksPerTicket);
    currentTicketAddress = msg.sender;
    nextTicketPrice = calcTicketPrice();

    RocketProvisioned(msg.sender, liftOffBlock);

  }

  function calcTicketPrice() internal returns (uint256) {
    return (this.balance).div(2);
  }

  function buyTicket() payable onlyBeforeLiftOff public {

    require(msg.value == nextTicketPrice);

    currentTicketAddress = msg.sender;
    liftOffBlock = getBlockNumber().add(blocksPerTicket);
    nextTicketPrice = calcTicketPrice();

    TicketPurchased(msg.sender, msg.value, liftOffBlock);

  }

  function calcCargo() constant public returns (uint256) {
    return (this.balance).mul(percent(100 - provisionPercentage)).div(percent(100));
  }

  function calcNextCargo() constant public returns (uint256) {
    return (this.balance.add(nextTicketPrice)).mul(percent(100 - provisionPercentage)).div(percent(100));
  }

  function engageThrusters() onlyTicketAddress onlyAfterLiftOff public {
    require(!launched);
    launched = true;
    uint256 cargo = calcCargo();
    LiftOff(msg.sender, cargo);
    msg.sender.transfer(cargo);
  }

  function closeLaunchPad() public {
    require(!closed);
    closed = true;
    uint256 refund = this.balance;
    if (!launched) {
      refund = refund.sub(calcCargo());
    }
    LaunchPadClosed(msg.sender, refund);
    msg.sender.transfer(refund);
  }

  function percent(uint256 p) internal returns (uint256) {
    return p.mul(10**16);
  }

  /// @notice This function is overridden by the test Mocks.
  function getBlockNumber() internal constant returns (uint256) {
    return block.number;
  }

}
