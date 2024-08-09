const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Escrow", function () {
  let Escrow;
  let escrow;
  let propertyToken;
  let owner;
  let inspector;
  let seller;
  let buyer;
  let tenant;

  const TOKEN_ID = 1;

  beforeEach(async function () {
    [owner, inspector, seller, buyer, tenant] = await ethers.getSigners();

    // Deploy Escrow contract and get the address of PropertyToken
    Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(inspector.address);
    await escrow.waitForDeployment();

    // Get the deployed PropertyToken contract from the Escrow contract
    const propertyTokenAddress = await escrow.getPropertyTokenAddress();
    propertyToken = await ethers.getContractAt("PropertyToken", propertyTokenAddress);
  });

  describe("Deployment", function () {
    it("Should set the right PTK address", async function () {
      expect(await escrow.getPropertyTokenAddress()).to.equal(await propertyToken.getAddress());
    });

    it("Should set the right inspector", async function () {
      expect(await escrow.inspector()).to.equal(inspector.address);
    });
  });

  describe("Listing Property", function () {
    const PRICE_FOR_RENT = ethers.parseEther("0.1");
    const PRICE_FOR_BUY = ethers.parseEther("1");
    const ESCROW_AMOUNT = ethers.parseEther("0.5");

    it("Should list a property", async function () {
      await escrow.connect(seller).listProperty(PRICE_FOR_RENT, PRICE_FOR_BUY, ESCROW_AMOUNT, "uri");
      expect(await escrow.getSeller(TOKEN_ID)).to.equal(seller.address);
    });

    it("Should not allow listing with zero prices", async function () {
      await expect(escrow.connect(seller).listProperty(0, PRICE_FOR_BUY, ESCROW_AMOUNT, "uri")).to.be.revertedWith("Enter a Amount greater than 0");
      await expect(escrow.connect(seller).listProperty(PRICE_FOR_RENT, 0, ESCROW_AMOUNT, "uri")).to.be.revertedWith("Enter a Amount greater than 0");
    });
  });

  describe("Depositing Earnest", function () {
    const PRICE_FOR_RENT = ethers.parseEther("0.2");
    const PRICE_FOR_BUY = ethers.parseEther("2");
    const ESCROW_AMOUNT = ethers.parseEther("0.8");

    beforeEach(async function () {
      await escrow.connect(seller).listProperty(PRICE_FOR_RENT, PRICE_FOR_BUY, ESCROW_AMOUNT, "uri");
    });

    it("Should allow depositing earnest for buying", async function () {
      await expect(escrow.connect(buyer).depositEarnest(TOKEN_ID, false, { value: ESCROW_AMOUNT }))
        .to.not.be.reverted;
    });

    it("Should allow depositing earnest for renting", async function () {
      await expect(escrow.connect(tenant).depositEarnest(TOKEN_ID, true, { value: PRICE_FOR_RENT }))
        .to.not.be.reverted;
    });

    it("Should not allow depositing if property is not listed", async function () {
      await expect(escrow.connect(buyer).depositEarnest(TOKEN_ID + 1, false, { value: ESCROW_AMOUNT }))
        .to.be.revertedWith("Property is already sold");
    });
  });

  describe("Executing Buy", function () {
    const PRICE_FOR_RENT = ethers.parseEther("0.3");
    const PRICE_FOR_BUY = ethers.parseEther("3");
    const ESCROW_AMOUNT = ethers.parseEther("3");

    beforeEach(async function () {
      await escrow.connect(seller).listProperty(PRICE_FOR_RENT, PRICE_FOR_BUY, ESCROW_AMOUNT, "uri");
      await escrow.connect(buyer).depositEarnest(TOKEN_ID, false, { value: ESCROW_AMOUNT });
      await escrow.connect(inspector).approveInspection(TOKEN_ID);
    });

    it("Should execute buying", async function () {
      await expect(escrow.connect(buyer).executeBuying(TOKEN_ID))
        .to.emit(escrow, "PurchaisedPropertySuccess")
        .withArgs(TOKEN_ID, buyer.address, seller.address);
    });

    it("Should not allow buying without inspection", async function () {
      const NEW_TOKEN_ID = 2;
      await escrow.connect(seller).listProperty(PRICE_FOR_RENT, PRICE_FOR_BUY, ESCROW_AMOUNT, "uri");
      await escrow.connect(buyer).depositEarnest(NEW_TOKEN_ID, false, { value: ESCROW_AMOUNT });
      await expect(escrow.connect(buyer).executeBuying(NEW_TOKEN_ID))
        .to.be.revertedWith("Inspection Isn't passed");
    });
  });

  describe("Executing Rent", function () {
    const PRICE_FOR_RENT = ethers.parseEther("0.15");
    const PRICE_FOR_BUY = ethers.parseEther("1.5");
    const ESCROW_AMOUNT = ethers.parseEther("1.5");

    beforeEach(async function () {
      await escrow.connect(seller).listProperty(PRICE_FOR_RENT, PRICE_FOR_BUY, ESCROW_AMOUNT, "uri");
      await escrow.connect(tenant).depositEarnest(TOKEN_ID, true, { value: PRICE_FOR_RENT });
      await escrow.connect(inspector).approveInspection(TOKEN_ID);
    });

    it("Should execute renting", async function () {
      await expect(escrow.connect(tenant).executeRent(TOKEN_ID, 7))
        .to.emit(escrow, "RentedPropertySuccess")
        .withArgs(TOKEN_ID, tenant.address, seller.address, 2);  // 2 is rentForweek
    });

    it("Should not allow renting without earnest", async function () {
      const NEW_TOKEN_ID = 2;
      await escrow.connect(seller).listProperty(PRICE_FOR_RENT, PRICE_FOR_BUY, ESCROW_AMOUNT, "uri");
      await escrow.connect(inspector).approveInspection(NEW_TOKEN_ID);
      await expect(escrow.connect(tenant).executeRent(NEW_TOKEN_ID, 7))
        .to.be.revertedWith("Have to deposit Earnest first");
    });
  });

  describe("Chainlink Automation", function () {
    const PRICE_FOR_RENT = ethers.parseEther("4");
    const PRICE_FOR_BUY = ethers.parseEther("5");
    const ESCROW_AMOUNT = ethers.parseEther("3");

    beforeEach(async function () {
      await escrow.connect(seller).listProperty(PRICE_FOR_RENT, PRICE_FOR_BUY, ESCROW_AMOUNT, "uri");
      await escrow.connect(tenant).depositEarnest(TOKEN_ID, true, { value: PRICE_FOR_RENT });
      await escrow.connect(inspector).approveInspection(TOKEN_ID);
      await escrow.connect(tenant).executeRent(TOKEN_ID, 7);
    });

    it("Should check upkeep", async function () {
      await time.increase(8 * 24 * 60 * 60);  // Increase time by 8 days
      const [upkeepNeeded, performData] = await escrow.checkUpkeep("0x");
      expect(upkeepNeeded).to.be.true;
    });

    it("Should perform upkeep", async function () {
      await time.increase(8 * 24 * 60 * 60);  // Increase time by 8 days
      const [, performData] = await escrow.checkUpkeep("0x");
      await expect(escrow.performUpkeep(performData))
        .to.emit(escrow, "returnRentedProperty");
    });

    it("Should not need upkeep before rental period ends", async function () {
      const [upkeepNeeded, ] = await escrow.checkUpkeep("0x");
      expect(upkeepNeeded).to.be.false;
    });

    it("Should transfer property back to escrow after upkeep", async function () {
      await time.increase(8 * 24 * 60 * 60);  // Increase time by 8 days
      
      // Check owner before upkeep
      const ownerBefore = await propertyToken.ownerOf(TOKEN_ID);
      expect(ownerBefore).to.equal(tenant.address);
    
      const [upkeepNeeded, performData] = await escrow.checkUpkeep("0x");
      expect(upkeepNeeded).to.be.true;
    
      await escrow.performUpkeep(performData);
      
      // Check owner after upkeep
      const ownerAfter = await propertyToken.ownerOf(TOKEN_ID);
      expect(ownerAfter).to.equal(await escrow.getAddress());
    });

  });

  describe("Unauthorized Direct Calls to PropertyToken", function () {
    const PRICE_FOR_RENT = ethers.parseEther("0.15");
    const PRICE_FOR_BUY = ethers.parseEther("1.5");
    const ESCROW_AMOUNT = ethers.parseEther("1.5");
  
    beforeEach(async function () {
      await escrow.connect(seller).listProperty(PRICE_FOR_RENT, PRICE_FOR_BUY, ESCROW_AMOUNT, "uri");
      await escrow.connect(tenant).depositEarnest(TOKEN_ID, true, { value: PRICE_FOR_RENT });
      await escrow.connect(inspector).approveInspection(TOKEN_ID);
      await escrow.connect(tenant).executeRent(TOKEN_ID, 7);
    });
  
    it("Should not allow unauthorized direct call to giveRentTo", async function () {
      await expect(
        propertyToken.connect(buyer).giveRentTo(buyer.address, TOKEN_ID)
      ).to.be.revertedWithCustomError(propertyToken,"OwnableUnauthorizedAccount");  
    });
  
    it("Should not allow unauthorized direct call to giveRentBack", async function () {
      await expect(
        propertyToken.connect(buyer).giveRentBack(buyer.address, TOKEN_ID)
      ).to.be.revertedWithCustomError(propertyToken,"OwnableUnauthorizedAccount");  
    });
  });
  
});
