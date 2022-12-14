import React, { useEffect, useState } from "react";
import { contractAddress, contractAbi } from "../utils/constants";
import { ethers } from 'ethers';

export const BookmakerContext = React.createContext();

const { ethereum } = window;

const getBookmakerContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const bookmakerContract = new ethers.Contract(contractAddress, contractAbi, signer);

    return bookmakerContract;
}

export const BookmakerProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [avaibleGames, setAvaibleGames] = useState([]);
    const [avaibleBetOffers, setAvaibleBetOffers] = useState([]);
    const [playerBets, setPlayerBets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddBetOffer = async (e, betOfferForm) => {
        e.preventDefault();
        console.log(betOfferForm);

        const { gameId, bet, stake, expectedWin } = betOfferForm;

        if (!bet || !stake || !expectedWin || typeof (gameId) == 'undefined') return;

        try {
            if (!ethereum) return alert("Please install metamask to continue...");
            const bookmakerContract = getBookmakerContract();
            setIsLoading(true);
            //const gasEstimated = await bookmakerContract.estimateGas.createBetOffer(gameId, bet, ethers.utils.parseEther(expectedWin));
            const transactionHash = await bookmakerContract.createBetOffer(gameId, bet, ethers.utils.parseEther(expectedWin), { gasLimit: 500000, value: ethers.utils.parseEther(stake) });

            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            getAvaibleBetOffers();
            getBetsByPlayer();

        } catch (error) {
            console.log(error);
        }
    };

    const handleJoinBetOffer = async (e, betId, bet, stake) => {
        e.preventDefault();

        if (typeof (betId) == 'undefined' || typeof (bet) == 'undefined' || typeof (stake) == 'undefined') return;

        try {
            if (!ethereum) return alert("Please install metamask to continue...");
            const bookmakerContract = getBookmakerContract();
            setIsLoading(true);
            //const gasEstimated = await bookmakerContract.estimateGas.createBetOffer(gameId, bet, ethers.utils.parseEther(expectedWin));
            const transactionHash = await bookmakerContract.joinBetOffer(betId, bet.bet, { gasLimit: 500000, value: ethers.utils.parseEther(stake) });

            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            getAvaibleBetOffers();
            getBetsByPlayer();
            console.log("Join to bet offer with id: ", id, "(account: ", currentAccount, ")");
        } catch (error) {
            console.log(error);
        }
    };

    const handleCancelBetOffer = async (e, betId) => {
        e.preventDefault();

        if (typeof (betId) == 'undefined') return;

        try {
            if (!ethereum) return alert("Please install metamask to continue...");
            const bookmakerContract = getBookmakerContract();
            setIsLoading(true);
            //const gasEstimated = await bookmakerContract.estimateGas.createBetOffer(gameId, bet, ethers.utils.parseEther(expectedWin));
            const transactionHash = await bookmakerContract.cancelBetOffer(betId, { gasLimit: 500000 });

            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            getAvaibleBetOffers();
            getBetsByPlayer();
            console.log("Bet offer with id: ", betId, " was canceled (account: ", currentAccount, ")");
        } catch (error) {
            console.log(error);
        }
    };

    const handleVerifyResult = async (e, betId) => {
        e.preventDefault();

        if (typeof (betId) == 'undefined') return;

        try {
            if (!ethereum) return alert("Please install metamask to continue...");
            const bookmakerContract = getBookmakerContract();
            setIsLoading(true);
            //const gasEstimated = await bookmakerContract.estimateGas.createBetOffer(gameId, bet, ethers.utils.parseEther(expectedWin));
            const sportId = 4; //NBA
            const transactionHash = await bookmakerContract.verifyResult(betId, sportId, { gasLimit: 500000 });

            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            getAvaibleBetOffers();
            getBetsByPlayer();
            console.log("Game result from bet with id: ", betId, " requested to Oracle. Wait a moment for response");
        } catch (error) {
            console.log(error);
        }
    }

    const handleCashOut = async (e, betId) => {
        e.preventDefault();

        if (typeof (betId) == 'undefined') return;

        try {
            if (!ethereum) return alert("Please install metamask to continue...");
            const bookmakerContract = getBookmakerContract();
            setIsLoading(true);
            //const gasEstimated = await bookmakerContract.estimateGas.createBetOffer(gameId, bet, ethers.utils.parseEther(expectedWin));
            const transactionHash = await bookmakerContract.cashOutWin(betId, { gasLimit: 500000 });

            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            getAvaibleBetOffers();
            getBetsByPlayer();
            console.log("Win from bet with id: ", betId, " was cashout to winner");
        } catch (error) {
            console.log(error);
        }
    }

    const getAvaibleGames = async () => {
        try {
            if (!ethereum) return alert("Please install metamask to continue...");
            const bookmakerContract = getBookmakerContract();
            const allGames = await bookmakerContract.getAllGames();
            const structuredAvaibleGames = allGames.filter(game => game.startTime > Math.round(Date.now() / 1000)).map((game) => ({
                id: game.gameId,
                date: game.startTime,
                team1: game.homeTeam,
                team2: game.awayTeam
            }))

            console.log('avaibleGames', structuredAvaibleGames);
            setAvaibleGames(structuredAvaibleGames);

        } catch (error) {
            console.log(error);
        }
    };

    const getAvaibleBetOffers = async () => {
        try {
            if (!ethereum) return alert("Please install metamask to interact with blockchain...");
            const bookmakerContract = getBookmakerContract();
            const avaibleBetOffers = await bookmakerContract.getOpenBetOffers();
            const structuredBetOffers = avaibleBetOffers.map((betOffer) => ({
                id: Number(betOffer.id._hex),
                player1: betOffer.player1,
                gameId: betOffer.gameId,
                player1Bet: betOffer.player1Bet,
                stake: Number(betOffer.stake._hex),
                expectedWin: Number(betOffer.expectedWin._hex)
            }));
            console.log("openBetOffers", structuredBetOffers);

            setAvaibleBetOffers(structuredBetOffers);
        } catch (error) {
            console.log(error);
        }
    }

    const getBetsByPlayer = async () => {
        try {
            if (!ethereum) return alert("Please install metamask to interact with blockchain...");
            const bookmakerContract = getBookmakerContract();
            const playerBets = await bookmakerContract.getSenderBets();

            const structuredPlayerBets = await Promise.all(playerBets.map(async (bet) => {
                const game = await bookmakerContract.getGameById(bet.gameId);
                const gameResult = await bookmakerContract.gameIdResult(bet.gameId);

                return ({
                    id: Number(bet.id._hex),
                    player1: bet.player1,
                    game:
                    {
                        gameId: bet.gameId,
                        startTime: game.startTime,
                        homeTeam: game.homeTeam,
                        awayTeam: game.awayTeam,
                        statusId: gameResult.statusId
                    },
                    player1Bet: bet.player1Bet,
                    player1Stake: Number(bet.stake._hex),
                    expectedWin: Number(bet.expectedWin._hex),
                    player2: bet.player2,
                    player2Bet: bet.player2Bet,
                    player2Stake: (Number(bet.expectedWin._hex) - Number(bet.stake._hex)),
                    isSettled: bet.isSettled
                })
            }));
            console.log("playerBets", structuredPlayerBets);

            setPlayerBets(structuredPlayerBets);
        } catch (error) {
            console.log(error);
        }
    }

    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) return alert("Please install metamask to continue...");

            const accounts = await ethereum.request({ method: 'eth_accounts' });

            if (accounts.length) {
                console.log("accounts", accounts);
                setCurrentAccount(accounts[0]);
                getAvaibleGames();
                getAvaibleBetOffers();
                getBetsByPlayer();
            } else {
                console.log('No accounts found');
            }

        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object")
        }
    }

    const connectWallet = async () => {
        try {
            if (!ethereum) return alert("Please install metamask to continue...");

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

            setCurrentAccount(accounts[0]);
            window.location.reload();
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object")
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    return (
        <BookmakerContext.Provider value={{
            connectWallet, handleAddBetOffer, handleJoinBetOffer, handleCancelBetOffer, handleVerifyResult, handleCashOut,
            currentAccount, isLoading, avaibleGames, avaibleBetOffers, playerBets
        }}>
            {children}
        </BookmakerContext.Provider>
    )
}