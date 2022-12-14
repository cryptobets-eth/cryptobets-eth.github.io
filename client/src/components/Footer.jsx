import React from "react";

const Footer = () => (
  <div className="w-full flex pt-12 md:justify-center justify-between items-center flex-col p-4 gradient-bg-footer">
    
    <div className="sm:w-[90%] w-full h-[0.25px] bg-gray-400 mb-2 mt-1" />

    <div className="w-full flex sm:flex-row flex-col justify-between items-center my-4">
      <div className="flex flex-1 justify-evenly items-center flex-wrap sm:mt-0 mt-5 w-full">
        <a className="text-white text-base text-center mx-2 cursor-pointer"
          href="https://www.overleaf.com/read/knpwctfhhjbs"
          target="_blank">
          whitepaper</a>
        <a className="text-white text-base text-center mx-2 cursor-pointer"
          href="https://goerli.etherscan.io/address/0xc4d51cF247CEa0dA60c04B2213636534Bc2ef5a7"
          target="_blank">
          smartcontract
        </a>
        <a className="text-white text-base text-center mx-2 cursor-pointer"
          href="https://github.com/cryptobets-eth/cryptobets-eth.github.io.git"
          target="_blank">
          github</a>
        <a className="text-white text-base text-center mx-2 cursor-pointer"
          href="https://metamask.io/download/"
          target="_blank">
          metamask</a>
      </div>
    </div>

    <div className="sm:w-[90%] w-full h-[0.25px] bg-gray-400 mt-2 " />

    <div className="sm:w-[90%] w-full flex justify-between items-center">
      <p className="text-white text-left text-xs">Web3.0</p>
      <div className="flex flex-[0.5] mt-3 ml-12 justify-center items-center">
        <a href="" className="logo-text">CryptoBets</a>
    </div>
      <p className="text-white text-right text-xs">No rights reserved</p>
    </div>
  </div>
);

export default Footer;