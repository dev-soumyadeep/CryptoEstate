
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
      ✔ Should not allow buying without inspection
    Executing Rent
      ✔ Should execute renting
      ✔ Should not allow renting without earnest
    Chainlink Automation
      ✔ Should check upkeep
      ✔ Should perform upkeep
      ✔ Should not need upkeep before rental period ends
Escrow address: 0x0B306BF915C4d645ff596e518fAf3F9669b97016
      ✔ Should transfer property back to escrow after upkeep


  15 passing (2s)
```


# Features
**Property Listings**: Users can list properties for sale or rent, complete with detailed descriptions, images, and pricing.
**Smart Contract Transactions**: Automated, secure, and transparent transactions powered by Ethereum smart contracts.
**Escrow Services**: Ensures safe transactions by holding funds in escrow until conditions are met.
**Rental Management**: Easy management of rental agreements, payments, and durations.
**Automatic Property Reclaim**: Automatically reclaims rented properties once the rental period expires, ensuring timely and efficient property management.




# Note: This project is currently under development.
