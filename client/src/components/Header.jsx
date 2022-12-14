import { useContext } from 'react';
import { BookmakerContext } from '../context/BookmakerContext';

import { shortenAddress } from '../utils/shortenAddress';

const Header = () => {
    const { currentAccount, connectWallet } = useContext(BookmakerContext);

    return (
        <header className='w-full flex md:justify-center justify-between items-center py-5'>
            <div className='md:flex-[0.5] flex-initial justify-center items-center px-10'>
                <a href="" className="logo-text">CryptoBets</a>
            </div>
            <div className='text-white md:flex list-none flex-row justify-center items-center flex-initial'>

                {currentAccount
                    ? (
                        <ul className='text-white md:flex hidden list-none flex-row justify-center items-center flex-initial'>
                            <li className={`mx-4 cursor-pointer`}>
                            <a href="#userBets">Your bets</a>
                            </li>
                            <li>
                                <p className='bg-[#2952e3] py-2 px-7 mx-4 rounded-full cursor-pointer hover:bg-[#2546bd]'>
                                    Account: {shortenAddress(currentAccount)}
                                </p>
                            </li>
                        </ul>
                    )
                    : (
                        <button type="button" onClick={connectWallet}>
                            <p className='bg-[#2952e3] py-2 px-7 mx-4 rounded-full cursor-pointer hover:bg-[#2546bd]'>
                                Login with Metamask
                            </p>
                        </button>

                    )
                }

            </div>
        </header>
    )
}

export default Header;