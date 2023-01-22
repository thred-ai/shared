import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ethers } from 'ethers';
import { Chain, ERC20 } from 'thred-core';
import { AppComponent } from '../app.component';
import { LoadService } from '../load.service';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss'],
})
export class NetworkComponent implements OnInit {
  constructor(
    private loadService: LoadService,
    private root: AppComponent,
    private _router: ActivatedRoute
  ) {}

  tokens?: ERC20[];
  loading = false;
  balance = ethers.BigNumber.from('0x0');
  chain?: Chain;

  async ngOnInit() {
    let signedInUser = (await this.loadService.currentUser)?.uid;
    if (signedInUser) {
      this.loading = true;
      this.loadService.loadedChains.subscribe(async (chains) => {
        this.chain = chains.find((c) => c.id == this.getId());
        if (this.chain) {
          this.root.initApp(this.chain.name);

          let balance = ethers.BigNumber.from(
            await (window as any).ethereum.request({
              method: 'eth_getBalance',
              params: [signedInUser, 'latest'],
              chainId: `${this.getId()}`,
            })
          );
          this.tokens = [
            new ERC20(
              '',
              this.chain?.url,
              this.chain?.name,
              this.chain?.currency,
              balance,
              18,
              this.chain?.rates
            ),
          ];
          this.balance = balance;
        }

        this.loadService.getTokensForNetwork(
          this.getId(),
          signedInUser!,
          (tokens) => {
            if (tokens) {
              this.tokens = this.tokens?.concat(tokens) ?? [];
            }
            this.loading = false;
          }
        );
      });
    } else {
      this.root.routeToAuth();
    }
  }

  getId() {
    const routeParams = this._router.snapshot.paramMap;
    const id = routeParams.get('network') as string;

    return Number(id);
  }

  back() {
    this.root.routeToProfile();
  }
}
