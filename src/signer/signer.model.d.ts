/// <reference types="node" />
import EventEmitter from 'events';
export default class ThredSigner extends EventEmitter {
    type: number;
    chainId: string;
    chains: any[];
    networkVersion: string;
    isMetaMask: boolean;
    isBraveWallet: boolean;
    selectedAddress: string | null;
    autoRefreshOnNetworkChange: boolean;
    enable(): Promise<any>;
    isConnected(): Promise<boolean>;
    _metamask: any;
    send(method: string, params?: any): Promise<any>;
    _sendSync(req: any): void;
    sendAsync(req: any, callback: (error: any, response: any) => any): void;
    connect(req: any): void;
    request(req: {
        method: string;
        params: any[];
        chainId?: string;
    }): Promise<any>;
    constructor(type?: number, chains?: any[], networkVersion?: number, maskOtherWallets?: boolean, autoRefresh?: boolean, selectedAddress?: string);
}
