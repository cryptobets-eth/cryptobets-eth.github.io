import React, { useContext } from 'react';
import { BookmakerContext } from '../context/BookmakerContext';
import { shortenAddress } from '../utils/shortenAddress';
import { ethers } from 'ethers';

const betCardStyles = "m-3 w-full flex flex-col justify-center blue-glassmorphism";

const UserBetCard = ({ id, player1, game, player1Bet, player1Stake, expectedWin, player2, player2Bet, player2Stake, isSettled, handleCancelBetOffer, handleVerifyResult, handleCashOut }) => {
    return (
        <div className={betCardStyles}>
            <div className="p-2 m-3 flex justify-between items-center text-white blue-glassmorphism">
                <p className="text-left">
                    {game.homeTeam} - {game.awayTeam}
                </p>
                <p className="text-right">
                    {new Date(Number(game.startTime._hex) * 1000).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric', year: 'numeric' })}
                </p>
            </div>
            <div className="sm:px-5 px-3 mb-1 flex justify-between items-center text-white">
                <p className="text-left">
                    player1: <br />{shortenAddress(player1)}
                </p>
                <p className="text-center">
                    player1Bet: <br />{player1Bet}
                </p>
                <p className="text-right">
                    player1Stake: <br />{player1Stake / (10 ** 18)} ETH
                </p>
            </div>
            <div className="sm:px-5 px-3 mb-1 flex justify-between items-center text-white">
                <p className="text-left">
                    player2: <br />{(player2 != ethers.constants.AddressZero) ? shortenAddress(player2) : "-"}
                </p>
                <p className="text-center">
                    player2Bet: <br />{(player2 != ethers.constants.AddressZero) ? player2Bet : "-"}
                </p>
                <p className="text-right">
                    player2Stake: <br />{(player2 != ethers.constants.AddressZero) ? player2Stake / (10 ** 18) + " ETH" : "-"}
                </p>
            </div>
            <div className="sm:px-5 px-3 mb-1 mt-2 flex justify-between items-center text-white">
                <p className="text-left"></p>
                <p className="text-center"></p>
                <p className="text-right">expectedWin: <br />{expectedWin / (10 ** 18)} ETH</p>
            </div>

            {/*<div>gameId: {shortenAddress(game.gameId)}</div>*/}
            <div className="p-2 m-3 flex justify-between items-center text-white">
                <div>
                    {player2 == ethers.constants.AddressZero
                        ? (isSettled
                            ? (
                                <p><strong>Status:</strong> canceled</p>
                            )
                            : (
                                <p><strong>Status:</strong> waiting for player2</p>
                            )
                        )
                        : (isSettled
                            ? <p><strong>Status:</strong> cashout settled</p>
                            : (game.statusId == 8
                                ? (
                                    <p><strong>Status:</strong>  winner has not claimed cashout</p>
                                )
                                : (
                                    <p><strong>Status:</strong>  waiting for game result</p>
                                )
                            )
                        )
                    }
                </div>
                <div>
                    {!isSettled &&
                        (player2 == ethers.constants.AddressZero
                            ? (<button
                                className="text-white w-full m-2 border-[1px] p-2 border-[#3d4f7c] hover:text-black hover:border-[#8a0b6c] hover:bg-[#8a0b6c] bg-[#3d4f7d] rounded-full cursor-pointer"
                                onClick={(e) => (handleCancelBetOffer(e, id))}>
                                Cancel bet
                            </button>
                            )
                            : (game.statusId != 0
                                ? (
                                    <button
                                        className="text-white w-full m-2 border-[1px] p-2 border-[#3d4f7c] hover:text-black hover:border-[#8a0b6c] hover:bg-[#8a0b6c] bg-[#3d4f7d] rounded-full cursor-pointer"
                                        onClick={(e) => (handleCashOut(e, id))}>
                                        Cashout to winner
                                    </button>
                                )
                                : (
                                    <button
                                        className={(Number(game.startTime) + (3 * 60 * 60)) > (Date.now() / 1000)
                                            ? "text-[#101521] w-full m-2 border-[1px] p-2 border-[#293554] bg-[#293554] rounded-full cursor-pointer"
                                            : "text-white w-full m-2 border-[1px] p-2 border-[#3d4f7c] hover:text-black hover:border-[#8a0b6c] hover:bg-[#8a0b6c] bg-[#3d4f7d] rounded-full cursor-pointer"
                                        }
                                        disabled={(Number(game.startTime) + (3 * 60 * 60)) > (Date.now() / 1000)}
                                        onClick={(e) => (handleVerifyResult(e, id))}>
                                        Verify game
                                    </button>
                                )
                            )
                        )
                    }
                </div>
            </div>
        </div>
    );
}

const UserBets = () => {
    const { currentAccount, playerBets, handleCancelBetOffer, handleVerifyResult, handleCashOut } = useContext(BookmakerContext);

    //console.log("userBets", playerBets);
    //console.log("len:", playerBets.length);

    return (
        <div id="userBets" className='flex flex-col w-full justify-center items-center 2xl:px-20 gradient-bg-matches'>
            <h1 className='text-white text-3xl sm:text-5xl py-2 text-gradient text-center'>Your bets:</h1>
            {currentAccount
                ? (
                    <div className="p-4 m-3 sm:w-1/2 w-11/12 flex flex-col justify-center blue-glassmorphism">
                        {playerBets.length > 0
                            ? (
                                <div className="text-white">
                                    <p className="ml-8 mt-2 mb-1">Ongoing bets: </p>
                                    <div className="mb-6 flex flex-col flex-1 items-center justify-center w-full px-5">
                                        {playerBets.filter(bet => !bet.isSettled).map((bet, i) => (
                                            <UserBetCard key={i} {...bet} handleCancelBetOffer={handleCancelBetOffer} 
                                            handleVerifyResult={handleVerifyResult} handleCashOut={handleCashOut} />
                                        ))}
                                    </div>
                                    <p className="ml-8 mt-2 mb-1">Bets settled: </p>
                                    <div className="flex flex-col flex-1 items-center justify-center w-full px-5">
                                        {playerBets.filter(bet => bet.isSettled).map((bet, i) => (
                                            <UserBetCard key={i} {...bet} handleCancelBetOffer={handleCancelBetOffer} 
                                            handleVerifyResult={handleVerifyResult} handleCashOut={handleCashOut} />
                                        ))}
                                    </div>
                                </div>
                            )
                            : (
                                <h5 className='text-white text-center my-2'>no user bets found</h5>
                            )
                        }
                    </div>
                )
                : (
                    <h3 className='text-white text-center my-2'>connect your metamask account to see your bets</h3>
                )}
        </div>
    )
}

export default UserBets;