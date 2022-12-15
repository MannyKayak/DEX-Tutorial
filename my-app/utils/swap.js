import { Contract } from "ethers";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";

// getAmountOfTokensReceivedFromSwap returns the number of ETH/CD 
// based on _swapAmountWei and token seleced
export const getAmountOfTokensReceivedFromSwap = async (
    _swapAmountWei,
    provider,
    ethSelected, // from UI
    ethBalance,
    reservedCD
) => {
    const exchangeContract = new Contract(
        EXCHANGE_CONTRACT_ADDRESS,
        EXCHANGE_CONTRACT_ABI,
        provider
    );
    let amountOfTokens;
    // to better understand this passage need to recall the architecture of the 
    // getAmountOfTokens function.
    if (ethSelected) {
        amountOfTokens = await exchangeContract.getAmountOfTokens(
            _swapAmountWei,
            ethBalance,
            reservedCD
        );
    } else {
        amountOfTokens = await exchangeContract.getAmountOfTokens(
            _swapAmountWei,
            reservedCD,
            ethBalance
        );
    }
    return amountOfTokens;
};

export const swapTokens = async(
    signer,
    swapAmontWei,
    tokenToBeReceivedAfterSwap,
    ethSelected
) => {
    const exchangeContract = new Contract(
        EXCHANGE_CONTRACT_ADDRESS,
        EXCHANGE_CONTRACT_ABI,
        signer
    );
    const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
    );

    let tx; // transaction that depens on ethSelected
    
    // DEEP DIVE the theory here.
    if (ethSelected) {
        tx = await exchangeContract.ethToCryptoDevToken(
            tokenToBeReceivedAfterSwap,
            {
                value: swapAmontWei,
            }
        );
    } else {
        // in this case need approve for ERC20
        tx = await tokenContract.approve(
            EXCHANGE_CONTRACT_ADDRESS,
            swapAmontWei.toString()
        );
        await tx.wait();
        tx = await exchangeContract.cryptoDevTokenToEth(
            swapAmontWei,
            tokenToBeReceivedAfterSwap
        );
    }
    await tx.wait();
};