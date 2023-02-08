import EventEmitter from 'events';

export default class ThredSigner extends EventEmitter {
  type!: number;
  chainId!: string;
  chains!: any[];
  networkVersion!: string;

  isMetaMask!: boolean;
  isBraveWallet!: boolean;
  selectedAddress!: string | null;
  autoRefreshOnNetworkChange!: boolean;

  enable() {
    console.log('enabling');
    try {
      var data = {
        method: 'eth_accounts',
        params: [],
        chainId: this.chainId,
      };
      return this.request(data);
    } catch (err: any) {
      console.log(JSON.stringify(err.message));
      return Promise.reject(err.message);
    }
  }

  isConnected() {
    console.log('check connected');
    return Promise.resolve(true);
  }

  _metamask: any = {
    isUnlocked() {
      console.log('check unlocked');

      return Promise.resolve(true);
    },
  };

  send(method: string, params: any = {}) {
    console.log('normal send');
    try {
      return this.request({ method: method, params: params });
    } catch (err) {
      console.log(JSON.stringify(err));
      return Promise.resolve(null);
    }
  }

  _sendSync(req: any) {
    console.log('SEND SYNC');
    console.log(JSON.stringify(req));
  }

  sendAsync(req: any, callback: (error: any, response: any) => any) {
    console.log('sending async');

    try {
      let jsonrpc = req.jsonrpc;
      let id = req.id;
      let method = req.method;

      this.request(req)
        .then((returnData) => {
          callback(null, { jsonrpc, id, method, result: returnData }); //
        })
        .catch((e: Error) => {
          console.error(JSON.stringify(e.message));
          callback(e, null);
        });
    } catch (err) {
      console.log(JSON.stringify(err));
      callback(err, null);
    }
  }

  connect(req: any) {}

  async request(req: { method: string; params: any[]; chainId?: string }) {
    console.log('requesting');
    let method = req.method;
    let params = req.params;

    let chainId = req.chainId ?? this.networkVersion;
    console.log(JSON.stringify(req));

    if (method === 'eth_chainId') {
      console.log('GET CHAIN ID');
      console.log(this.chainId);
      return Promise.resolve(this.chainId);
    } else if (method === 'wallet_switchEthereumChain') {
      console.log('SWITCH CHAIN ID');
      let chain = params[0].chainId ?? '0x1';
      this.chainId = chain;
      this.networkVersion = String(parseInt(this.chainId, 16));
      this.emit('chainChanged', this.chainId);
      return Promise.resolve(null);
    } else {
      var data: any = {
        method,
        params,
        chainId,
      };
      if (method === 'personal_sign') {
        data.params[0] = params[0].slice(2);
        console.log('SIGN MSG');
      } else if (method === 'eth_sendTransaction') {
        console.log('SEND TX');

        let value = data.params[0].value;
        if (!value) {
          data.params[0].value = '0x0';
          value = '0x0';
        }
        data.displayValue = value;
        data.symbol = this.chains.find(
          (c) => String(c.id) == String(data.chainId)
        ).currency;

        console.log(JSON.stringify(data));
      } else if (method === 'eth_signTypedData_v4') {
        console.log('SIGN DATA');

        data.params[1] = JSON.parse(data.params[1]);
      } else if (method === 'eth_estimateGas') {
        let value = data.params[0].value;
        if (!value) {
          data.params[0].value = '0x0';
        }
      }

      try {
        var call: Promise<string | null>;
        var w = window as any;
        let callData = JSON.stringify(data);
        if (this.type == 0 && w.webkit?.messageHandlers?.thred_request) {
          call = w.webkit.messageHandlers.thred_request.postMessage(callData);
          console.log('injected');
        } else if (w.thred_request) {
          call = w.thred_request(callData);
          console.log('native');
        } else {
          call = Promise.resolve(null);
        }

        let rawData = await call;

        let returnData = rawData ? JSON.parse(rawData) : null;

        console.log('RETURNED');
        console.log(rawData);

        try {
          if (returnData.data == '0x') {
            returnData.data = null;
          }

          if (returnData == 'rejected') {
            const err = new Error();
            err.message = 'User rejected the request.';
            return Promise.reject(err.message);
          } else if (returnData.success == false && returnData.error != null) {
            const err = new Error();
            err.message = returnData.error.message;
            return Promise.reject(err.message);
          }

          if (method == 'eth_requestAccounts' || method == 'eth_accounts') {
            this.selectedAddress = returnData.data[0];
            console.log(this.selectedAddress);
            console.log(JSON.stringify(this.eventNames()));
            this.emit('connect', { chainId: this.chainId });
          }
          console.log(JSON.stringify(returnData.data));
          return Promise.resolve(returnData.data);
        } catch (error: any) {
          console.log(JSON.stringify(error.message));
          return Promise.reject(error.message);
        }
      } catch (e: any) {
        console.log(e.message);
        return Promise.reject(e.message);
      }
    }
  }

  constructor(
    type: number = 0,
    chains: any[] = [],
    networkVersion: number = 1,
    maskOtherWallets: boolean = true,
    autoRefresh: boolean = true,
    selectedAddress?: string
  ) {
    super();
    this.type = type;
    this.chainId = `0x${networkVersion.toString(16)}`;
    this.chains = chains;
    this.networkVersion = String(networkVersion);
    this.isMetaMask = maskOtherWallets;
    this.isBraveWallet = maskOtherWallets;
    this.selectedAddress = selectedAddress ?? null;
    this.autoRefreshOnNetworkChange = autoRefresh;
  }
}
