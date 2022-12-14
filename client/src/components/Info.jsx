import React, { useContext } from "react";
import { AiFillPlayCircle } from "react-icons/ai";
import { AiFillPlusCircle } from 'react-icons/ai';
import { BiSearchAlt } from 'react-icons/bi';
import { GiMoneyStack } from 'react-icons/gi';
import { BookmakerContext } from "../context/BookmakerContext";

const InfoCard = ({ color, title, icon, subtitle }) => (
  <div className='flex flex-row justify-start items-centre white-glassmorphism p-3 m-2 hover-shadow-xl'>
    <div className={`w-10 h-10 rounded-full flex justify-center items-center ${color}`}>
      {icon}
    </div>
    <div className='ml-5 flex flex-col flex-1'>
      <h1 className='mt-2 text-white text-lg'>{title}</h1>
      <p className='mt-2 text-white text-sm w-9/12'>{subtitle}</p>
    </div>
  </div>
)

const Info = () => {
  const { currentAccount, connectWallet } = useContext(BookmakerContext);

  return (
    <div className="flex w-full justify-center items-center">
      <div className="flex mf:flex-row flex-col items-strech justify-between md:p-15 py-10 px-10">
        <div className="flex flex-1 justify-start items-start flex-col p-10">
          <h1 className="text-5xl text-white text-gradient py-1">
            Bet games <br /> without bookmaker!
          </h1>
          <p className="text-left mt-5 text-white font-light text-base">
            Fully decentralized, peer-to-peer bookmaker <br /> Use smartconract to bet games!
          </p>
          {!currentAccount && (
            <button
              type="button"
              onClick={connectWallet}
              className="flex flex-row justify-center items-center my-5 bg-[#2952e3] p-3 rounded-full cursor-pointer hover:bg-[#2546bd]"
            >
              <AiFillPlayCircle className="text-white mr-2" />
              <p className="text-white text-base font-semibold">
                Connect Wallet
              </p>
            </button>
          )}
        </div>

        <div className='flex-1 flex flex-col justify-end items-end grid grid-rows-3 px-10'>
          <InfoCard
            color="bg-[#8945F8]"
            title="Find your game"
            icon={<BiSearchAlt fontSize={21} className="text-white" />}
            subtitle="All games are delivered by oracle!"
          />
          <InfoCard
            color="bg-[#2952E3]"
            title="Join or create bet offer"
            icon={<AiFillPlusCircle fontSize={21} className="text-white" />}
            subtitle="Players decide about odds they want to bet!"
          />
          <InfoCard
            color="bg-[#14C16A]"
            title="Cash out your win!"
            icon={<GiMoneyStack fontSize={21} className="text-white" />}
            subtitle="Withdraw your win from smartcontract!"
          />
        </div>
      </div>

    </div>
  );
};

export default Info;