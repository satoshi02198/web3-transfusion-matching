const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Transfusion", () => {
  const NAME = "satoshi";
  const NAME2 = "satoshi2";
  const NAME3 = "satoshi3";
  const NAME4 = "satoshi4";
  const BLOOD_TYPE = "B";
  const BLOOD_TYPE2 = "O";
  const BLOOD_TYPE3 = "A";
  const BLOOD_TYPE4 = "B";

  async function deployContractFixture() {
    const [account1, account2, account3, account4] = await ethers.getSigners();

    const Transplant = await ethers.getContractFactory("Transfusion");
    const contract = await Transplant.deploy();

    return {
      account1,
      account2,
      account3,
      account4,
      contract,
    };
  }

  describe("Deployment", () => {
    it("should set the right admin and owner", async function () {
      const { account1, contract } = await loadFixture(deployContractFixture);
      // check mapping of account1 address => bool, should be true
      const admin = await contract.checkAdmins(account1.address);
      expect(admin).to.equal(true);

      const ownerAddress = await contract.getOwner();
      expect(ownerAddress).to.equal(account1.address);
    });
  });

  describe("Register", () => {
    it("should register and be right states ", async () => {
      const { account2, contract } = await loadFixture(deployContractFixture);
      await contract.connect(account2).registerDonor(NAME, BLOOD_TYPE);
      const donorData = await contract.getDonor(account2.address);
      console.log("🚀 ~ it ~ donorData:", donorData); // [1n,"satoshi", "B",1n]

      expect(donorData[0]).to.equal(BigInt(1));
      expect(donorData[1]).to.equal(NAME);
      expect(donorData[2]).to.equal(BLOOD_TYPE);
      expect(donorData[3]).to.equal(BigInt(1)); // state should be Registered
    });

    it("should increase the number of donorsId[], donorAddresses[], donorsNumber", async () => {
      const { account2, account3, contract } = await loadFixture(
        deployContractFixture
      );
      await contract.connect(account2).registerDonor(NAME, BLOOD_TYPE);
      await contract.connect(account3).registerDonor(NAME2, BLOOD_TYPE2);

      // check donorsId[]
      const donorsId = await contract.getDonorsId();
      const arr = [1, 2];
      const BDonorsId = arr.map((id) => BigInt(id));
      expect(donorsId).to.deep.equal(BDonorsId);

      // check donorAddresses[]
      const donorAddresses = await contract.getDonorAddresses();
      expect(donorAddresses[0]).to.equal(account2.address);

      // check donorsNumber
      const donorsNumber = await contract.getDonorsNumber();
      expect(donorsNumber).to.equal(BigInt(2));
    });
  });

  describe("Deregister", () => {
    it("should change state to Deleted", async () => {
      const { account2, contract } = await loadFixture(deployContractFixture);
      await contract.connect(account2).registerDonor(NAME, BLOOD_TYPE);
      await contract.connect(account2).deregisterDonor(account2.address);
      const donorData = await contract.getDonor(account2.address);

      // check state should be Deleted => 2
      expect(donorData[3]).to.equal(BigInt(2));
    });

    it("should revert if the donor is not registered", async () => {
      const { account1, contract } = await loadFixture(deployContractFixture);
      await expect(
        contract.deregisterDonor(account1.address)
      ).to.be.revertedWith(
        "Donor: can't be deleted, not registerd or already matched"
      );
    });
  });

  describe("Matching process", () => {
    it("should match and state should be matched", async () => {
      const { account2, account3, account4, contract } = await loadFixture(
        deployContractFixture
      );
      await contract.connect(account3).registerDonor(NAME4, BLOOD_TYPE4);
      await contract.connect(account2).registerDonor(NAME2, BLOOD_TYPE2);
      await contract.connect(account4).registerRecipient(NAME, BLOOD_TYPE);

      const donorData = await contract.getDonor(account3.address);
      const recipientData = await contract.getRecipient(account4.address);

      expect(donorData[3]).to.equal(BigInt(3));
      expect(recipientData[3]).to.equal(BigInt(3));
    });
  });

  describe("Set new Admins", () => {
    it("should set new admin", async () => {
      const { account2, contract } = await loadFixture(deployContractFixture);
      await contract.setAdmins(account2.address);
      const isAdmin = await contract.checkAdmins(account2.address);
      expect(isAdmin).to.equal(true);
    });
  });

  describe("Check State for registered donor", () => {
    it("should return state for registered", async () => {
      const { account1, account2, contract } = await loadFixture(
        deployContractFixture
      );
      await contract.registerDonor(NAME, BLOOD_TYPE);
      await contract.registerRecipient(NAME2, BLOOD_TYPE2);
      const state = await contract.getDonorState(account1.address);
      expect(state).to.equal(BigInt(1));
    });
  });
});
