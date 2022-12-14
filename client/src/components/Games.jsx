import React, { useContext, useState } from "react";
import { shortenAddress } from "../utils/shortenAddress";
import testGamesData from '../utils/testGamesData';
import { Loader } from ".";
import { BookmakerContext } from "../context/BookmakerContext";

const tableCellTailwind = "table-cell text-center border border-zinc-400";

const Input = ({ placeholder, name, type, value, handleBetOfferFormChange }) => (
    <input
        placeholder={placeholder}
        type={type}
        step="0.0001"
        value={value}
        onChange={(e) => handleBetOfferFormChange(e, name)}
        className="m-2 w-full rounded-md text-center p-2 outline-none text-white bg-[#273359] border-none text-sm white-glassmorphism"
    />
);

const SelectBet = ({ possibleBets, value, handleBetOfferFormChange }) => (
    <select
        value={value}
        defaultValue=""
        onChange={(e) => handleBetOfferFormChange(e, "bet")}
        className="w-full rounded-md text-center p-2 bg-[#273359]"
    >
        <option value="" disabled>bet</option>
        {possibleBets.map((bet) => (
            <option value={bet} key={bet}>{bet}</option>
        ))}
    </select>
);

const BetOffer = ({ id, player1, player1Bet, stake, expectedWin, handleJoinBetOffer, handleCancelBetOffer, currentAccount }) => {
    const index = [1, 0, 2].indexOf(player1Bet);
    const possibleBets = [1, 0, 2];
    possibleBets.splice(index, 1);

    const [bet2, setBet2] = useState(0);

    const handleBet2Change = (e, name) => {
        setBet2((prevState) => ({ ...prevState, [name]: e.target.value }));
    };

    return (
        <div className="table-row table-cell-glassmorphism">
            <div className={tableCellTailwind + " py-2"}>{shortenAddress(player1)}</div>
            <div className={tableCellTailwind}>{player1Bet}</div>
            <div className={tableCellTailwind}>{stake / (10 ** 18)} ETH</div>
            <div className={tableCellTailwind}>{expectedWin / (10 ** 18)} ETH</div>
            <div className={tableCellTailwind}> {player1.toLowerCase() == currentAccount
                ? (player1Bet)
                : (<SelectBet possibleBets={possibleBets} handleBetOfferFormChange={handleBet2Change} />)
            }
            </div>
            <div className={tableCellTailwind + " hover:bg-[#8a0b6c] hover:text-black cursor-pointer"}>
                {player1.toLowerCase() == currentAccount
                    ? (<button onClick={(e) => handleCancelBetOffer(e, id)}>
                        Cancel
                    </button>
                    )
                    : (
                        <button onClick={(e) => handleJoinBetOffer(e, id, bet2, ((expectedWin - stake) / (10 ** 18)).toString())}>
                            Join
                        </button>
                    )
                }
            </div>
        </div>
    )
}

const BetOfferForm = ({ gameId, isLoading, handleAddBetOffer }) => {
    const [betOfferForm, setbetOfferForm] = useState({ gameId: gameId, bet: '', stake: '', expectedWin: '' });

    const handleBetOfferFormChange = (e, name) => {
        setbetOfferForm((prevState) => ({ ...prevState, [name]: e.target.value }));
    };

    return (
        <div className="p-2 w-full flex flex-row justify-between items-center green-glassmorphism">
            <SelectBet possibleBets={[1, 0, 2]} handleBetOfferFormChange={handleBetOfferFormChange} />
            <Input placeholder="Stake" name="stake" type="number" handleBetOfferFormChange={handleBetOfferFormChange} />
            <Input placeholder="Expected win" name="expectedWin" type="number" handleBetOfferFormChange={handleBetOfferFormChange} />

            <button
                type="button"
                disabled={isLoading}
                onClick={(e) => {
                    if (isLoading) {
                        return;
                    }
                    handleAddBetOffer(e, betOfferForm);
                }}
                className="text-white w-full m-2 border-[1px] p-2 border-[#3d4f7c] hover:text-black hover:border-[#0e8f4e] hover:bg-[#14C16A] bg-[#3d4f7d] rounded-full cursor-pointer"
            >
                {isLoading ? "Sending..." : "Create offer"}
            </button>
        </div>
    )
}

const GameCard = ({ id, date, team1, team2, isLoading, handleAddBetOffer, handleJoinBetOffer, handleCancelBetOffer, avaibleBetOffers, currentAccount }) => {
    return (
        <div className="p-4 m-3 sm:w-1/2 w-11/12 flex flex-col justify-center blue-glassmorphism">
            <div className="py-2 sm:px-5 px-3 mb-1 flex justify-between items-center text-white pink-glassmorphism">
                <p className="text-lg font-bold">
                    {team1} - {team2}
                </p>
                <p className="text-right">
                    {new Date(date.toNumber() * 1000).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric', year: 'numeric' })}
                </p>
            </div>
            <div className="text-white">
                <p className="ml-2 mt-2 mb-1">Offers: </p>
                <div className="table w-full p-2 mb-1 flex flex-col justify-between text-white blue-glassmorphism">
                    <div className="table-header-group">
                        <div className="table-row ">
                            <div className="table-cell text-center">Player</div>
                            <div className="table-cell text-center">Bet</div>
                            <div className="table-cell text-center">Stake</div>
                            <div className="table-cell text-center">Expected win</div>
                            <div className="table-cell text-center">Your bet</div>
                            <div className="table-cell text-center">Action</div>
                        </div>
                    </div>
                    <div className="table-row-group flex sm:flex-row flex-col justify-between m-2">
                        {avaibleBetOffers.filter(bet => bet.gameId == id).map((betOffer, index) => (
                            <BetOffer key={index} {...betOffer}
                                handleJoinBetOffer={handleJoinBetOffer} handleCancelBetOffer={handleCancelBetOffer}
                                currentAccount={currentAccount}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className="text-white">
                <p className="ml-2 mt-2 mb-1">Make your offer:</p>
                <BetOfferForm gameId={id} isLoading={isLoading} handleAddBetOffer={handleAddBetOffer} />
            </div>
        </div>
    )
}

const Games = () => {
    const { currentAccount, isLoading, handleJoinBetOffer, handleAddBetOffer, handleCancelBetOffer, avaibleGames, avaibleBetOffers } = useContext(BookmakerContext);

    return (
        <div className="flex flex-col w-full pb-10 justify-center items-center gradient-bg-services">
            <h1 className='text-white text-3xl sm:text-5xl py-2 text-gradient text-center'>Available games:</h1>
            {currentAccount
                ? (
                    <div className="flex flex-col flex-1 items-center justify-center w-full px-5">
                        {avaibleGames.map((match, i) => (
                            <GameCard key={i} {...match}
                                betOffers={[]} isLoading={isLoading}
                                handleJoinBetOffer={handleJoinBetOffer} handleAddBetOffer={handleAddBetOffer} handleCancelBetOffer={handleCancelBetOffer}
                                avaibleBetOffers={avaibleBetOffers} currentAccount={currentAccount}
                            />
                        ))}
                    </div>
                )
                : (
                    <h3 className='text-white text-center my-2'>connect your metamask account to see avaible games</h3>
                )}

        </div>
    )
}

export default Games;