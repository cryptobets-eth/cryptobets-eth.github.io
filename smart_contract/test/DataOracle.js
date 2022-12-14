const { expect } = require("chai");
const { time, loadFixture, } = require("@nomicfoundation/hardhat-network-helpers");

describe("DataOracle", function () {
    async function deployDataOracleContractFixture() {
        const DataOracle = await ethers.getContractFactory("DataOracle");
        const dataOracle = await DataOracle.deploy();

        return dataOracle;
    }

    xdescribe("Request create games", function () {
        xit("", async function() {
        });
    });

    xdescribe("Request resolve games", function () {
        xit("", async function() {
        });
    });
})