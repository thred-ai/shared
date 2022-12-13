export class Chain {
  name!: string;
  id!: number;
  currency!: string;
  url!: string;
  rate!: number;
  isTestnet!: boolean;
  rank!: number

  constructor(name: string, id: number, currency: string, rate: number, isTestnet: boolean = false, rank: number = 0) {
    this.name = name ?? 'Ethereum';
    this.id = id ?? 1;
    this.currency = currency
    this.rate = rate ?? 0
    this.isTestnet = isTestnet
    this.url = `https://storage.googleapis.com/thred-protocol.appspot.com/chain-icons/${id}.png`;
    this.rank = rank
  }
}
