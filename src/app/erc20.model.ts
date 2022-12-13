import { ethers } from "ethers";

export class ERC20 {
  address!: string;
  url!: string;
  name!: string;
  symbol!: string;
  balance!: ethers.BigNumber;
  decimals!: number;
  rate: number;

  constructor(
    address: string,
    url: string,
    name: string,
    symbol: string,
    balance: ethers.BigNumber,
    decimals: number,
    rate: number
  ) {
    this.address = address;
    this.url = url;
    this.name = name;
    this.symbol = symbol;
    this.balance = balance;
    this.decimals = decimals;
    this.rate = rate ?? 0
  }
}
