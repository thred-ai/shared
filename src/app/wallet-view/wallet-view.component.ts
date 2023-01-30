import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  App,
  Chain,
  Layout,
  Media,
  NFT,
  NFTList,
  Page,
  User,
  Wallet,
} from 'thred-core';
import { AppComponent } from '../app.component';
import { LoadService } from '../load.service';

@Component({
  selector: 'app-wallet-view',
  templateUrl: './wallet-view.component.html',
  styleUrls: ['./wallet-view.component.scss'],
})
export class WalletViewComponent implements OnInit {
  constructor(
    private loadService: LoadService,
    private route: ActivatedRoute,
    private router: Router,
    private root: AppComponent
  ) {}

  activeWallet?: Wallet;
  user?: User;

  activeLayout?: Layout;

  signedIn = false;

  loading = false;

  loadedNFTs: NFT[] = [];

  set wallet(value: Wallet) {
    this.activeWallet = value;

    this.authDetails.authStyle = value.authStyle;
    this.authDetails.name = value.name;
    this.authDetails.displayUrl = new Media(
      'profile',
      value.displayUrl,
      'image/png',
      undefined,
      new Date().getTime(),
      75,
      75
    );

    if (value) {
      try {
        this.activeLayout = this.activeWallet.activeLayouts['mobile'];
        console.log(JSON.stringify(this.activeLayout));
        const pageIndex = Number(
          this.route.snapshot.queryParamMap.get('page') ?? 0
        );
        this.page = {
          page: this.activeLayout.pages[pageIndex],
          index: pageIndex,
        };

        // this.refreshNFTS();
      } catch (error) {
        console.log(JSON.stringify((error as any).message));
      }
    }
  }
  chains?: Chain[];

  activePage?: {
    page: Page;
    index: number;
  };

  set page(value: { page: Page; index: number }) {
    this.activePage = value;
    this.appendTabToUrl(value.index);
    // this.changeColor('#33FFEE')
    this.updatePageColors(
      this.signedIn || this.loading ? value.page : this.activeLayout?.authPage
    );
  }

  appendTabToUrl(index = 0) {
    this.router.navigate([], {
      queryParams: {
        page: index,
      },
      queryParamsHandling: 'merge',
    });
  }

  reload() {
    (window as any).webkit.messageHandlers.vibrate.postMessage({});

    setTimeout(() => {
      window.location.reload();
    }, 1000); //
  }

  async refreshNFTS() {
    if (this.activeLayout) {
      await Promise.all(
        this.activeLayout.pages?.map((page) => {
          if (page.blocks) {
            return Promise.all(
              page.blocks!.map((block) => {
                if (block.type == 0) {
                  return this.loadService.loadNFTs(block.nftList, (nfts) => {
                    block.nftList.nfts = nfts;
                  });
                } else {
                  return Promise.resolve(undefined);
                }
              })
            );
          } else {
            return Promise.resolve(undefined);
          }
        })
      );
    }
  }

  updatePageColors(page = this.activePage?.page) {
    if (page) {
      if ((window as any)?.webkit?.messageHandlers?.colors) {
        let body = JSON.stringify({
          bar: page.bar.visible
            ? page.bar.backgroundColor
            : page.backgroundColor,
          tab:
            page.type == 0 || page.type == 2
              ? page.tab.backgroundColor
              : page.backgroundColor,
          page: page.backgroundColor,
        });
        (window as any).webkit.messageHandlers.colors.postMessage(body);
      }
    }
  }

  async getId() {
    const routeParams = this.route.snapshot.paramMap;
    const id = routeParams.get('id') as string;

    return id;
  }

  pageChanged(index: number | any, page = this.activeLayout?.pages[index]) {
    if (page && index > -1) {
      this.page = {
        page,
        index,
      };
    }
  }

  authDetails: {
    authStyle: number;
    name: string;
    displayUrl: Media | undefined;
    loading: boolean;
    err: string;
  } = {
    authStyle: 0,
    name: '',
    displayUrl: undefined,
    loading: false,
    err: '',
  };

  parseAuth(event: { type: string; data: any } | any) {
    // this.authDetails
    console.log(event);
    if (event.type == 'error') {
      this.authDetails.err = event.data;
    } else if (event.type == 'sign_in') {
      this.authDetails.loading = true;

      this.handleSignIn(event.data, (result) => {
        this.authDetails.loading = false;
        if (result.status) {
          console.log('SUCCESS');
        } else {
          this.authDetails.err = result.msg;
        }
      });
    } else if (event.type == 'sign_up') {
      this.authDetails.loading = true;

      this.handleSignUp(event.data, (result) => {
        this.authDetails.loading = false;
        if (result.status) {
          console.log('SUCCESS');
        } else {
          this.authDetails.err = result.msg;
        }
      });
    } else if (event.type == 'pass_reset') {
      this.handlePassReset(event.data, (result) => {
        if (result.status) {
        } else {
          this.authDetails.err = result.msg;
        }
      });
    }
  }

