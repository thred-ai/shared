import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ethers } from 'ethers';
import { Chain } from 'thred-core';
import { AppComponent } from '../app.component';
import { ButterflyComponent } from '../butterfly/butterfly.component';
import { LoadService } from '../load.service';
import { ProfileComponent } from '../profile/profile.component';
import { User } from '../user.model';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  constructor(
    private loadService: LoadService,
    private root: AppComponent,
    private clipboard: Clipboard,
    private _snackBar: MatSnackBar
  ) {}
//
  provider?: ethers.providers.Web3Provider;
  user?: User;
  balance = 0
  chains: { chain: Chain; balance: ethers.BigNumber }[] = [];
  address: string = '';
  loggedIn: number = 0;
  loading = false

  async ngOnInit() {

    let signedInUser = await this.loadService.currentUser;

    if (signedInUser && signedInUser.uid) {
      this.root.initApp();
      // this.root.butterfly?.beginFlyAnimation();
      this.loading = true
      this.provider = await this.loadService.initializeProvider();
      let signer = this.provider?.getSigner();
      //
      if (signer && this.provider != undefined) {
        this.address = await signer.getAddress();
        this.loggedIn = new Date(
          signedInUser.metadata.lastSignInTime ?? new Date()
        ).getTime();
        await this.loadService.initProviders();

        // this.loadService.loadedChains.subscribe(async (chains) => {
        //   await Promise.all(
        //     chains.map(async (c) => {
        //       this.chains.push({
        //         chain: c,
        //         balance: ethers.BigNumber.from('0'),
        //       });
        //       if (!this.provider) {
        //         return; //
        //       }
        //       let balance = ethers.BigNumber.from(
        //         await (window as any).ethereum.request({
        //           method: 'eth_getBalance',
        //           params: [this.address, 'latest'],
        //           chainId: `${c.id}`,
        //         })
        //       );
        //       if (balance) {
        //         let index = this.chains.findIndex((b) => b.chain.id == c.id);
        //         if (index > -1) {
        //           this.chains[index].balance = balance;
        //           this.balance += (c.rate * Number(ethers.utils.formatEther(balance)))
        //         }
        //       }
        //     })
        //   );
        // });

        this.loadService.getUserInfo(signedInUser.uid, false, false, (user) => {
          this.user = user;
          this.loading = false
          // this.root.butterfly?.initFly();
          // setTimeout(() => {}, 2000);
        });
      }
    } else {
      this.loading = false
      this.root.routeToAuth();
    }

  }

  editProfile() {
    (window as any).user = this.user;
    this.root.routeToEdit();
  }

  tabChange(event: MatTabChangeEvent) {
    this.root.butterfly?.initFly();
  }

  openNetwork(id: number){
    this.root.routeToNetwork(id)
  }

  copy() {
    this.clipboard.copy(this.address);
    this._snackBar.open('Copied!', 'OK', {});
  }

  logOut() {
    this.loadService.signOut(this.root, (success) => {
      if (success) {
        this.root.routeToAuth();
      } else {
        console.log('ERROR');
      }
    });
  }
}
