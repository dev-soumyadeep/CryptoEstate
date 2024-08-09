## contract structure
# Escrow contract: 
The Escrow contract is the core of the system, overseeing and controlling all operations related to property transactions. It handles listing, purchasing, renting, and the secure management of funds through an escrow mechanism.
# PropertyToken: 
PropertyToken represents properties on the blockchain as ERC-721 tokens. Each token corresponds to a unique property, allowing for seamless on-chain property management, ownership transfers, and rental agreements.




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

Escrow#Escrow - 0xc3062430Aa70dABd1e33a702323aB6c4980883fd
```



# Features
**Property Listings**: Users can list properties for sale or rent, complete with detailed descriptions, images, and pricing.
**Smart Contract Transactions**: Automated, secure, and transparent transactions powered by Ethereum smart contracts.
**Escrow Services**: Ensures safe transactions by holding funds in escrow until conditions are met.
**Rental Management**: Easy management of rental agreements, payments, and durations.
**Automatic Property Reclaim**: Automatically reclaims rented properties once the rental period expires, ensuring timely and efficient property management.

