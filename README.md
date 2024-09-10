# Contract Structure
## Escrow contract: 
The Escrow contract is the core of the system, overseeing and controlling all operations related to property transactions. It handles listing, purchasing, renting, and the secure management of funds through an escrow mechanism.
## PropertyToken Contract: 
PropertyToken represents properties on the blockchain as ERC-721 tokens. Each token corresponds to a unique property, allowing for seamless on-chain property management, ownership transfers, and rental agreements.
## ERC-721:
modified ERC-721 contract is used to implement the auto-return mechanism and secured from external attack.




Test results
```
 Escrow      
    Deployment
      ✔ Should set the right PTK address
      ✔ Should set the right inspector
    Listing Property
      ✔ Should list a property
      ✔ Should not allow listing with zero prices
    Depositing Earnest
      ✔ Should allow depositing earnest for buying
      ✔ Should allow depositing earnest for renting
      ✔ Should not allow depositing if property is not listed
    Executing Buy
      ✔ Should execute buying
    Executing Rent
      ✔ Should not allow renting without earnest
    Chainlink Automation
      ✔ Should check upkeep
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

Escrow#Escrow - 0xe05e01f4f8a7b9b18bCb46C52835f739A13827f8 (Sepolia)

Successfully verified contract "contracts/Escrow.sol:Escrow" for network sepolia:       
- https://sepolia.etherscan.io/address/0xe05e01f4f8a7b9b18bCb46C52835f739A13827f8#code

PropertyToken Address-0xf95eD1ddff321AF71EF5e53E9722e85784409875 

Chainlink Upkeep registry address:
 -0x86EFBD0b6736Bed994962f9797049422A3A8E8Ad
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