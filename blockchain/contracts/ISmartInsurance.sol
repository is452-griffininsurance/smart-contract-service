pragma solidity ^0.6.0;

interface ISmartInsurance {
    enum Status { AWAITING_PREMIUM, AWAITING_FUNDING, FUNDED, IN_FORCE, PAID_OUT, EXPIRED_AND_NO_CLAIMS }
    function insure() payable external;
    function getBalance() external view returns (uint256);
    function getStatus() external view returns (Status);
    function setStatus(Status _status) external;
    function payout(address payable to, uint256 amount) payable external;
}