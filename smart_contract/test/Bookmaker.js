const { expect } = require("chai");
const { time, loadFixture, } = require("@nomicfoundation/hardhat-network-helpers");
const { smock } = require("@defi-wonderland/smock");
const { ethers } = require("hardhat");

describe("Bookmaker", function () {
    /** 
     * Fixture function
    */
    async function deployBookmakerContractFixture() {
        const Bookmaker = await smock.mock("Bookmaker");
        const bookmaker = await Bookmaker.deploy();

        return { bookmaker };
    }

    async function deployBookmakerContractWithGameMockFixture() {
        const [initiator, player1, player2] = await ethers.getSigners();
        const { bookmaker } = await loadFixture(deployBookmakerContractFixture);

        const testGameId = "0x9999999999999999999999999999999999999999999999999999999999999999";
        await bookmaker.setVariable('games',
            [{
                gameId: testGameId,
                startTime: 9999999999,
                homeTeam: "homeTestTeam",
                awayTeam: "awayTestTeam",
            }]);

        await bookmaker.setVariable('gameIdGame', {
            "0x9999999999999999999999999999999999999999999999999999999999999999": {
                gameId: testGameId,
                startTime: 9999999999,
                homeTeam: "homeTestTeam",
                awayTeam: "awayTestTeam",
            }
        });

        return { bookmaker, testGameId, player1, player2 };
    }

    async function deployBookmakerContractWithBetOfferFixture() {
        const { bookmaker, testGameId, player1 } = await loadFixture(deployBookmakerContractWithGameMockFixture);

        const player1Bet = 1;
        const stake = "0.27";
        const expectedWin = "2.7";
        await bookmaker.connect(player1).createBetOffer(testGameId, player1Bet, ethers.utils.parseEther(expectedWin), {
            value: ethers.utils.parseEther(stake)
        });

        return { bookmaker, player1, stake };
    }

    /**
     * Unit tests
     */
    describe("Deployment", function () {
        it("should return empty openBetOffers array", async function () {
            const { bookmaker } = await loadFixture(deployBookmakerContractFixture);

            expect(await bookmaker.getOpenBetOffers()).to.deep.equal([]);
        });

        it("should return empty games array", async function () {
            const { bookmaker } = await loadFixture(deployBookmakerContractFixture);

            expect(await bookmaker.getAllGames()).to.deep.equal([]);
        })

        it("should return empty sender bets array", async function () {
            const { bookmaker } = await loadFixture(deployBookmakerContractFixture);

            expect(await bookmaker.getSenderBets()).to.deep.equal([]);
        })

        it("should return zero eth contract balance", async function () {
            const { bookmaker } = await loadFixture(deployBookmakerContractFixture);

            expect(await ethers.provider.getBalance(bookmaker.address)).to.equal(0);
        })
    });

    describe("Returning avaible matches", function () {
        it("should return mocked avaible match", async function () {
            const { bookmaker } = await loadFixture(deployBookmakerContractWithGameMockFixture);

            expect(JSON.stringify(await bookmaker.getAllGames())).to.deep.equal(JSON.stringify(
                [["0x9999999999999999999999999999999999999999999999999999999999999999",
                    {
                        "type": "BigNumber",
                        "hex": "0x02540be3ff"
                    },
                    "homeTestTeam",
                    "awayTestTeam"]]
            ));
        });
    });

    describe("Creating new bet offer", function () {
        it("contract eth amount should increase by stake of new bet offer", async function () {
            const { bookmaker, stake } = await loadFixture(deployBookmakerContractWithBetOfferFixture); 

            expect(await ethers.provider.getBalance(bookmaker.address)).to.equal(ethers.utils.parseEther(stake));
        });

        it("new offer should be returned in openBetOffers array", async function () {
            const { bookmaker, player1 } = await loadFixture(deployBookmakerContractWithBetOfferFixture); 

            expect(JSON.stringify(await bookmaker.getOpenBetOffers())).to.deep.equal(JSON.stringify([
                [   
                    //betId
                    { "type": "BigNumber", "hex": "0x00" },
                    //gameId
                    "0x9999999999999999999999999999999999999999999999999999999999999999",
                    //player1
                    player1.address,
                    //player1Bet
                    1,
                    //stake
                    { "type": "BigNumber", "hex": "0x03bf3b91c95b0000" },
                    //expectedWin
                    { "type": "BigNumber", "hex": "0x257853b1dd8e0000" },
                    //player2
                    "0x0000000000000000000000000000000000000000",
                    //player2Bet
                    0,
                    false
                ]
            ]));
        });

        it("should increase openBetsCounter to 1", async function() {
            const { bookmaker } = await loadFixture(deployBookmakerContractWithBetOfferFixture);

            expect(await bookmaker.openBetsCounter()).to.equal(1);
        });

        it("should emit NewBetOffer() event", async function () {
            const { bookmaker } = await loadFixture(deployBookmakerContractWithBetOfferFixture);

            expect(await bookmaker.getOpenBetOffers()).to.emit(bookmaker, "NewBetOffer");
        });

        it("should revert with _invalidBetError", async function () {
            const { bookmaker, testGameId, player1 } = await loadFixture(deployBookmakerContractWithGameMockFixture);
            const player1Bet = 27;
            const stake = "0.27";
            const expectedWin = "2.7";
            const _invalidBetError = "Invalid bet value (should be 1, 0 or 2)";

            await expect(
                bookmaker.connect(player1).createBetOffer(testGameId, player1Bet, ethers.utils.parseEther(expectedWin), {
                    value: ethers.utils.parseEther(stake)
                })
            ).to.be.revertedWith(_invalidBetError);
        });

        xit("should revert with _deadlineError", async function () {
            const { bookmaker } = await loadFixture(deployBookmakerContractWithGameMockFixture);

            const _deadlineError = "Start time of game deadline passed";

        });

        it("should revert with _stakeError", async function () {
            const { bookmaker, testGameId, player1 } = await loadFixture(deployBookmakerContractWithGameMockFixture);
            const player1Bet = 1;
            const expectedWin = "2.7";
            const _stakeError = "Stake = 0 is forbidden";

            await expect(
                bookmaker.connect(player1).createBetOffer(testGameId, player1Bet, ethers.utils.parseEther(expectedWin))
            ).to.be.revertedWith(_stakeError);
        });

        it("should revert with _expectedWinError (stake = expectedWin case)", async function () {            
            const { bookmaker, testGameId, player1 } = await loadFixture(deployBookmakerContractWithGameMockFixture);
            const player1Bet = 1;
            const stake = "0.27";
            const expectedWin = "0.27";
            const _expectedWinError = "Expected win must be greater than stake";

            await expect(
                bookmaker.connect(player1).createBetOffer(testGameId, player1Bet, ethers.utils.parseEther(expectedWin), {
                    value: ethers.utils.parseEther(stake)
                })
            ).to.be.revertedWith(_expectedWinError);
        });

        it("should revert with _expectedWinError (stake > expectedWin case)", async function () {            
            const { bookmaker, testGameId, player1 } = await loadFixture(deployBookmakerContractWithGameMockFixture);
            const player1Bet = 1;
            const stake = "2.7";
            const expectedWin = "0.27";
            const _expectedWinError = "Expected win must be greater than stake";

            await expect(
                bookmaker.connect(player1).createBetOffer(testGameId, player1Bet, ethers.utils.parseEther(expectedWin), {
                    value: ethers.utils.parseEther(stake)
                })
            ).to.be.revertedWith(_expectedWinError);
        });
    });

    xdescribe("Joining to bet offer", function () {
        xit("contract eth amount should increase by player2 stake", async function () {
            const { bookmaker } = await loadFixture(deployBookmakerContractFixture);

        });

        xit("accepted bet should be return in playerBets array for player1", async function () {
            const { bookmaker } = await loadFixture(deployBookmakerContractFixture);

        });

        xit("accepted bet should be return in playerBets array for player2", async function () {
            const { bookmaker } = await loadFixture(deployBookmakerContractFixture);

        });

        xit("accepted bet should not be return in playerBets array for player3", async function () {
            const { bookmaker } = await loadFixture(deployBookmakerContractFixture);

        });

        xit("should increase addressBetsCount to 1 for player1", async function() {
            const { bookmaker } = await loadFixture(deployBookmakerContractWithBetOfferFixture);

            expect(await bookmaker.openBetsCounter()).to.equal(0);
        });

        xit("should increase addressBetsCount to 1 for player2", async function() {
            const { bookmaker } = await loadFixture(deployBookmakerContractWithBetOfferFixture);

            expect(await bookmaker.addressBetsCount()).to.equal(0);
        });

        xit("should decrease openBetsCounter to 0", async function() {
            const { bookmaker } = await loadFixture(deployBookmakerContractWithBetOfferFixture);

            expect(await bookmaker.addressBetsCount()).to.equal(0);
        });

        xit("should emit BetOfferAccepted() event", async function () {
            const { bookmaker } = await loadFixture(deployBookmakerContractWithBetOfferFixture);

            expect(await bookmaker.getOpenBetOffers()).to.emit(bookmaker, "BetOfferAccepted");
        });

        xit("should revert with _betSettledError", async function () {
            const { bookmaker } = await loadFixture(deployBookmakerContractWithBetOfferFixture);

        });

        xit("should revert with _invalidBetError", async function () {
            const { bookmaker } = await loadFixture(deployBookmakerContractWithBetOfferFixture);

        });

        xit("should revert with _player2Error", async function () {
            const { bookmaker } = await loadFixture(deployBookmakerContractWithBetOfferFixture);

        });

        xit("should revert with _deadlineError", async function () {
            const { bookmaker } = await loadFixture(deployBookmakerContractWithBetOfferFixture);

        });

        xit("should revert with _ownOfferError", async function () {
            const { bookmaker } = await loadFixture(deployBookmakerContractWithBetOfferFixture);

        });

        xit("should revert with _sameBetError", async function () {
            const { bookmaker } = await loadFixture(deployBookmakerContractWithBetOfferFixture);

        });

        xit("should revert with _expectedWinError2", async function () {
            const { bookmaker } = await loadFixture(deployBookmakerContractWithBetOfferFixture);

        });
    });

    xdescribe("Canceling bet offer", function () {
        xit("contract eth amount should decrease by stake from canceling bet offer", async function () {
            const { bookmaker, stake } = await loadFixture(deployBookmakerContractWithBetOfferFixture); 

            expect(await ethers.provider.getBalance(bookmaker.address)).to.equal(ethers.utils.parseEther(stake));
        });

        xit("player1 should receive stake from canceling bet offer", async function () {
            const { bookmaker, stake } = await loadFixture(deployBookmakerContractWithBetOfferFixture); 

            expect(await ethers.provider.getBalance(bookmaker.address)).to.equal(ethers.utils.parseEther(stake));
        });

        xit("should revert with _betSettledError", async function () {
            const { bookmaker } = await loadFixture(deployBookmakerContractWithBetOfferFixture);

        });

        xit("should revert with _player2Error", async function () {
            const { bookmaker } = await loadFixture(deployBookmakerContractWithBetOfferFixture);

        });

        xit("should revert with _cancelingAddressError", async function () {
            const { bookmaker } = await loadFixture(deployBookmakerContractWithBetOfferFixture);

        });

        xit("should decrease _openBetsCounter to 0", async function() {
            const { bookmaker } = await loadFixture(deployBookmakerContractWithBetOfferFixture);

            expect(await bookmaker.addressBetsCount()).to.equal(0);
        });
    });

    xdescribe("Verify result", function () {
        xit("", async function() {
        });
    });

    xdescribe("Cashout win", function () {
        xit("", async function() {
        });
    });
})