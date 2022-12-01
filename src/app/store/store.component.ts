import { Component, OnInit } from '@angular/core';
import { ethers } from 'ethers';
import { AppComponent } from '../app.component';
import { App } from '../app.model';
import { LoadService } from '../load.service';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss'],
})
export class StoreComponent implements OnInit {
  apps?: App[] = [];
  installedApps: string[] = [];
  provider?: ethers.providers.Web3Provider;
  loading = 0
  installingId = ""
  address: string = ""

  constructor(private root: AppComponent, private loadService: LoadService) {
    console.log('HEY');
    root.initApp();
  }

  async ngOnInit() {
    let signedInUser = (await this.loadService.currentUser)?.uid;
    if (signedInUser) {
      await this.loadService.initProviders();
      this.provider = await this.loadService.initializeProvider();
      this.address = await this.provider?.getSigner().getAddress() ?? "";
      this.loadApps(signedInUser, 5, undefined, (success) => {
        this.loadService.getNewItems((apps) => {
          this.apps = apps;
          this.root.butterfly?.initFly();
        });
      });
    }
  }

  installed(app: App) {
    return this.installedApps.find((a) => a == app.id) != undefined;
  }

  listed(app: App){
    let util = app.signatures.find((s) => s.chainId == 5);

    if (util?.listed || app.whitelist?.find((a) => a == this.address)) {
      return true
    }
    return false
  }

  async install(app: App, chainId = 5, provider = this.provider) {
    if (!provider) {
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

    this.installingId = app.id
    this.loading = 2


    if (util?.listed || app.whitelist?.find((a) => a == walletAddress)) {
      try {
        this.loadService.installApp(signature, id, success =>{
          this.loading = 3;
          this.installingId = ''
          this.installedApps.push(app.id)
          setTimeout(() => {
            this.loading = 0;
          }, 5000);
        });
      } catch (error) {
        console.log(error);
        this.installingId = ''
        this.loading = 4;
        setTimeout(() => {
          this.loading = 0;
        }, 5000);
      }
    } else {
      this.loading = 5;
      this.installingId = ''

      setTimeout(() => {
        this.loading = 0;
      }, 5000);
    }
  }

  openApp(app: App){
    this.root.routeToItem(app.id)
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
          console.log(JSON.stringify(error.message));
          this.apps = [];
          callback(true);
        }
      }
    });
  }
}
