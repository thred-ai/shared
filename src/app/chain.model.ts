export class Chain {
  name!: string;
  id!: number;
  currency!: string;
  url!: string;
  isTestnet!: boolean;

  constructor(name: string, id: number, currency: string, isTestnet: boolean = false) {
    this.name = name ?? 'Ethereum';
    this.id = id ?? 1;
    this.currency = currency
    this.isTestnet = isTestnet
    this.url = `https://storage.googleapis.com/thred-protocol.appspot.com/chain-icons/${id}.png`;
  }
}
