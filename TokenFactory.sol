//SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;

import "./Lending token/Token1.sol";
import "./Lending token/Token1.sol";
contract TokenFactory{
    string public name = "TokenFactory";
    Token1 public token1;
    Token2 public token2;

    constructor(Token1 _token1 ,Token2 _token2)
    {
        token1 = _token1;
        token2 = _token2;
    }
    mapping(address=>uint)addressToamountStaked;
    mapping(address=>bool)isStaked;

    function stakeToken1(uint amount)  public {
        require(amount>0,"amount must be greater than 0");
        token1.transferFrom(msg.sender,address(this),amount);
        addressToamountStaked[msg.sender]+=amount;
        isStaked[msg.sender]=true;
    }

    function issueToken2  (address recipient) internal
    {
        require(isStaked[recipient]==true,"Either withdrawn or not deposited token1");
        uint amount = addressToamountStaked[recipient];
        token2.transfer(recipient,amount);
    }

    function  unstakeToken1 (uint amount) public{
        require(isStaked[msg.sender]==false,"You haven't staked token1");
        require(addressToamountStaked[msg.sender]>=amount,"amount must be less than or equal to amount staked");
        token1.transferFrom(address(this),msg.sender,amount);
        addressToamountStaked[msg.sender]-=amount;
        isStaked[msg.sender]=false;
    }

}