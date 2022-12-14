const hre = require("hardhat");
const fs = require('fs');

const main = async () => {
  const Bookmaker = await hre.ethers.getContractFactory("Bookmaker");
  const bookmaker = await Bookmaker.deploy();

  const WAIT_BLOCK_CONFIRMATIONS = 3;
  console.log("Deployment: waiting for " + WAIT_BLOCK_CONFIRMATIONS + " blocks confirmations");
  await bookmaker.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);
  console.log("Bookmaker smartcontract deployed to:", bookmaker.address);
  
  console.log("Logging address to deployment_logs.json")
  const deployment_log = '{\n date: ' + new Date().toLocaleString() +',\n address: ' + bookmaker.address + '\n}\n';
  fs.writeFileSync('scripts/deployment_logs.log', deployment_log, {flag: 'a'}, (err) => {
    if (err){
      throw err;
    } 
    console.log('Done');
  });

  /**
   * This part verifing smart contract code on etherscan
   * uncomment this section if you want to use it
   */
  //console.log(`Verifying contract on Etherscan...`);
  //await run(`verify:verify`, {
  //  address: bookmaker.address,
  //});
}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
    
  }
}

runMain();