import { Component, ViewChild } from '@angular/core';
import { initializeApp } from '@angular/fire/app';
import { ActivatedRoute, Router } from '@angular/router';
import { ethers } from 'ethers';
import { ButterflyComponent } from './butterfly/butterfly.component';
import { LoadService } from './load.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = '';
  signedIn?: Boolean;
  uid?: string

  tabs = [
    {
      name: 'Discover',
      icon: 'search',
      link: '/store',
      hide: "0x54Da21443C8D97B3aac5067Fd0B21c359D343Ea2"
    },
    {
      name: 'My Apps',
      icon: 'apps',
      link: '/home',
      hide: "0x54Da21443C8D97B3aac5067Fd0B21c359D343Ea2",
    },
    {
      name: 'Account',
      icon: 'account_balance_wallet',
      link: '/account',
      hide: null
    },
  ];

  constructor(
    private router: ActivatedRoute,
    private _router: Router,
    private loadService: LoadService
  ) {}

  toHex(str: string) {
    var result = '';
    for (var i = 0; i < str.length; i++) {
      result += str.charCodeAt(i).toString(16);
    }
    return result;
  }

  @ViewChild(ButterflyComponent) butterfly?: ButterflyComponent;

  async ngOnInit() {
    document.body.classList.add('bar');

    if ((window as any).newInstance ?? false) {
      this.butterfly?.beginFlyAnimation();
    }
  }

  async initApp(title = "App") {


    let url =
      window.location.pathname == '/' ? '/home' : window.location.pathname;

    this.title = this.tabs.find((tab) => tab.link == url)?.name ?? title;
    let uid = (await this.loadService.currentUser)?.uid
    this.signedIn = uid != undefined;
    this.uid = uid
  }

  isLocation(locations: string[]) {
    return (
      locations.find((loc) => loc == window.location.pathname || window.location.pathname.includes(`${loc}`)) != undefined
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
    this._router.navigateByUrl(`/network/${id}`); //
  }
}
