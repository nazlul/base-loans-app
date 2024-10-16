// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ETHTransfer {
    address public constant withdrawer = 0x919510c65290372eDeae400f70Db13329e64529D;

    event Deposit(address indexed from, uint256 amount);
    event Withdrawal(address indexed to, uint256 amount);

    function deposit() external payable {
        require(msg.value > 0, "Value too low");
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw() external  {
        require(msg.sender == withdrawer, "Not authorized to withdraw");
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        (bool success, ) = withdrawer.call{value: balance}("");
        require(success, "Transfer failed");
        emit Withdrawal(withdrawer, balance);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

     receive() external payable {
        emit Deposit(msg.sender, msg.value);
     }
}
