// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);

    constructor(uint256 initBalance) {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public {
        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        if (balance < _withdrawAmount) {
            revert InsufficientBalance(balance, _withdrawAmount);
        }

        // withdraw the given amount
        balance -= _withdrawAmount;
        
        // transfer funds to owner
        payable(msg.sender).transfer(_withdrawAmount);

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function checkPassword(string memory _password) public pure returns (bool) {
        return keccak256(abi.encodePacked(_password)) == keccak256(abi.encodePacked("robert"));
    }

    // This function calculates the total interest payable for a loan
    // based on the reducing balance method.
    function calculateEMIInterest(uint256 _loanAmount, uint256 _interestRate, uint256 _monthlyEMI, uint256 _numberOfEMIs) public pure returns (uint256) {
        require(_interestRate <= 100, "Interest rate should be less than or equal to 100%");
        require(_numberOfEMIs > 0, "Number of EMIs should be greater than 0");

        // Monthly interest rate
        uint256 rate = _interestRate / 12 / 100;
        uint256 interest = 0;
        uint256 remainingPrincipal = _loanAmount;
        
        for (uint256 i = 0; i < _numberOfEMIs; i++) {
            // Interest for the current month
            uint256 monthlyInterest = remainingPrincipal * rate;
            
            // Reduce principal by EMI amount
            remainingPrincipal -= _monthlyEMI;
            
            // Accumulate interest
            interest += monthlyInterest;
        }
        
        return interest;
    }
}
