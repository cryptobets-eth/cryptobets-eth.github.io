//SPDX-License-Identifier: UNLICENSED
/**
 * games oracle:
 * https://market.link/nodes/TheRundown/integrations
 * Ethereum Goerli Testnet
 * LINK Token Address: 0x326C977E6efc84E512bB9C30f76E30c160eD06FB
 * Operator Address: 0xB9756312523826A566e222a34793E414A81c88E1
 * Payment Amount: 0.1 LINK
 * JobID: 6b09d37b284f4655bb510f494edc111f
 * JobID as bytes32: 0x3662303964333762323834663436353562623531306634393465646331313166
 *
 * Supported `sportId`
 * --------------------
 * NCAA Men's Football: 1
 * NFL: 2
 * MLB: 3
 * NBA: 4
 * NCAA Men's Basketball: 5
 * NHL: 6
 * MMA: 7
 * WNBA: 8
 * MLS: 10
 * EPL: 11
 * Ligue 1: 12
 * Bundesliga: 13
 * La Liga: 14
 * Serie A: 15
 * UEFA Champions League: 16
 */

/**
 * Supported `market`
 * --------------------
 * create : Create Market
 * resolve : Resolve Market
 */

/**
 * Supported `statusIds`
 * --------------------
 * 1 : STATUS_CANCELED
 * 2 : STATUS_DELAYED
 * 3 : STATUS_END_OF_FIGHT
 * 4 : STATUS_END_OF_ROUND
 * 5 : STATUS_END_PERIOD
 * 6 : STATUS_FIGHTERS_INTRODUCTION
 * 7 : STATUS_FIGHTERS_WALKING
 * 8 : STATUS_FINAL
 * 9 : STATUS_FINAL_PEN
 * 10 : STATUS_FIRST_HALF
 * 11 : STATUS_FULL_TIME
 * 12 : STATUS_HALFTIME
 * 13 : STATUS_IN_PROGRESS
 * 14 : STATUS_IN_PROGRESS_2
 * 15 : STATUS_POSTPONED
 * 16 : STATUS_PRE_FIGHT
 * 17 : STATUS_RAIN_DELAY
 * 18 : STATUS_SCHEDULED
 * 19 : STATUS_SECOND_HALF
 * 20 : STATUS_TBD
 * 21 : STATUS_UNCONTESTED
 * 22 : STATUS_ABANDONED
 * 23 : STATUS_END_OF_EXTRATIME
 * 24 : STATUS_END_OF_REGULATION
 * 25 : STATUS_FORFEIT
 * 26 : STATUS_HALFTIME_ET
 * 27 : STATUS_OVERTIME
 * 28 : STATUS_SHOOTOUT
 */

pragma solidity >=0.4.16 <0.9.0;

import "./@chainlink/v0.8/ChainlinkClient.sol";

contract DataOracle is ChainlinkClient {
    using Chainlink for Chainlink.Request;
    using CBORChainlink for BufferChainlink.buffer;

    struct GameCreate {
        bytes32 gameId;
        uint256 startTime;
        string homeTeam;
        string awayTeam;
    }

    struct GameResolve {
        bytes32 gameId;
        uint8 homeScore;
        uint8 awayScore;
        uint8 statusId;
    }

    bytes32 constant private jobId = 0x3662303964333762323834663436353562623531306634393465646331313166;
    uint256 constant private fee = (1 * LINK_DIVISIBILITY) / 10; //0.1 LINK

    GameCreate[] public games;
    mapping(bytes32 => GameCreate) public gameIdGame;
    mapping(bytes32 => GameResolve) public gameIdResult;

    constructor() {
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        setChainlinkOracle(0xB9756312523826A566e222a34793E414A81c88E1);
    }

    /* ========== EXTERNAL FUNCTIONS ========== */

    function cancelRequest(
        bytes32 _requestId,
        uint256 _payment,
        bytes4 _callbackFunctionId,
        uint256 _expiration
    ) external {
        cancelChainlinkRequest(
            _requestId,
            _payment,
            _callbackFunctionId,
            _expiration
        );
    }

    /**
     * @notice Function called by oracle node to save matches date on blockchain
     **/
    function createGames(bytes32 _requestId, bytes[] memory _requestedGames)
        external
        recordChainlinkFulfillment(_requestId)
    {
        for (uint256 i = 0; i < _requestedGames.length; i++) {
            GameCreate memory game = abi.decode(_requestedGames[i], (GameCreate));
            // check if given game is already on blockchain
            if(gameIdGame[game.gameId].gameId != game.gameId){
                games.push(game);
                gameIdGame[game.gameId] = game;
            }            
        }
    }

    /**
     * @notice Function called by oracle node to save match result on blockchain
     **/
    function resolveGame(bytes32 _requestId, bytes[] memory _requestedGames)
        external
        recordChainlinkFulfillment(_requestId)
    {
        GameResolve memory game = abi.decode(_requestedGames[0], (GameResolve));

        gameIdResult[game.gameId] = game;
    }

    /**
     * @notice Returns an array of game data for a given market, sport ID, and date.
     * @dev Result format is array of either encoded GameCreate tuples or encoded GameResolve tuples.
     * @param _sportId the ID of the sport to be queried (see supported sportId).
     * @param _date the date for the games to be queried (format in epoch).
     */
    function requestGames(uint256 _sportId, uint256 _date)
        external
        returns (bytes32)
    {
        uint256 payment = 100000000000000000; //0.1 LINK
        Chainlink.Request memory req = buildOperatorRequest(
            jobId,
            this.createGames.selector
        );

        req.addUint("date", _date);
        req.add("market", "create");
        req.addUint("sportId", _sportId);

        return sendOperatorRequest(req, payment);
    }

    function requestResolveGames(uint256 _sportId, uint256 _date, bytes32[] memory _gamesId) public {
        uint256 payment = 100000000000000000; //0.1 LINK
        Chainlink.Request memory req = buildOperatorRequest(
            jobId,
            this.resolveGame.selector
        );

        req.addUint("date", _date);
        req.add("market", "resolve");
        req.addUint("sportId", _sportId);
        req.addStringArray("gameIds", _bytes32ArrayToString(_gamesId));

        sendOperatorRequest(req, payment);
    }

    /* ========== PRIVATE PURE HELPER FUNCTIONS ========== */

    function _bytes32ArrayToString(bytes32[] memory _bytes32Array)
        private
        pure
        returns (string[] memory)
    {
        string[] memory gameIds = new string[](_bytes32Array.length);
        for (uint256 i = 0; i < _bytes32Array.length; i++) {
            gameIds[i] = _bytes32ToString(_bytes32Array[i]);
        }
        return gameIds;
    }

    function _bytes32ToString(bytes32 _bytes32)
        private
        pure
        returns (string memory)
    {
        bytes memory bytesArray = new bytes(32);
        for (uint256 i; i < 32; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }
}
