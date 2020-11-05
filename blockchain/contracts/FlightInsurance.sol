pragma solidity ^0.6.0;

import "./SafeMath.sol";
import "./ISmartInsurance.sol";

contract FlightInsurance is ISmartInsurance {
    using SafeMath for uint256;

    // Status the current Status of the insurance contract
    Status public status;
    
    // Stores the Etheruem address of the insured, it's payable so that the insured address can receive payouts
    address payable public insured;
    uint256 public premium = 0;
    
    // As there can be many insurers, we use an array
    // It's also payable in case it expires
    // address payable[] public insurers;
    mapping(address => address payable) public insurers;
    mapping(address => uint256) public balances;
    
    // Our address as escrow 0xfeB87197aBd18dDaBD28B58b205936dfB4569B17
    address payable public escrow = payable(0xfeB87197aBd18dDaBD28B58b205936dfB4569B17);
    
    string public flightCode;
    string public flightDate;
    
    modifier onlyInsured() {
        require(msg.sender == insured, "Only insured can call this method");
        _;
    }
    
    modifier onlyEscrow() {
        require(msg.sender == escrow, "Only GriffinInsurance's escrow service can call this method");
        _;
    }
    
    constructor(string memory _flightCode, string memory _flightDate) payable public {
        require(msg.value > 0, "Your premium must be at least 1 wei.");
        insured = msg.sender;
        flightCode = _flightCode;
        flightDate = _flightDate;
        premium = premium.add(msg.value);
        status = Status.AWAITING_FUNDING;
    }
    
    function insure() payable public override {
        require(msg.value > 0, "You must insure this insurance with at least 1 wei.");
        insurers[msg.sender] = msg.sender;
        balances[msg.sender] = balances[msg.sender].add(msg.value);
    }

    function getBalance() public view override returns (uint256) {
        return address(this).balance;
    }
    
    function getStatus() public view override returns (Status) {
        return status;
    }
    
    function setStatus(Status _status) public override {
        status = _status;
    }
    
    // Only we can control who to payout to, but not to ourselves
    function payout(address payable to, uint256 amount) onlyEscrow payable public override {
        // The payable to address cannot be the escrow
        require(escrow != to, "You cannot transfer money that doesn't belong to you!");
        // The payable to address must either be the insured or the insurers
        require(insurers[to] == to || insured == to, "This insurance contract can only payout to registered insurers or the insured.");
        
        if (insured == to) {
            status = Status.PAID_OUT;
        }
        if (insurers[to] == to) {
            status = Status.EXPIRED_AND_NO_CLAIMS;
        }
        
        to.transfer(amount);
    }
}