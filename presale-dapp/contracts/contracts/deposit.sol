// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ETHTransfer {
    address public owner;

    event Deposit(address indexed from, uint256 amount);
    event Withdrawal(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor(address _owner) {
        owner = _owner;
    }

    function deposit() external payable {
        require(msg.value > 0, "Value too low");
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Transfer failed");

        emit Withdrawal(owner, balance);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

     receive() external payable {
        emit Deposit(msg.sender, msg.value);
     }
}
