import { ethers } from 'ethers';
import { Chain } from './chain.model';
import { Signature } from './signature.model';

export class App {
  name!: string;
  id!: string;
  creator!: string;
  signatures!: Signature[];
  creatorName?: string;
  displayUrls!: string[];
  coverUrl?: string;
  metaUrl!: string;
  description?: string;
  price!: number;
  etherPrice!: ethers.BigNumber;
  category!: number;
  available!: boolean;
  verified!: boolean;
  reviews!: number;
  rating!: number;
  downloads!: number;
  chains!: Chain[];
  created!: number;
  modified!: number;
  status!: number;
  installWebhook!: string;
  uninstallWebhook!: string;
  loadURL?: string | null;
  whitelist?: string[];

  constructor(
    id: string,
    creator: string,
    signatures: Signature[],
    created: number,
    modified?: number,
    creatorName?: string,
    name?: string,
    displayUrls?: string[],
    metaUrl?: string,
    description?: string,
    price?: number,
    etherPrice?: ethers.BigNumber,
    category?: number,
    available?: boolean,
    verified?: boolean,
    reviews?: number,
    rating?: number,
    downloads?: number,
    chains?: Chain[],
    coverUrl?: string,
    status?: number,
    installWebhook?: string,
    uninstallWebhook?: string,
    loadURL?: string,
    whitelist?: string[]
  ) {
    this.id = id;
    this.creator = creator;
    this.signatures = signatures ?? [];
    this.created = created;
    this.modified = modified ?? created;
    this.creatorName = creatorName ?? 'Unknown Developer';
    this.name = name ?? 'My App';
    this.displayUrls = displayUrls ?? ['add_thred_default_later'];
    this.metaUrl = metaUrl ?? 'add_thred_default_later';
    this.description = description ?? 'No Description Available';
    this.price = price ?? 0;
    this.etherPrice = etherPrice ?? ethers.utils.parseEther('0');
    this.category = category ?? 0;
    this.available = available ?? false;
    this.verified = verified ?? false;
    this.reviews = reviews ?? 0;
    this.rating = rating ?? 0;
    this.downloads = downloads ?? 0;
    this.chains = chains ?? [new Chain('Ethereum', 1, 'ETH')];
    this.coverUrl = coverUrl;
    this.status = status ?? 0;
    this.installWebhook = installWebhook ?? '';
    this.uninstallWebhook = uninstallWebhook ?? '';
    this.loadURL = loadURL ?? null;
    this.whitelist = whitelist ?? [];
  }
}
