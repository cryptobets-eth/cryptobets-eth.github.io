//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import "./DataOracle.sol";
import "./BookmakerErrors.sol";

contract Bookmaker is DataOracle {
    struct BetOffer {
        uint256 id;
        bytes32 gameId;
        address player1;
        uint16 player1Bet; //0 - draw, 1- team1, 2 - team2
        uint256 stake;
        uint256 expectedWin;
        address player2;
        uint16 player2Bet;
        bool isSettled;
    }

    
    uint256 public openBetsCounter = 0; //active bet offers waiting for player2
    mapping(address => uint256) public addressBetsCount; //number of bets by user address
    BetOffer[] public betOffers;

    modifier notSettled(uint256 id) {
        require(!betOffers[id].isSettled, _betSettledError);
        _;
    }

    modifier validBet(uint16 bet) {
        require(bet == 1 || bet == 0 || bet == 2, _invalidBetError);
        _;
    }

    modifier noPlayer2(uint256 id) {
        require(betOffers[id].player2 == address(0), _player2Error);
        _;
    }

    modifier gameDeadline(bytes32 id) {
        GameCreate memory game = gameIdGame[id];
        require(game.startTime > block.timestamp, _deadlineError);
        _;
    }

    function getAllGames() external view returns (GameCreate[] memory) {
        return games;
    }

    function getGameById(bytes32 id) external view returns (GameCreate memory) {
        return gameIdGame[id];
    }

    function getOpenBetOffers() external view returns (BetOffer[] memory) {
        BetOffer[] memory openBets = new BetOffer[](openBetsCounter);
        uint256 counter = 0;

        for (uint256 i = 0; i < betOffers.length; i++) {
            if (
                !betOffers[i].isSettled && betOffers[i].player2 == address(0)
            ) {
                openBets[counter] = betOffers[i];
                counter++;
            }
        }
        return openBets;
    }

    function getSenderBets() external view returns (BetOffer[] memory) {
        BetOffer[] memory acceptedBets = new BetOffer[](
            addressBetsCount[msg.sender]
        );
        uint256 counter = 0;

        for (uint256 i = 0; i < betOffers.length; i++) {
            if (
                betOffers[i].player1 == msg.sender ||
                betOffers[i].player2 == msg.sender
            ) {
                acceptedBets[counter] = betOffers[i];
                counter++;
            }
        }
        return acceptedBets;
    }

    function createBetOffer(
        bytes32 gameId,
        uint16 bet,
        uint256 expectedWin
    ) external payable validBet(bet) gameDeadline(gameId) {
        require(msg.value > 0, _stakeError);
        require(msg.value < expectedWin, _expectedWinError);
        //todo: check if given gameId exist in games or gameIdGame

        betOffers.push(
            BetOffer(betOffers.length, gameId, msg.sender, bet, msg.value,
                     expectedWin, address(0), 0, false)
        );
        openBetsCounter++;
        addressBetsCount[msg.sender]++;
    }

    function joinBetOffer(uint256 betId, uint16 bet)
        external
        payable
        notSettled(betId)
        validBet(bet)
        noPlayer2(betId)
        gameDeadline(betOffers[betId].gameId)
    {
        require(betOffers[betId].player1 != msg.sender, _ownOfferError);
        require(betOffers[betId].player1Bet != bet, _sameBetError);
        require(msg.value == (betOffers[betId].expectedWin - betOffers[betId].stake),
            _expectedWinError2); 

        betOffers[betId].player2 = msg.sender;
        betOffers[betId].player2Bet = bet;

        addressBetsCount[msg.sender]++;
        openBetsCounter--;
    }

    function cancelBetOffer(uint256 betId)
        external
        notSettled(betId)
        noPlayer2(betId)
    {
        require(
            msg.sender == betOffers[betId].player1,
            _cancelingAddressError
        );

        payable(msg.sender).transfer(betOffers[betId].stake); //refund stake to player
        betOffers[betId].isSettled = true;
        openBetsCounter--;
    }

    function verifyResult(uint256 betId, uint256 sportId) external notSettled(betId) {
        GameCreate memory game = gameIdGame[betOffers[betId].gameId];
        require(game.startTime < (block.timestamp - 3 hours), _gameEndedError);
        require(gameIdResult[game.gameId].statusId != 8, _gameVerified);

        uint256 date = game.startTime;
        bytes32[] memory gamesId = new bytes32[](1);
        gamesId[0] = game.gameId;
        requestResolveGames(sportId, date, gamesId);
    }

    function cashOutWin(uint256 betId) external notSettled(betId) {
        BetOffer memory betOffer = betOffers[betId];
        GameCreate memory game = gameIdGame[betOffer.gameId];
        require(gameIdResult[game.gameId].statusId != 0, _gameNotVerified);

        if (gameIdResult[game.gameId].statusId == 8) {
            address player1 = betOffer.player1;
            address player2 = betOffer.player2;
            address winner = address(0);
            uint16 player1Bet = betOffer.player1Bet;
            uint16 player2Bet = betOffer.player2Bet;
            uint256 homeScore = gameIdResult[game.gameId].homeScore;
            uint256 awayScore = gameIdResult[game.gameId].awayScore;

            if (homeScore > awayScore && player1Bet == 1) {
                winner = player1;
            } else if (homeScore > awayScore && player2Bet == 1) {
                winner = player2;
            } else if (homeScore < awayScore && player1Bet == 2) {
                winner = player1;
            } else if (homeScore < awayScore && player2Bet == 2) {
                winner = player2;
            } else if (player1Bet == 0) {
                winner = player1;
            } else if (player2Bet == 0) {
                winner = player2;
            }

            if (winner != address(0)) {
                //if someone win bet
                payable(winner).transfer(betOffer.expectedWin); //send win to winner
                betOffer.isSettled = true;
            }
        } else if (gameIdResult[game.gameId].statusId == 1) {
            //if game status is canceled
            payable(betOffer.player1).transfer(betOffer.stake);
            payable(betOffer.player2).transfer((betOffer.expectedWin - betOffer.stake));
            betOffer.isSettled = true; 
        }
    }
}
