import { Injectable } from '@angular/core';
import { Chain } from 'thred-core';
import { HttpClient } from '@angular/common/http';
import ThredSigner from 'src/signer/signer.model';

@Injectable({
  providedIn: 'root',
})
export class SignerService {
  constructor(private httpClient: HttpClient) {}

  async getSigner(
    mode = 0,
    chains: Chain[],
    initialNetwork = 1,
    currency = 'usd'
  ) {
    if (mode == 0) {
      let assembly = await this.getSignerAssembly();
      let constructor = `
      
      window.ethereum = new ThredSigner.default(
        ${mode},
        ${this.initChains(chains, mode, currency)},
        ${initialNetwork}
      )
      
      `;

      return `${assembly} ${constructor}`;
    } else {
      return new ThredSigner(
        mode,
        this.initChains(chains, mode, currency) as any[],
        initialNetwork
      );
    }
  }

  async getSignerAssembly() {
    return await this.httpClient
      .get('signer/injectedSigner.js', { responseType: 'text' })
      .toPromise();
  }

  initChains(chains: Chain[], mode: number = 0, currency = 'usd') {
    if (mode == 0) {
      return `[${chains
        .map((chain) => {
          return `{
          "name": "${chain.name}",
          "id": ${chain.id},
          "url": "${chain.url}",
          "rate": ${chain.rates[currency]},
          "currency": "${chain.currency}",
        }`;
        })
        .join(',')}]`;
    } else {
      return chains.map((chain) => {
        return {
          name: chain.name,
          id: chain.id,
          url: chain.url,
          rate: chain.rates[currency],
          currency: chain.currency,
        };
      });
    }
  }

  stringify(obj: any, prop: string) {
    var placeholder = '____PLACEHOLDER____';
    var fns: any[] = [];
    var json = JSON.stringify(
      obj,
      function (key, value) {
        if (typeof value === 'function') {
          fns.push(value);
          return placeholder;
        }
        return value;
      },
      2
    );
    json = json.replace(new RegExp('"' + placeholder + '"', 'g'), function (_) {
      return fns.shift();
    });
    return 'window["' + prop + '"] = ' + json + ';';
  }
}
