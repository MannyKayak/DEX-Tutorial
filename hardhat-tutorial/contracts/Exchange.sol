// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
    address public cryptoDevTokenAddress;
    constructor (address _CryptoDevToken) ERC20("CryptoDev LP Token", "CDLP") {
        // check if it is null
        require(_CryptoDevToken != address(0), "Token address passed is a null address.");
        cryptoDevTokenAddress = _CryptoDevToken; 
    }

    function getReserve() public view returns (uint) {
        return ERC20(cryptoDevTokenAddress).balanceOf(address(this));
    }

    // function addLiquidity => 
    // if CryptoDevTokenReserve is zero means that is the first time someone is providing liquidity => se the price
    // else : the price is fixed and the reward for providing liquidity is to be calculated
    // to keep track of the provided liquidity we give to the user LP tokens => 
    //      the computation of the LP token depends whether there is liquidity or not
    function addLiquidity(uint256 _amount) public payable returns(uint) {
        uint liquidity;
        uint ethBalance = address(this).balance;
        uint cryptoDevTokenReserve = getReserve();
        ERC20 cryptoDevToken = ERC20(cryptoDevTokenAddress);
        // first intake
        if(cryptoDevTokenReserve == 0) {
            cryptoDevToken.transferFrom(msg.sender, address(this), _amount);
            liquidity = ethBalance;
            _mint(msg.sender, liquidity); // ERC20.sol smart contract function to mint ERC20 tokens
        } else {
            uint ethReserve = ethBalance - msg.value;
            // the ethBalance has inside the eth added by the user
            uint cryptoDevTokenAmount = (msg.value * cryptoDevTokenReserve) / (ethReserve);
            require(_amount >= cryptoDevTokenAmount, "Amount of tokens sent is less than the minimum token required");
            cryptoDevToken.transferFrom(msg.sender, address(this), cryptoDevTokenAmount);
            liquidity = (totalSupply() * msg.value)/ ethReserve;
            _mint(msg.sender, liquidity);
        }  
        return liquidity;
    }
    // now we can add Liquidity but we must be able to remove it
    function removeLiuqidity(uint _amount) public returns(uint, uint) {
        // _amount is the amount of LP tokens to withdraw
        // eth_returned_to_user/total_eth = _amount/total_LP_supply
        // this ration regulates the eth to remove
        require(_amount > 0, "_amount should be greater than 0");
        uint ethReserve = address(this).balance;
        uint _totalSupply = totalSupply();
        uint ethAmount = (_amount * ethReserve)/_totalSupply;
        // LP tokens must be burnt
        uint cryptoDevTokenAmount = (getReserve() * _amount)/_totalSupply;
        _burn(msg.sender, _amount);
        // after burning the LP tokens, send the eth to the user
        payable(msg.sender).transfer(ethAmount);
        ERC20(cryptoDevTokenAddress).transfer(msg.sender, cryptoDevTokenAmount);
        return(ethAmount, cryptoDevTokenAmount);
    }

    // next is SWAP functionality: this could happen in two "directions" eth <=> CDtoken
    // follow the math on the notes 
    function getAmountOfTokens(uint256 inputAmount, uint256 inputReserve, uint256 outputReserve) public pure returns(uint256) {
        require( inputReserve > 0 && outputReserve > 0, "Invalid reserves");
        uint256 inputAmountWithFee = inputAmount * 99;
        uint256 numerator = outputReserve * inputAmountWithFee;
        uint256 denominator = (inputReserve * 100) + inputAmountWithFee;
        return numerator / denominator;
    }

    // now we want to swap eth fot CDtoken, this function will use the previous function
    function ethToCryptoDevToken(uint256 _minTokens) public payable {
        uint256 tokenReserve = getReserve();
    // now we call the previous function:
    // Notice that the `inputReserve` we are sending is equal to
    // `address(this).balance - msg.value` instead of just `address(this).balance`
    // because `address(this).balance` already contains the `msg.value` user has sent in the given call
    // so we need to subtract it to get the actual input reserve
        uint256 tokensBought = getAmountOfTokens(
            msg.value, 
            address(this).balance - msg.value, 
            tokenReserve
            );
        require(tokensBought >= _minTokens, "insufficient output amount");
        ERC20(cryptoDevTokenAddress).transfer(msg.sender, tokensBought);
    }

    // and now the opposite token => eth
    function cryptoDevTokenToEth(uint _tokensSold, uint _minEth) public {
        uint256 tokenReserve = getReserve();
        uint256 ethBought = getAmountOfTokens(
            _tokensSold,
            tokenReserve,
            address(this).balance
        );
        require(ethBought >= _minEth, "insufficient output amount");
        ERC20(cryptoDevTokenAddress).transferFrom(
            msg.sender,
            address(this),
            _tokensSold
        );
        payable(msg.sender).transfer(ethBought);
    }
}