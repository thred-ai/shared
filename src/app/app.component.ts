import { Component, ViewChild } from '@angular/core';
import { initializeApp } from '@angular/fire/app';
import { ActivatedRoute, Router } from '@angular/router';
import { ethers } from 'ethers';
import ThredSigner from 'src/signer/signer.model';
import { ThredMobilePlugin } from 'src/ThredCorePlugin';
import { App } from 'thred-core';
import { Dict, LoadService } from './load.service';
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

  constructor(
    private router: ActivatedRoute,
    private _router: Router,
    private loadService: LoadService,
    private signerService: SignerService
  ) {}

  async openApp(data: App, margins: Dict<any>) {
    if (this.loadService.loadedChains.value) {
      let injectedSigner = (await this.signerService.getSigner(
        0,
        this.loadService.loadedChains.value,
        data.defaultChain ?? 1
      )) as string;
      if (injectedSigner) {
        ThredMobilePlugin.openApp(
          JSON.parse(JSON.stringify({ app: data, signer: injectedSigner, margins }))
        );
      }
    }
  }

  async ngOnInit() {
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
