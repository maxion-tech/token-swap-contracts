import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("TokenSwap", function () {
  async function loadTokenSwapFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const transferTokenFeePercentage = 0;
    const mintableTokenFeePercentage = 0;

    const TransferToken = await ethers.getContractFactory("ERC20MintableBurnable");
    const transferToken = await TransferToken.deploy("TransferToken", "TT");

    const MintableToken = await ethers.getContractFactory("ERC20MintableBurnable");
    const mintableToken = await MintableToken.deploy("MintableToken", "MT");

    const TokenSwap = await ethers.getContractFactory("TokenSwap");
    const tokenSwap = await TokenSwap.deploy(owner.address, await transferToken.getAddress(), await mintableToken.getAddress(), 3, transferTokenFeePercentage, mintableTokenFeePercentage);

    await mintableToken.grantRole(await transferToken.MINTER_ROLE(), await tokenSwap.getAddress());
    await mintableToken.grantRole(await transferToken.MINTER_ROLE(), owner.address);

    return { tokenSwap, transferToken, mintableToken, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      const { tokenSwap, owner } = await loadFixture(loadTokenSwapFixture);

      expect(await tokenSwap.hasRole(await tokenSwap.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
    });

    it("Should set the correct initial rate", async function () {
      const { tokenSwap } = await loadFixture(loadTokenSwapFixture);

      expect(await tokenSwap.rate()).to.equal(3);
    });

    it("Should set the correct transferTokenFeePercentage and mintableTokenFeePercentage", async function () {
      const { tokenSwap } = await loadFixture(loadTokenSwapFixture);
      await tokenSwap.setFees(10, 0);
      expect(await tokenSwap.transferTokenFeePercentage()).to.equal(10);
      expect(await tokenSwap.mintableTokenFeePercentage()).to.equal(0);
    });
  });

  describe("Swap Functionality", function () {
    it("swapMintableToTransfer: Should correctly swap at rate 3 transferToken per 1 mintableToken with all 0% fee", async function () {
      const { tokenSwap, transferToken, mintableToken, addr1, owner } = await loadFixture(loadTokenSwapFixture);

      // First Test
      const amountTransfer = ethers.parseEther('300');
      const expectedMintableAmount = ethers.parseEther('100'); // Corrected to 100

      await transferToken.connect(owner).mint(addr1.address, amountTransfer);
      await transferToken.connect(addr1).approve(await tokenSwap.getAddress(), amountTransfer);
      await tokenSwap.connect(addr1).swapTransferToMintable(amountTransfer);
      expect(await mintableToken.balanceOf(addr1.address)).to.equal(expectedMintableAmount);

      // Second Test
      const amountMintable = ethers.parseEther('100');
      const expectedTransferAmount = ethers.parseEther('300'); // Corrected to 300      

      await mintableToken.connect(owner).mint(addr1.address, amountMintable);
      await mintableToken.connect(addr1).approve(await tokenSwap.getAddress(), amountMintable);
      await tokenSwap.connect(addr1).swapMintableToTransfer(amountMintable);
      expect(await transferToken.balanceOf(addr1.address)).to.equal(expectedTransferAmount);
    });

    it("swapMintableToTransfer: Should correctly swap at rate 3 transferToken per 1 mintableToken with all transferTokenFeePercentage = 10% fee", async function () {
      const { tokenSwap, transferToken, mintableToken, addr1, owner } = await loadFixture(loadTokenSwapFixture);

      // Set transferTokenFeePercentage to 10%
      await tokenSwap.setFees(10, 0);

      // First Test
      const amountTransfer = ethers.parseEther('300');
      const expectedMintableAmount = ethers.parseEther('90'); // Corrected to 90

      await transferToken.connect(owner).mint(addr1.address, amountTransfer);
      await transferToken.connect(addr1).approve(await tokenSwap.getAddress(), amountTransfer);
      await tokenSwap.connect(addr1).swapTransferToMintable(amountTransfer);
      expect(await mintableToken.balanceOf(addr1.address)).to.equal(expectedMintableAmount);

      // Second Test
      const amountMintable = ethers.parseEther('100');
      const expectedTransferAmount = ethers.parseEther('300'); // Corrected to 300

      await mintableToken.connect(owner).mint(addr1.address, amountMintable);
      await mintableToken.connect(addr1).approve(await tokenSwap.getAddress(), amountMintable);
      await tokenSwap.connect(addr1).swapMintableToTransfer(amountMintable);
      expect(await transferToken.balanceOf(addr1.address)).to.equal(expectedTransferAmount);

    });

    it("swapMintableToTransfer: Should correctly swap at rate 3 transferToken per 1 mintableToken with all mintableTokenFeePercentage = 10% fee", async function () {
      const { tokenSwap, transferToken, mintableToken, addr1, owner } = await loadFixture(loadTokenSwapFixture);

      // Set mintableTokenFeePercentage to 10%
      await tokenSwap.setFees(0, 10);

      // First Test
      const amountTransfer = ethers.parseEther('300');
      const expectedMintableAmount = ethers.parseEther('100'); // Corrected to 100

      await transferToken.connect(owner).mint(addr1.address, amountTransfer);
      await transferToken.connect(addr1).approve(await tokenSwap.getAddress(), amountTransfer);
      await tokenSwap.connect(addr1).swapTransferToMintable(amountTransfer);
      expect(await mintableToken.balanceOf(addr1.address)).to.equal(expectedMintableAmount);

      // Second Test
      const amountMintable = ethers.parseEther('100');
      const expectedTransferAmount = ethers.parseEther('270'); // Corrected to 270

      await mintableToken.connect(owner).mint(addr1.address, amountMintable);
      await mintableToken.connect(addr1).approve(await tokenSwap.getAddress(), amountMintable);
      await tokenSwap.connect(addr1).swapMintableToTransfer(amountMintable);
      expect(await transferToken.balanceOf(addr1.address)).to.equal(expectedTransferAmount);
    });

    it("swapMintableToTransfer: Should correctly swap at rate 3 transferToken per 1 mintableToken with all transferTokenFeePercentage = 10% and mintableTokenFeePercentage = 10% fee", async function () {
      const { tokenSwap, transferToken, mintableToken, addr1, owner } = await loadFixture(loadTokenSwapFixture);

      // Set transferTokenFeePercentage to 10% and mintableTokenFeePercentage to 10%
      await tokenSwap.setFees(10, 10);

      // First Test
      const amountTransfer = ethers.parseEther('300');
      const expectedMintableAmount = ethers.parseEther('90'); // Corrected to 90

      await transferToken.connect(owner).mint(addr1.address, amountTransfer);
      await transferToken.connect(addr1).approve(await tokenSwap.getAddress(), amountTransfer);
      await tokenSwap.connect(addr1).swapTransferToMintable(amountTransfer);
      expect(await mintableToken.balanceOf(addr1.address)).to.equal(expectedMintableAmount);

      // Second Test
      const amountMintable = ethers.parseEther('100');
      const expectedTransferAmount = ethers.parseEther('270'); // Corrected to 270

      await mintableToken.connect(owner).mint(addr1.address, amountMintable);
      await mintableToken.connect(addr1).approve(await tokenSwap.getAddress(), amountMintable);
      await tokenSwap.connect(addr1).swapMintableToTransfer(amountMintable);
      expect(await transferToken.balanceOf(addr1.address)).to.equal(expectedTransferAmount);
    });
  });

});
