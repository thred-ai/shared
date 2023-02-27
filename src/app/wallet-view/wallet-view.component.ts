import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  App,
  Chain,
  Dict,
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
import { SafeArea } from 'capacitor-plugin-safe-area';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { AuthService } from '../auth.service';
import { ThredMobilePlugin } from 'src/ThredCorePlugin';

@Component({
  selector: 'app-wallet-view',
  templateUrl: './wallet-view.component.html',
  styleUrls: ['./wallet-view.component.scss'],
})
//@ts-ignore
export class WalletViewComponent implements OnInit {
  constructor(
    private loadService: LoadService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private root: AppComponent,
    private cdr: ChangeDetectorRef
  ) {}

  activeWallet?: Wallet;
  user?: User;
  layout: 'mobile' | 'desktop' | 'tablet' = 'mobile';

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
        console.log(this.layout);
        this.activeLayout = this.activeWallet.activeLayouts[this.layout];
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
    // (window as any).webkit.messageHandlers.vibrate.postMessage({});
    this.vibrate();
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
    } else if (event.type == 'new_account') {
      this.authDetails.loading = true;

      this.handleNewAccount((result) => {
        this.authDetails.loading = false;

        if (result.status) {
        } else {
          this.authDetails.err = result.msg;
        }
      });
    } else if (event.type == 'import_account') {
      this.authDetails.loading = true;

      this.handleImport(event.data, (result) => {
        this.authDetails.loading = false;

        if (result.status) {
        } else {
          this.authDetails.err = result.msg;
        }
      });
    }
  }

  initializeUser(hex: string) {
    this.signedIn = true;
    // if ((window as any).registerKey) {
    //   (window as any).registerKey(hex);
    // }
    // (window as any).thred = function(){
    //   return Promise.resolve(hex)
    // }
    this.initLoad();
  }

  async vibrate() {
    await Haptics.impact({ style: ImpactStyle.Medium });
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

      this.authService.finishSignUp(hex, this.activeWallet?.id, (result) => {
        if (result.status && result.hex) {
          this.initializeUser(result.hex);
        }
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
        this.authService.finishSignIn(hex, this.activeWallet?.id, (result) => {
          if (result.status && result.hex) {
            this.initializeUser(result.hex);
            // this.root.routeToProfile();
          }
          callback(result);
        });
      }
    } //
  }

  private handleImport(
    authData: any,
    callback: (result: { status: boolean; msg: string }) => any
  ) {
    let key = authData['key'];

    let data = this.loadService.encryptData(`$${JSON.stringify({ key })}$`);
    //
    if (data) {
      let d = data.d;
      let v = data.v;

      let hex = `${v}.${d}`;

      if (this.activeWallet) {
        this.authService.finishImport(hex, this.activeWallet?.id, (result) => {
          if (result.status && result.hex) {
            this.initializeUser(result.hex);
          }
          callback(result);
        });
      }
    } //
  }

  private handleNewAccount(
    callback: (result: { status: boolean; msg: string }) => any
  ) {
    if (this.activeWallet) {
      this.authService.finishNew(this.activeWallet?.id, (result) => {
        if (result.status && result.hex) {
          this.initializeUser(result.hex);
          // this.root.routeToProfile();
        }
        callback(result);
      });
    }
  }

  private handlePassReset(
    authData: any,
    callback: (result: { status: boolean; msg: string }) => any
  ) {
    let email = authData['email'];
  }

  safeAreaTop = 0;
  safeAreaBottom = 0;

  async ngOnInit() {
    let insets = (await SafeArea.getSafeAreaInsets()).insets;

    this.safeAreaBottom = insets.bottom;

    this.safeAreaTop = (await SafeArea.getStatusBarHeight()).statusBarHeight;

    this.setListeners();

    // (window as any).webkit?.messageHandlers.colors.postMessage(body);

    let id = await this.getId();

    this.loadService.loadedChains.subscribe((chains) => {
      this.chains = chains ?? [];
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
          // this.loadService.loadedWallet.next(this.activeWallet);
        }
      }
    });
    this.loadService.loadedWallet.subscribe(async (wallet) => {
      if (wallet) {
        this.loading = false;
        // await Preferences.set({key: 'layout', value: 'desktop'})
        // const { value } = await Preferences.get({ key: 'layout' });
        // console.log("LAYOUT -- " + value)
        this.layout = 'mobile';

        this.wallet = wallet;
        let user = await this.authService.currentUser;
        if (user) {
          this.signedIn = true;
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
          this.signedIn = false;
        }
      }
    });

    this.loadService.loadedNFTs.subscribe((nfts) => {
      this.loadedNFTs = nfts;
    });
    this.loadService.loadedUser.subscribe(async (user) => {
      this.signedIn = user != null;
      this.user = user ?? undefined;
      if (user && this.activeWallet) {
        this.loadService.installChains(true, this.activeWallet.id);
        this.loadService.loadNFTsByWallet(user.id, (nfts) => {
          this.loadService.loadedNFTs.next(nfts ?? []);
        });
      } else {
        this.loadService.installChains(false);
      }
    });
  }

  handleClick(event: { type: number; data: any }) {
    if (event.type == 8 && event.data) {
      this.root.openApp(event.data, {
        bottom: this.safeAreaBottom,
        top: this.safeAreaTop,
      });
    }
  }

  async initLoad() {
    if (this.activeWallet)
      this.loadService.loadedWallet.next(this.activeWallet);
  }

  async setListeners() {
    await ThredMobilePlugin.addListener('newTransaction', async (data: any) => {
      let request = JSON.parse(data.request);
      let id = data.id;
      //MUST DO CHECKS FOR REAL TX AND SIGS
      console.log(JSON.stringify(request));

      let tx = this.evalTx(request);
      if (tx.sig) {
        console.log('CONFIRM');
        this.txData = {
          data: request,
          handler: async (confirmed) => {
            if (confirmed) {
              this.loadService.sendRequest(request, async (result) => {
                ThredMobilePlugin.toggleAppVisible({ visible: true });
                ThredMobilePlugin.sendResponse({ data: result, id });
                this.txData = undefined;
              });
            } else {
              ThredMobilePlugin.toggleAppVisible({ visible: true });
              ThredMobilePlugin.sendResponse({ data: null, id });
              this.txData = undefined;
            }
          },
        };
        this.cdr.detectChanges();

        setTimeout(() => {
          ThredMobilePlugin.toggleAppVisible({ visible: false });
        }, 500);
      } else {
        console.log('NO CONFIRM');
        this.loadService.sendRequest(request, (result) => {
          ThredMobilePlugin.sendResponse({ data: result, id });
        });
      }
    });
  }

  txData?: {
    data: any;
    handler: (confirmed: boolean) => any;
  };

  evalTx(request: Dict<any>) {
    let method = request['method'] as string;
    let params = request['params'] as any[];

    switch (method) {
      case 'personal_sign':
        return { sig: true, params };
      case 'eth_signTypedData_v4':
        return { sig: true, params };
      case 'eth_sendTransaction':
        return { sig: true, params };
      default:
        return { sig: false, params };
    }
  }

  signOut(){
    this.authService.signOut(this.root, finished => {
      this.signedIn = false
    })
  }
}
