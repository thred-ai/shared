import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  Pipe,
} from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { ethers } from 'ethers';
import { filter, map } from 'rxjs/operators';
import { AppComponent } from '../app.component';
import { App } from '../app.model';
import { Category } from '../category.model';
import { Chain } from '../chain.model';
import { LoadService } from '../load.service';
import { NameEnsLookupPipe } from '../name-ens-lookup.pipe';
import { Signature } from '../signature.model';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
})
export class ItemComponent implements OnInit, OnDestroy {
  oldUrl = '';

  private sub = this.router.events
    .pipe(
      filter((event) => event instanceof NavigationStart),
      map((event) => event as NavigationStart), // appease typescript
      filter((event) => event.url !== this.oldUrl)
    )
    .subscribe((event) => {
      this.oldUrl = event.url;
      this.getItem(event.url.split('/').reverse()[0]);
    });

  constructor(
    private router: Router,
    private _router: ActivatedRoute,
    private loadService: LoadService,
    private root: AppComponent
  ) {
    this.root.initApp()
  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  @Output() install = new EventEmitter<any>();

  item?: App = undefined;

  shuffle(arr: any[]) {
    let m = arr.length,
      i;
    while (m) {
      i = (Math.random() * m--) >>> 0;
      [arr[m], arr[i]] = [arr[i], arr[m]];
    }
    return arr;
  }

  back() {
    this.router.navigateByUrl('/store');
  }

  getItem(id = this.getId()) {
    this.loadService.getItem(
      id,
      (result) => {
        this.item = result;
        if (result) {
          
        }
      },
      true
    );
  }

  getId() {
    const routeParams = this._router.snapshot.paramMap;
    const id = routeParams.get('app') as string;

    return id;
  }

  viewDev() {
    this.loadService.openDevProfile(this.item!.creator);
  }

  provider?: ethers.providers.Web3Provider

  async ngOnInit() {
    let signedInUser = (await this.loadService.currentUser)?.uid;
    if (signedInUser) {
      await this.loadService.initProviders();
      this.provider = await this.loadService.initializeProvider();
      this.loadApps(signedInUser, undefined, undefined, success => {
        this.getItem();
      })
    }
  }

  date() {
    return new Date();
  }

  openApp(app: App){
    (window as any)?.openApp(JSON.parse(JSON.stringify(app)));
  }

  installedApps: string[] = [];


  installed(app: App) {
    return this.installedApps.find((a) => a == app.id) != undefined;
  }

  loadApps(
    user: string,
    chainId = 5,
    provider = this.loadService.providers[chainId].ethers,
    callback: (success: boolean) => any
  ) {
    // this.loading = true;

    this.loadService.getCoreABI(chainId, async (result) => {
      if (result) {
        let abi = result.abi;
        let address = result.address;

        try {
          let contract = new ethers.Contract(address, abi, provider);

          let data = (await contract['fetchAppsForUser'](
            ethers.utils.getAddress(user)
          )) as string[];

          let filtered = [...new Set(data.filter((d) => d != ''))];
          this.installedApps = filtered;
          callback(true);
        } catch (error: any) {
          // this.loading = false;
          // this.mode = 1;
          // console.log(JSON.stringify(error.message));
          this.installedApps = [];
          callback(true);
        }
      }
    });
  }

  async installApp(app = this.item, chainId = 5, provider = this.provider) {
    if (!provider || !app) {
      return;
    }
    if (this.installed(app)) {
      (window as any)?.openApp(JSON.parse(JSON.stringify(app)));
      return;
    }
    this.loading = 1

    let signer = provider?.getSigner();

    const signature = await signer.signMessage(`Install ${app.name} onto your wallet?`);

    let id = app.id;

    let walletAddress = await signer.getAddress();

    let util = app.signatures.find((s) => s.chainId == chainId);

    console.log(util);

    this.loading = 2


    if (util?.listed || app.whitelist?.find((a) => a == walletAddress)) {
      try {
        this.loadService.installApp(signature, id, success =>{
          this.loading = 3;
          setTimeout(() => {
            this.loading = 0;
          }, 5000);
        });
      } catch (error) {
        console.log(error);
        this.loading = 4;
        setTimeout(() => {
          this.loading = 0;
        }, 5000);
      }
    } else {
      this.loading = 5;

      setTimeout(() => {
        this.loading = 0;
      }, 5000);
    }
  }

  loading = 0

  onParentEvent(data: any) {
    // your logic here
  }

  chains(util: App) {
    return util.chains.map((c) => c.name).join(', ');
  }
}
