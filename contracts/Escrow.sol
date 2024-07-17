//SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;

import {PropertyToken} from "./ERC-721/PropertyToken.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
contract Escrow is AutomationCompatibleInterface{

    address public nftaddress;
    address public inspector;
    PropertyToken public PTKcontract;

    uint rentFordays=1;
    uint rentForweek=2;
    uint rentFormonths=3;

    event returnRentedProperty(
        uint indexed nftId , 
        address indexed tenant,
        uint rentPaid
    );
    event PurchaisedPropertySuccess(
        uint indexed nftId , 
        address indexed buyer,
        address indexed seller
    );
    event RentedPropertySuccess(
        uint indexed nftId , 
        address indexed tenant,
        address indexed owner,
        uint rent
    );
    
    constructor(address _nftaddress, address _inspector)
    {
        PTKcontract = new PropertyToken(0xe40FE2680fCE54909e3697b0689e685C7b84b869);
        nftaddress=_nftaddress;
        inspector=_inspector;

    }

    modifier onlyInspector(){
        require(msg.sender==inspector,"Only inspector can call this function");
        _;
    }

    mapping(uint=>bool)isListed;
    mapping(uint=>address)tenant;
    mapping(uint=>uint)returnTime;
    mapping(uint=>uint)rentDuration;
    mapping(uint=>address)sellers;
    mapping(uint=>uint)escrowAmount;
    mapping(uint=>uint)priceForRent;
    mapping(uint=>uint)priceForBuy;
    mapping(uint=>bool)isInspectionPassed;
    mapping(uint=> mapping(address=>bool))approval;

    uint[] public activeTokensOnRent;

    function listProperty(uint nftId,uint _priceForRent,uint _priceForBuy,uint _escrowAmt) public
    {
        require(_priceForRent>0,"Enter a Amount greater than 0");
        require(_priceForBuy>0,"Enter a Amount greater than 0");
        require(_escrowAmt>0,"Enter a Amount greater than 0");

        isListed[nftId] = true;
        sellers[nftId]=msg.sender;
        priceForRent[nftId] = _priceForRent;
        priceForBuy[nftId] = _priceForBuy;
        escrowAmount[nftId] = _escrowAmt;

    }

    function getSupply() public view returns(uint){
        return PTKcontract.totalSupply();
    }

    function getSeller(uint nftId) public view  returns(address)
    {
        return sellers[nftId];
    }

    function approveInspection(uint nftId) public onlyInspector{
        isInspectionPassed[nftId]=true;
    }

    function getInspectionStatus(uint nftId) public view returns(bool){
        return isInspectionPassed[nftId];
    }

    function depositEarnest(uint nftId,bool rent) public payable
    {
        require(isListed[nftId],"Property is already sold");
        require(tenant[nftId]==address(0),"Property is on Rent");
        if(!rent)
            require(msg.value>=escrowAmount[nftId],"Amount should be greater than/equal to  escrow amount");
        else
        {
           require(msg.value>=priceForRent[nftId],"Amount should be greater than/equal to  escrow amount"); 
           tenant[nftId]=msg.sender;
        }
    }

    function approveSale(uint nftId) public {
        require(!approval[nftId][msg.sender],"ALready Approved");
        approval[nftId][msg.sender]=true;

    }

    function executeBuying(uint nftId) public {
        uint supply =  getSupply();
        require(nftId<=supply,"Property doesn't exists");
        require(isInspectionPassed[nftId]==true,"Inspection Isn't passed");
        require(address(this).balance>=priceForBuy[nftId],"Insufficient balance");

        address seller = sellers[nftId];
        uint amount = escrowAmount[nftId];
        

        isListed[nftId]=false;
        (bool success,)=payable(seller).call{value:amount}("Amount transfered");
        IERC721(nftaddress).transferFrom(address(this),msg.sender,nftId);
        require(success,"Transfer to seller failed");
        emit PurchaisedPropertySuccess(nftId,msg.sender,seller);

    }

    function executeRent(uint nftId,uint duration) public {
        uint supply =  getSupply();
        require(nftId<=supply,"Property doesn't exists");
        require(tenant[nftId]==msg.sender,"Have to deposit Earnest first");
        require(isInspectionPassed[nftId]==true,"Inspection Isn't passed");
        require(address(this).balance>=priceForRent[nftId],"Insufficient balance");

        address owner = sellers[nftId];
        uint amount = priceForRent[nftId];
        uint rent;

        if(duration<7)
            rent=rentFordays;
        else if(duration>=7 && duration<30)
            rent=rentForweek;
        else
            rent=rentFormonths;

        tenant[nftId]=msg.sender;
        returnTime[nftId]=block.timestamp+duration;
        rentDuration[nftId] = duration;
        (bool success,)=payable(owner).call{value:amount}("Amount transfered");
        IERC721(nftaddress).transferFrom(address(this),msg.sender,nftId);
        activeTokensOnRent.push(nftId);
        require(success,"Transfer to owner failed");
        emit RentedPropertySuccess(nftId,msg.sender,owner,rent);
    }

    function getTenant(uint nftId) public view returns(address){
        return tenant[nftId];
    }

    function returnRentedproperty(uint nftId) internal{
        require(tenant[nftId]!=address(0),"Property is not on rent");
        uint rent;
        address owner = sellers[nftId];
        address currentTenant = getTenant(nftId);
        uint duration = rentDuration[nftId];
        if(duration<7)
            rent=rentFordays;
        else if(duration>=7 && duration<30)
            rent=rentForweek;
        else
            rent=rentFormonths;

        
        uint amountToReturn = priceForRent[nftId]-rent;
        IERC721(nftaddress).transferFrom(currentTenant ,owner,nftId);
        (bool success,)=payable(currentTenant ).call{value:amountToReturn}("amount transferred to tenant");
        tenant[nftId]=address(0);
        returnTime[nftId] = 0;
        require(success,"Transfer to owner failed");
        emit returnRentedProperty(nftId,currentTenant,rent);
    }




    function checkUpkeep(bytes calldata checkdata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        uint[] memory tokensToreturn = new uint[](activeTokensOnRent.length);
        uint count = 0;
        for(uint i=0;i<activeTokensOnRent.length;i++)
        {
            uint nftID = activeTokensOnRent[i];
            if(tenant[nftID]!=address(0) && block.timestamp>=returnTime[nftID])
            {
                tokensToreturn[count] = nftID;
                count++;
            }
            
        }

        uint [] memory propertyToReturn = new uint[](count);
        for(uint i=0;i<=count;i++) propertyToReturn[i]=tokensToreturn[i];

        upkeepNeeded = count>0;
        performData=abi.encode(propertyToReturn);


    }


    function performUpkeep(bytes calldata performData) external override {
        (uint[] memory propertyToReturn) = abi.decode(performData,(uint[]));

        for(uint i=0;i<propertyToReturn.length;i++) returnRentedproperty(propertyToReturn[i]);

    }






}