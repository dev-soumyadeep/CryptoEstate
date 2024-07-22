const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Escrow", function () {
  let Escrow;
  let escrow;
  let PropertyToken;
  let propertyToken;
  let owner;
  let inspector;
  let seller;
  let buyer;
  let tenant;

  const TOKEN_ID = 1;
  const PRICE_FOR_RENT = ethers.parseEther("0.1");
  const PRICE_FOR_BUY = ethers.parseEther("1");
  const ESCROW_AMOUNT = ethers.parseEther("0.5");

  beforeEach(async function () {
    [owner, inspector, seller, buyer, tenant] = await ethers.getSigners();

    // Deploy PropertyToken
    PropertyToken = await ethers.getContractFactory("PropertyToken");
    propertyToken = await PropertyToken.deploy(owner.address);
    await propertyToken.waitForDeployment();

    // Deploy Escrow
    Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(await propertyToken.getAddress(), inspector.address);
    await escrow.waitForDeployment();

    // Mint a token to the seller
    await propertyToken.connect(owner).safeMint(seller.address, "https://example.com/token/1");
    await propertyToken.connect(seller).approve(await escrow.getAddress(), TOKEN_ID);
  });

  describe("Deployment", function () {
    it("Should set the right PTK address", async function () {
      expect(await escrow.PTKaddress()).to.equal(await propertyToken.getAddress());
    });

    it("Should set the right inspector", async function () {
      expect(await escrow.inspector()).to.equal(inspector.address);
    });
  });

  describe("Listing Property", function () {
    it("Should list a property", async function () {
      await escrow.connect(seller).listProperty(TOKEN_ID, PRICE_FOR_RENT, PRICE_FOR_BUY, ESCROW_AMOUNT);
      expect(await escrow.getSeller(TOKEN_ID)).to.equal(seller.address);
    });

    it("Should not allow listing with zero prices", async function () {
      await expect(escrow.connect(seller).listProperty(TOKEN_ID, 0, PRICE_FOR_BUY, ESCROW_AMOUNT)).to.be.revertedWith("Enter a Amount greater than 0");
      await expect(escrow.connect(seller).listProperty(TOKEN_ID, PRICE_FOR_RENT, 0, ESCROW_AMOUNT)).to.be.revertedWith("Enter a Amount greater than 0");
    });
  });

  describe("Depositing Earnest", function () {
    beforeEach(async function () {
      await escrow.connect(seller).listProperty(TOKEN_ID, PRICE_FOR_RENT, PRICE_FOR_BUY, ESCROW_AMOUNT);
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
    beforeEach(async function () {
      await escrow.connect(seller).listProperty(TOKEN_ID, PRICE_FOR_RENT, PRICE_FOR_BUY, ESCROW_AMOUNT);
      await escrow.connect(buyer).depositEarnest(TOKEN_ID, false, { value: ESCROW_AMOUNT });
      await escrow.connect(inspector).approveInspection(TOKEN_ID);
      await propertyToken.connect(seller).transferFrom(seller.address, await escrow.getAddress(), TOKEN_ID);
      // await buyer.sendTransaction({
      //   to: await escrow.getAddress(),
      //   value: PRICE_FOR_BUY
      // });
    });

    it("Should execute buying", async function () {
      await expect(escrow.connect(buyer).executeBuying(TOKEN_ID))
        .to.emit(escrow, "PurchaisedPropertySuccess")
        .withArgs(TOKEN_ID, buyer.address, seller.address);
    });

    it("Should not allow buying without inspection", async function () {
      await escrow.connect(seller).listProperty(TOKEN_ID + 1, PRICE_FOR_RENT, PRICE_FOR_BUY, ESCROW_AMOUNT);
      await escrow.connect(buyer).depositEarnest(TOKEN_ID + 1, false, { value: ESCROW_AMOUNT });
      await expect(escrow.connect(buyer).executeBuying(TOKEN_ID + 1))
        .to.be.revertedWith("Inspection Isn't passed");
    });
  });

  describe("Executing Rent", function () {
    beforeEach(async function () {
      await escrow.connect(seller).listProperty(TOKEN_ID, PRICE_FOR_RENT, PRICE_FOR_BUY, ESCROW_AMOUNT);
      await escrow.connect(tenant).depositEarnest(TOKEN_ID, true, { value: PRICE_FOR_RENT });
      await escrow.connect(inspector).approveInspection(TOKEN_ID);
    });

    it("Should execute renting", async function () {
      await expect(escrow.connect(tenant).executeRent(TOKEN_ID, 7))
        .to.emit(escrow, "RentedPropertySuccess")
        .withArgs(TOKEN_ID, tenant.address, seller.address, 2);  // 2 is rentForweek
    });

    it("Should not allow renting without earnest", async function () {
      await escrow.connect(seller).listProperty(TOKEN_ID + 1, PRICE_FOR_RENT, PRICE_FOR_BUY, ESCROW_AMOUNT);
      await escrow.connect(inspector).approveInspection(TOKEN_ID + 1);
      await expect(escrow.connect(tenant).executeRent(TOKEN_ID + 1, 7))
        .to.be.revertedWith("Have to deposit Earnest first");
    });
  });

  describe("Chainlink Automation", function () {
    beforeEach(async function () {
      await escrow.connect(seller).listProperty(TOKEN_ID, PRICE_FOR_RENT, PRICE_FOR_BUY, ESCROW_AMOUNT);
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
  });
});