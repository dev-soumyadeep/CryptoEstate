# Contract Structure
## Escrow contract: 
The Escrow contract is the core of the system, overseeing and controlling all operations related to property transactions. It handles listing, purchasing, renting, and the secure management of funds through an escrow mechanism.
## PropertyToken Contract: 
PropertyToken represents properties on the blockchain as ERC-721 tokens. Each token corresponds to a unique property, allowing for seamless on-chain property management, ownership transfers, and rental agreements.
## ERC-721:
modified ERC-721 contract is used to implement the auto-return mechanism and secured from external attack.


#Demo video
https://www.loom.com/share/a4c8394a1c564dd58c34c6a4addbe3ea?sid=11bbe005-6684-459d-963c-8de0f69f1de2

Test results
```
 Escrow
    Deployment
      ✔ Should set the right PTK address
      ✔ Should set the right inspector
    Listing Property
      ✔ Should list a property
      ✔ Should not allow listing with zero prices
    Buying and Renting
      ✔ Should allow depositing earnest and buying
      ✔ Should allow depositing earnest and renting
      ✔ Should not allow buying/renting if property is not listed
    Chainlink Automation
      ✔ Should check upkeep
      ✔ Should perform upkeep
      ✔ Should not need upkeep before rental period ends
      ✔ Should transfer property back to escrow after upkeep
    Unauthorized Direct Calls to PropertyToken
      ✔ Should not allow unauthorized direct call to giveRentTo
      ✔ Should not allow unauthorized direct call to giveRentBack


  17 passing (2s)
```

Deploying [ Escrow ]
```
Batch #1
  Executed Escrow#Escrow

[ Escrow ] successfully deployed 🚀

Deployed Addresses

Escrow#Escrow - 0xc3062430Aa70dABd1e33a702323aB6c4980883fd (Polygon Amoy)
PropertyToken Address-0x1C445C5efe4980468832906f97BB6fF379C8043C 

Verifying contract "contracts/Escrow.sol:Escrow" for network polygonAmoy...
Successfully verified contract "contracts/Escrow.sol:Escrow" for network polygonAmoy:
  - https://www.oklink.com/amoy/address/0xc3062430Aa70dABd1e33a702323aB6c4980883fd#code

Verifying contract "contracts/ERC-721/PropertyToken.sol:PropertyToken" for network polygonAmoy...
Successfully verified contract "contracts/ERC-721/PropertyToken.sol:PropertyToken" for network polygonAmoy:
  - https://www.oklink.com/amoy/address/0x1C445C5efe4980468832906f97BB6fF379C8043C#code


Chainlink Upkeep registry address:
 -0x93C0e201f7B158F503a1265B6942088975f92ce7
```


# Features
## Property Listings: 
Users can list properties for sale or rent, complete with detailed descriptions, images, and pricing.
## Smart Contract Transactions: 
Automated, secure, and transparent transactions powered by Ethereum smart contracts.
## Escrow Services: 
Ensures safe transactions by holding funds in escrow until conditions are met.
## Rental Management: 
Easy management of rental agreements, payments, and durations.
## Automatic Property Return: 
Automatically reclaims rented properties once the rental period expires, ensuring timely and efficient property management.