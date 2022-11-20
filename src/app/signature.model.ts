import { ethers } from 'ethers';

export class Signature {
  id!: string;
  signer!: string;
  payAddress!: string;
  feeAddress!: string;
  fee!: number;
  price!: ethers.BigNumber;
  chainId!: number;
  version!: number;
  listed!: boolean;
  signature!: string;

  constructor(
    id: string,
    signer: string,
    payAddress: string,
    feeAddress: string,
    fee: number,
    price: ethers.BigNumber,
    chainId: number,
    version: number,
    listed: boolean,
    signature: string
  ) {
    this.id = id;
    this.signer = signer;
    this.payAddress = payAddress;
    this.feeAddress = feeAddress;
    this.fee = fee;
    this.price = price;
    this.chainId = chainId;
    this.version = version;
    this.listed = listed;
    this.signature = signature;
  }
}
