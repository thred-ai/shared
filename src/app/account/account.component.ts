import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ethers } from 'ethers';
import { AppComponent } from '../app.component';
import { ButterflyComponent } from '../butterfly/butterfly.component';
import { Chain } from '../chain.model';
import { LoadService } from '../load.service';
import { ProfileComponent } from '../profile/profile.component';
import { User } from '../user.model';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  constructor(private loadService: LoadService, private root: AppComponent, private clipboard: Clipboard, private _snackBar: MatSnackBar) {
    root.initApp();
  }

  provider?: ethers.providers.Web3Provider;
  user?: User;
  balance: ethers.BigNumber = ethers.BigNumber.from('0');
  chains: { chain: Chain; balance: ethers.BigNumber }[] = [];
  address: string = ""
  loggedIn: number = 0

  async ngOnInit() {
    console.log('OYYYYYY');
    this.provider = await this.loadService.initializeProvider();
    let signer = this.provider?.getSigner();
    console.log('MAN');
    let signedInUser = (await this.loadService.currentUser);
    //
    if (signer && signedInUser && signedInUser.uid && signedInUser.metadata.lastSignInTime && this.provider != undefined) {
      this.address = await signer.getAddress()
      this.loggedIn = new Date(signedInUser.metadata.lastSignInTime).getTime()
      await this.loadService.initProviders();

      this.loadService.loadedChains.subscribe((chains) => {
        chains.forEach((c) => {
          this.chains.push({chain: c, balance: ethers.BigNumber.from("0")})
          if (!this.provider) {
            return;
          }
          this.loadService.checkChain(c.id, this.provider, async (result) => {
            let balance = await signer?.getBalance('latest');
            if (balance){
              let index = this.chains.findIndex(b => b.chain.id == c.id)
              if (index > -1){
                this.chains[index].balance = balance
              }
            }
            console.log(`${c.name} -- ${balance?.toNumber()}`);
          });
        });
      });

      this.loadService.getUserInfo(signedInUser.uid, false, false, (user) => {
        this.user = user;
        this.root.butterfly?.initFly();
        setTimeout(() => {}, 2000);
      });
    }

    console.group(this.balance);

    // console.log(await this.provider?.getBalance(await (this.provider.getSigner()).getAddress()))
  }

  editProfile(){
    (window as any).user = this.user
    this.root.routeToEdit()
  }

  tabChange(event: MatTabChangeEvent){
    this.root.butterfly?.initFly()
  }

  copy(){
    this.clipboard.copy(this.address)
    this._snackBar.open("Copied!", "OK", {})
  }

  logOut(){
    this.loadService.signOut(success => {
      if (success){
        this.root.routeToAuth()
      }
      else{
        console.log("ERROR")
      }
    })
  }


  
}
