import { Component } from '@angular/core';
import { initializeApp } from '@angular/fire/app';
import { ActivatedRoute, Router } from '@angular/router';
import { ethers } from 'ethers';
import { LoadService } from './load.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = '';
  signedIn?: Boolean;

  tabs = [
    {
      name: 'Discover',
      icon: 'search',
      link: '/store',
    },
    {
      name: 'My Apps',
      icon: 'apps',
      link: '/home',
    },
    {
      name: 'Account',
      icon: 'account_balance_wallet',
      link: '/account',
    },
  ];

  constructor(
    private router: ActivatedRoute,
    private _router: Router,
    private loadService: LoadService
  ) {}

  toHex(str: string) {
    var result = '';
    for (var i=0; i<str.length; i++) {
      result += str.charCodeAt(i).toString(16);
    }
    return result;
  }

  async ngOnInit() {
    this.initApp()

    const message = 'Welcome to Thred! \n\nPlease sign this message!';

    // In frontend
    setTimeout(async () => {
      const provider = new ethers.providers.Web3Provider(
        (window as any).ethereum
      );
      await provider.send('eth_requestAccounts', []); // connects MetaMask
      const signer = provider.getSigner()
      console.log('SIGNER -- ' + await signer.getAddress());

      console.log("HASHED -- " + this.toHex(message))
      // console.log(JSON.stringify(provider))

      try {
        const signature = await signer.signMessage(message);

        console.log("SIG CL -- " + signature)
        const recoveredAddress = ethers.utils.verifyMessage(this.loadService.decodeHex(this.toHex(message)), signature);
  
        console.log(recoveredAddress)
        // console.log((JSON.stringify(recoveredAddress === await signer.getAddress())))
      } catch (error) {
        console.log("Failed")
        console.log(JSON.stringify(error))
      }//
    }, 1000);

    
  }

  async initApp() {
    document.body.classList.add('bar');
    let url =
      window.location.pathname == '/' ? '/home' : window.location.pathname;
    console.log(url);

    this.title = this.tabs.find((tab) => tab.link == url)?.name ?? '';
    this.signedIn = (await this.loadService.currentUser)?.uid != undefined
  }

  routeToAuth() {
    this._router.navigateByUrl('/auth');
  }

  routetoHome() {
    this._router.navigateByUrl('/home');
  }
}
