pragma solidity ^0.6.0;

import "./SafeMath.sol";

contract SmartInsurance {
    using SafeMath for uint256;

    enum Status { AWAITING_PREMIUM, AWAITING_FUNDING, FUNDED, IN_FORCE, PAID_OUT, EXPIRED }
    
    // Status the current Status of the insurance contract
    Status public status;
    
    // Stores the Etheruem address of the insured, it's payable so that the insured address can receive payouts
    address payable public insured;
    uint256 public premium = 0;
    
    // As there can be many insurers, we use an array
    // It's also payable in case it expires
    address payable[] public insurers;
    mapping(address => uint256) public balances;
    
    // Our address, not sure if we need this
    address payable public owner;
    
    string public flightCode;
    string public flightDate;
    
    modifier onlyInsured() {
        require(msg.sender == insured, "Only insured can call this method");
        _;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can call this method");
        _;
    }
    
    constructor(address payable _insured, string memory _flightCode, string memory _flightDate) public {
        owner = msg.sender;
        insured = _insured;
        flightCode = _flightCode;
        flightDate = _flightDate;
        status = Status.AWAITING_PREMIUM;
    }
    
    function insure() payable public {
        require(msg.value > 0, "You must insure this insurance with at least 1 wei.");
        insurers.push(msg.sender);
        balances[msg.sender] = balances[msg.sender].add(msg.value);
    }

    function payPremium() payable onlyInsured public {
        require(msg.value > 0, "Your premium must be at least 1 wei.");
        premium = premium.add(msg.value);
        status = Status.AWAITING_FUNDING;
    }
    
    

    function getBalance() public view returns(uint256) {
        return address(this).balance;
    }
    
    function getStatus() public view returns(Status) {
        return status;
    }
    
    function setState(uint8 _status) public {
        
    }
    
    // Only we can control this function
    function payout(uint8 _hours) onlyOwner public {
        if (_hours >= 3) {
            insured.transfer(address(this).balance);
        } else {
            // TODO
        }
    }
    
    // function percentOfPool(address _insurer) public view returns(uint256) {
    //     // We exclude premium from the calculation
    //     uint256 balance = address(this).balance;
    //     uint256 insurersPool = balance.sub(premium);
    //     uint256 insurerShare = balances[_insurer];
    //     return insurerShare / insurersPool;
    // }
}