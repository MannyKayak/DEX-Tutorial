// get amount utils function
import { Contract } from "ethers";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";

export const getEtherBalance = async (provider, address, contract=false ) => {
    try {
        // if the condition contract is true => retreive the balance of the exchange contract
        if (contract) {
            const balance = await provider.getBalance(EXCHANGE_CONTRACT_ADDRESS);
            return balance;
        } else {
            const balance = await provider.getBalance(address);
            return balance;
        }
    } catch (err) {
        console.error(err);
        return 0;
    }
};

// retreives the CD token balance of the address
export const getCDTokensBalance = async (provider, address) => {
    try {
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const balanceOfCryptoDevTokens = await tokenContract.balanceOf(address);
      return balanceOfCryptoDevTokens;
    } catch (err) {
      console.error(err);
    }
};

export const getLPTokensBalance = async (provider, address) => {
    try {
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            provider
        );
        const balanceOfLPTokens = await exchangeContract.balanceOf(address);
        return balanceOfLPTokens;
    } catch (err) {
        console.error(err);
    }
};

export const getReserveOfCDTokens = async (provider) => {
    try {
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            provider
        );
        const reserve = await exchangeContract.getReserve();
        return reserve;
    } catch (err) {
        console.error(err);
    }
};