  initializeUser(hex: string) {
    this.signedIn = true;
    if ((window as any).registerKey) {
      (window as any).registerKey(hex);
    }
    this.initLoad();
  }

  private handleSignUp(
    authData: any,
    callback: (result: { status: boolean; msg: string }) => any
  ) {
    let email = authData['email'];
    let pass = authData['pass'];

    let data = this.loadService.encryptData(
      `$${JSON.stringify({ email, pass })}$`
    );

    if (data && this.activeWallet) {
      let d = data.d;
      let v = data.v;

      let hex = `${v}.${d}`;

      this.loadService.finishSignUp(hex, this.activeWallet?.id, (result) => {
        this.initializeUser(hex);
        // this.root.routeToProfile();
        callback(result);
      });
    }
  }

  private handleSignIn(
    authData: any,
    callback: (result: { status: boolean; msg: string }) => any
  ) {
    let email = authData['email'];
    let pass = authData['pass'];

    let data = this.loadService.encryptData(
      `$${JSON.stringify({ email, pass })}$`
    );
    //
    if (data) {
      let d = data.d;
      let v = data.v;

      let hex = `${v}.${d}`;

      if (this.activeWallet) {
        this.loadService.finishSignIn(hex, this.activeWallet?.id, (result) => {
          this.initializeUser(hex);
          // this.root.routeToProfile();
          callback(result);
        });
      }
    } //
  }

  private handlePassReset(
    authData: any,
    callback: (result: { status: boolean; msg: string }) => any
  ) {
    let email = authData['email'];
  }

  async ngOnInit() {

    let body = JSON.stringify({
      reset: true,
    });
    (window as any).webkit?.messageHandlers.colors.postMessage(body);

    console.log('ello');
    let id = await this.getId();
    console.log(id);

    this.loadService.loadedChains.subscribe((chains) => {
      this.chains = chains ?? [];
      console.log(this.chains);
      if (chains.length > 0) {
        if (this.activeWallet == undefined) {
          this.loadService.getWallet(id, (wallet) => {
            if (wallet) {
              this.loadService.loadedWallet.next(wallet);
            }
          });
        } else {
          let walletChains = this.activeWallet.chains.map((c) => c.id);
          this.activeWallet.chains = this.loadService.thredService.syncChains(
            chains,
            walletChains
          );
          this.loadService.loadedWallet.next(this.activeWallet);
        }
      }
    });
    this.loadService.loadedWallet.subscribe(async (wallet) => {
      if (wallet) {

        this.loading = true;
        
        console.log('oy');
        console.log(JSON.stringify(wallet.chains));

        var hex: string | undefined = undefined;
        if ((window as any)?.thred) {
          hex = (await (window as any)?.thred()) as string;
        }
        console.log('HEX');
        if (hex) {
          // this.butterfly?.addRing();
          this.loadService.finishSignIn(hex, wallet.id, async (result) => {
            this.signedIn = true;
            this.loading = false;
            this.wallet = wallet;
            let user = await this.loadService.currentUser;

            if (user) {
              console.log('LOADING USER');
              this.loadService.getUserInfo(
                user.uid,
                wallet.id,
                false,
                false,
                (user) => {
                  this.loadService.loadedUser.next(user ?? null);
                }
              );
            } else {
              console.log('NO USER');
            }
          });
        } else {
          console.log('OUT');
          this.signedIn = false; //
          this.loading = false;
          this.wallet = wallet;
          this.updatePageColors(this.activeLayout?.authPage);
        }

        this.loadService.loadNFTsByWallet((nfts) => {
          this.loadService.loadedNFTs.next(nfts ?? []);
        });
      }
    });
    this.loadService.loadedNFTs.subscribe((nfts) => {
      this.loadedNFTs = nfts;
    });
    this.loadService.loadedUser.subscribe(async (user) => {
      this.signedIn = user != null;
      this.user = user ?? undefined;
      if (user && this.activeWallet) {
        console.log('LOADING CHAIN BALANCE');
        this.loadService.installChains(true, this.activeWallet.id);
      } else {
        console.log('LOADING CHAINS');
        this.loadService.installChains(false);
      }
    });
  }

  handleClick(event: { type: number; data: any }) {
    console.log('oy');
    console.log(JSON.stringify(event));
    if (event.type == 8 && event.data) {
      (window as any)?.openApp(JSON.parse(JSON.stringify(event.data)));
    }
  }

  async initLoad() {
    if (this.activeWallet)
      this.loadService.loadedWallet.next(this.activeWallet);
  }
}
