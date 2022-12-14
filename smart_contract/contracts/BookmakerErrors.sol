//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

string constant _betSettledError = "This bet has already been settled";
string constant _cancelingAddressError = "Bet offer initiator address are different that function caller";
string constant _deadlineError = "Start time of game deadline passed";
string constant _expectedWinError = "Expected win must be greater than stake";
string constant _expectedWinError2 = "Wrong stake value to meet expected win requirement";
string constant _gameEndedError = "3 hours after game start do not pass yet";
string constant _gameNotVerified = "You have to call verify game first";
string constant _gameVerified = "This game is already verified";
string constant _invalidBetError = "Invalid bet value (should be 1, 0 or 2)";
string constant _ownOfferError = "Cannot join to own offer";
string constant _player2Error = "There is already player2 for these bet";
string constant _sameBetError = "Cannot bet same result like player1";
string constant _stakeError = "Stake = 0 is forbidden";
