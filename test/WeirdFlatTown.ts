import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("WeirdFlatTown", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployWeirdFlatTownFixture() {

    const estateUris = [
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o"
    ];

    const estatePrices = [
      ethers.parseEther("1"),
      ethers.parseEther("1"),
      ethers.parseEther("1"),
      ethers.parseEther("1"),
      ethers.parseEther("1"),
      ethers.parseEther("1"),
      ethers.parseEther("1"),
      ethers.parseEther("1"),
      ethers.parseEther("1"),
      ethers.parseEther("1"),
      ethers.parseEther("1"),
      ethers.parseEther("1"),
      ethers.parseEther("1"),
      ethers.parseEther("1"),
      ethers.parseEther("1"),
    ];

    const estateTitles = [
      "aaa",
      "bbb",
      "ccc",
      "ddd",
      "eee",
      "fff",
      "ggg",
      "hhh",
      "iii",
      "jjj",
      "kkk",
      "lll",
      "mmm",
      "nnn",
      "ooo"
    ];


    const grid = [
      [0, 0], [0, 1], [0, 2],
      [1, 0], [1, 1], [1, 2],
      [2, 0], [2, 1], [2, 2]
    ];

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const WeirdFlatTown = await ethers.getContractFactory("WeirdFlatTown");
    const weirdFlatTown = await WeirdFlatTown.deploy();

    const txnEstates = await weirdFlatTown.addEstates(estateUris, estatePrices, estateTitles);
    await txnEstates.wait();

    return { weirdFlatTown, grid, owner, otherAccount };
  }

  describe("MintLand", function () {
    it("Should revert with TooManyLand", async function () {
      const { weirdFlatTown, grid } = await loadFixture(deployWeirdFlatTownFixture);

      await expect(weirdFlatTown.mintLand(6, grid, {value: ethers.parseEther("0.003")})).to.be.revertedWithCustomError(weirdFlatTown, "TooManyLand");
    });

    it("Should revert with WrongPrice", async function () {
      const { weirdFlatTown, grid } = await loadFixture(deployWeirdFlatTownFixture);

      await expect(weirdFlatTown.mintLand(4, grid, {value: ethers.parseEther("0.003")})).to.be.revertedWithCustomError(weirdFlatTown, "WrongPrice");
    });

    it("Should revert with LandInvalid", async function () {
      const { weirdFlatTown } = await loadFixture(deployWeirdFlatTownFixture);

      const land = [
        [0, 1], [3, 1], [0, 2]
      ];

      await expect(weirdFlatTown.mintLand(3, land, {value: ethers.parseEther("0.009")})).to.be.revertedWithCustomError(weirdFlatTown, "LandInvalid");
    });

    it("Should revert with LandAlreadyBuyed", async function () {
      const { weirdFlatTown } = await loadFixture(deployWeirdFlatTownFixture);

      const land = [
        [0, 1], [0, 1], [0, 2]
      ];

      await expect(weirdFlatTown.mintLand(3, land, {value: ethers.parseEther("0.009")})).to.be.revertedWithCustomError(weirdFlatTown, "LandAlreadyBuyed");
    });

    it("Should mint 3 land parcels", async function () {
      const { weirdFlatTown, grid } = await loadFixture(deployWeirdFlatTownFixture);

      const land = [
        [0, 1], [0, 0], [0, 2]
      ];

      await expect(weirdFlatTown.mintLand(3, land, {value: ethers.parseEther("0.009")})).to.emit(weirdFlatTown, "MintedLand");
    });

    //3000000000000000

  });

  describe("DevelopLand", function () {

    it("Should revert with NotLandOwner", async function () {
      const { weirdFlatTown, otherAccount, owner } = await loadFixture(deployWeirdFlatTownFixture);

      const land = [
        [0, 1], [0, 0], [0, 2]
      ];

      await weirdFlatTown.connect(otherAccount).mintLand(3, land, {value: ethers.parseEther("0.009")});

      await expect(weirdFlatTown.connect(owner).developLand(1, 16)).to.be.revertedWithCustomError(weirdFlatTown, "NotLandOwner");
    });

    it("Should revert with EstateNotExists", async function () {
      const { weirdFlatTown, otherAccount } = await loadFixture(deployWeirdFlatTownFixture);

      const land = [
        [0, 1], [0, 0], [0, 2]
      ];

      await weirdFlatTown.connect(otherAccount).mintLand(3, land, {value: ethers.parseEther("0.009")});

      await expect(weirdFlatTown.connect(otherAccount).developLand(1, 16)).to.be.revertedWithCustomError(weirdFlatTown, "EstateNotExists");
    });

    
    it("Should revert with WrongPrice", async function () {
      const { weirdFlatTown, otherAccount } = await loadFixture(deployWeirdFlatTownFixture);

      const land = [
        [0, 1], [0, 0], [0, 2]
      ];

      await weirdFlatTown.connect(otherAccount).mintLand(3, land, {value: ethers.parseEther("0.009")});

      await expect(weirdFlatTown.connect(otherAccount).developLand(1, 12, {value: ethers.parseEther("0.002")})).to.be.revertedWithCustomError(weirdFlatTown, "WrongPrice");
    });

    it("Should develop land and emit DevelopedLand ", async function () {
      const { weirdFlatTown, otherAccount } = await loadFixture(deployWeirdFlatTownFixture);

      const land = [
        [0, 1], [0, 0], [0, 2]
      ];

      await weirdFlatTown.connect(otherAccount).mintLand(3, land, {value: ethers.parseEther("0.009")});

      await expect(weirdFlatTown.connect(otherAccount).developLand(1, 12, {value: ethers.parseEther("1")})).to.emit(weirdFlatTown, "DevelopedLand");
    });
  });

  describe("UpdateLandInfo", function () {

    it("Should revert with NotLandOwner", async function () {
      const { weirdFlatTown, otherAccount, owner } = await loadFixture(deployWeirdFlatTownFixture);

      const land = [
        [0, 1], [0, 0], [0, 2]
      ];

      await weirdFlatTown.connect(otherAccount).mintLand(3, land, {value: ethers.parseEther("0.009")});

      await expect(weirdFlatTown.connect(owner).updateLandInfo(1, "info", "info info info info info")).to.be.revertedWithCustomError(weirdFlatTown, "NotLandOwner");
    });

    it("Should update landinfo and emit UpdatedLandInfo ", async function () {
      const { weirdFlatTown, otherAccount } = await loadFixture(deployWeirdFlatTownFixture);

      const land = [
        [0, 1], [0, 0], [0, 2]
      ];

      await weirdFlatTown.connect(otherAccount).mintLand(3, land, {value: ethers.parseEther("0.009")});

      await expect(weirdFlatTown.connect(otherAccount).updateLandInfo(1, "info", "info info info info info")).to.emit(weirdFlatTown, "UpdatedLandInfo");
    });
  });

});
