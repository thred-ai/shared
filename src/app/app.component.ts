import { Component, ViewChild } from '@angular/core';
import { initializeApp } from '@angular/fire/app';
import { ActivatedRoute, Router } from '@angular/router';
import { ethers } from 'ethers';
import ThredSigner from 'src/signer/signer.model';
import { ThredMobilePlugin } from 'src/ThredCorePlugin';
import { App } from 'thred-core';
import { LoadService } from './load.service';
import { SignerService } from './signer.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = '';
  signedIn?: Boolean;
  uid?: string;

  tabs = [
    {
      name: 'Discover',
      icon: 'search',
      link: '/store',
      hide: '0x54Da21443C8D97B3aac5067Fd0B21c359D343Ea2',
    },
    {
      name: 'My Apps',
      icon: 'apps',
      link: '/home',
      hide: '0x54Da21443C8D97B3aac5067Fd0B21c359D343Ea2',
    },
    {
      name: 'Account',
      icon: 'account_balance_wallet',
      link: '/account',
      hide: null,
    },
  ];

  constructor(
    private router: ActivatedRoute,
    private _router: Router,
    private loadService: LoadService,
    private signerService: SignerService
  ) {}

  async openApp(data: App) {
    // this.dialog.open(AppWindowComponent, {
    //   width: '2000px',
    //   maxHeight: '100vh',
    //   maxWidth: '100vw',
    //   panelClass: 'app-full-bleed-dialog',
    //   data,
    // });
    if (this.loadService.loadedChains.value) {
      let injectedSigner = (await this.signerService.getSigner(
        0,
        this.loadService.loadedChains.value,
        data.defaultChain ?? 1
      )) as string;
      if (injectedSigner) {
        console.log(injectedSigner)
        ThredMobilePlugin.openApp(
          JSON.parse(JSON.stringify({ app: data, signer: injectedSigner }))
        );
      }
    }
  }

  async ngOnInit() {
    console.log('oi cunt');
    this.loadService.loadedUser.subscribe((user) => {
      this.uid = user?.id;
      // if (!user){
      //   this.routeToAuth()
      // }
    });

    this.loadService.loadedChains.subscribe(async (chains) => {
      if (chains && chains.length > 0) {
        let nativeSigner = (await this.signerService.getSigner(
          1,
          chains,
          Number((window as any)?.ethereum?.networkVersion ?? '1')
        )) as ThredSigner;
        console.log(nativeSigner);
        try {
          let w = window as any;
          if (nativeSigner && w) {
            w.thred = nativeSigner;
          }
        } catch (error) {
          console.log((error as any).message);
        }
      }
    });

    document.body.classList.add('bar');

    // if ((window as any).newInstance ?? false) {
    //   this.butterfly?.beginFlyAnimation();
    // }

    const myPluginEventListener = await ThredMobilePlugin.addListener(
      'newTransaction',
      (data: any) => {
        let request = JSON.parse(data.request);
        let id = data.id;
        //MUST DO CHECKS FOR REAL TX AND SIGS

        this.loadService.sendRequest(request, (result) => {
          console.log(result);
          ThredMobilePlugin.sendResponse({ data: result, id });
        });

        console.log(request);
      }
    );
  }

  isLocation(locations: string[]) {
    return (
      locations.find(
        (loc) =>
          loc == window.location.pathname ||
          window.location.pathname.includes(`${loc}`)
      ) != undefined
    );
  }

  routeToAuth() {
    this._router.navigateByUrl('/auth');
  }

  routeToEdit() {
    this._router.navigateByUrl('/edit');
  }

  routetoHome() {
    this._router.navigateByUrl('/home');
  }

  routeToProfile() {
    this._router.navigateByUrl('/account'); //
  }

  routeToItem(id: string) {
    this._router.navigateByUrl(`/store/${id}`); //
  }

  routeToNetwork(id: number) {
    this._router.navigateByUrl(`/account/${id}`); //
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      // Any calls to load data go here
      event.target.complete();
    }, 2000);
  }
}
