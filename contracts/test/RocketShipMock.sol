pragma solidity ^0.4.11;

import '../RocketShip.sol';

contract RocketShipMock is RocketShip {

    event MockBlockNumber(uint _blockNumber);

    function RocketShipMock() payable {}

    function getBlockNumber() internal constant returns (uint) {
        return mock_blockNumber;
    }

    function setMockedBlockNumber(uint _b) public {
        mock_blockNumber = _b;
        MockBlockNumber(_b);
    }

    uint mock_blockNumber = 1;

}
