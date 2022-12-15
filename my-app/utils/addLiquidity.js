import { Contract, utils } from "ethers";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";

export const addLiquidity = async (
    signer,
    addCDAmountWei,
    addEtherAmountWei
) => {
    try {
        const tokenContract = new Contract(
            TOKEN_CONTRACT_ADDRESS,
            TOKEN_CONTRACT_ABI,
            signer
          );
          const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            signer
          );
        
          // since CDToken are ERC20, user need to give the approve to take 
          // the CDT out of the contract
          let tx = await tokenContract.approve(
            EXCHANGE_CONTRACT_ADDRESS,
            addCDAmountWei.toString()
          );
          await tx.wait();
          // after approval add eth and CDT to the liquidity
          tx = await exchangeContract.addLiquidity(addCDAmountWei, {
            value: addEtherAmountWei,
          });
          await tx.wait();
    } catch (err) {
        console.error(err);
    }
};

export const calculateCD = async (
    _addEther = '0',
    etherBalanceContract,
    cdTokenReserve
) => {
    // convert the string _addEther to BigNumber
    const _addEtherAmountWei = utils.parseEther(_addEther);
    const cryptoDevTokenAmount = _addEtherAmountWei.mul(cdTokenReserve).div(etherBalanceContract);
    return cryptoDevTokenAmount;
}