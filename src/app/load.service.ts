import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { ethers } from 'ethers';
import { environment } from 'src/environments/environment';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, DocumentData } from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { first } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import { Alchemy, AlchemyProvider } from 'alchemy-sdk';
import { BehaviorSubject, Observable } from 'rxjs';
import crypto from 'crypto';
import md5 from 'blueimp-md5';
import { AppComponent } from './app.component';
import {
  App,
  Chain,
  ERC20,
  Layout,
  NFT,
  NFTList,
  ThredCoreService,
  User,
  Wallet,
} from 'thred-core';
import { SignerService } from './signer.service';

export interface Dict<T> {
  [key: string]: T;
}

@Injectable({
  providedIn: 'root',
})
export class LoadService {
  providers: Dict<{ alchemy: Alchemy; ethers: AlchemyProvider }> = {};

  loadedChains = new BehaviorSubject<Chain[]>([]);
  loadedWallet = new BehaviorSubject<Wallet | null>(null);
  activeLayout = new BehaviorSubject<Layout | null>(null);
  loadedNFTs = new BehaviorSubject<NFT[]>([]);
  loadedUser = new BehaviorSubject<User | null>(null);

  constructor(
    @Inject(PLATFORM_ID) private platformID: Object,
    private router: Router,
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private functions: AngularFireFunctions,
    private storage: AngularFireStorage,
    public thredService: ThredCoreService,
  ) {

    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)

    // this.auth.signOut();
    this.initProviders();

    
    

  }

  installChains(getBalances = false, wallet?: string) {
    this.getChains(getBalances, wallet, (chains) => {
      (window as any).thred_chains = JSON.stringify(chains);
      // (window as any).webkit?.messageHandlers?.chains.postMessage(
      //   JSON.stringify(chains)
      // );
      console.log('CHAINS -- ' + JSON.stringify(chains));
      this.loadedChains.next(chains);
    });
  }

  decodeHex(hex: string) {
    var str = '';
    for (var n = 0; n < hex.length; n += 2) {
      str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
  }

  async sendRequest(
    data: any,
    callback: (result: string) => any = (window as any)?.reqResponse
  ) {
    try {
      let payload = data;
      // payload.id = await (window as any).thred();
      payload.wallet = this.loadedWallet.value?.id;
      console.log(JSON.stringify(payload));
      this.functions
        .httpsCallable('transact')(payload)
        .pipe(first())
        .toPromise()
        .then(async (resp) => {
          if (resp) {
            console.log(JSON.stringify(resp));

            callback(
              JSON.stringify({ success: true, error: null, data: resp })
            );
          }
        })
        .catch((error) => {
          console.log(error.message);
          callback(JSON.stringify({ success: false, error, data: null }));
        });
    } catch (error: any) {
      console.log(error.message);
      console.log(JSON.stringify(error));
      callback(JSON.stringify({ success: false, error, data: null }));
    }

    // .subscribe(
    //   async (resp) => {

    //   },
    //   (error) => {

    //   }
    // );
  }

  async initProviders() {
    let chains = Object.values(environment.rpc);
    let keys = Object.keys(environment.rpc);

    await Promise.all(
      chains.map(async (chain, index) => {
        const alchemy = new Alchemy({
          network: chain.network,
          apiKey: chain.apiKey,
          url: `${chain.prefix}${chain.apiKey}`,
        });
        this.providers[`${keys[index]}`] = {
          alchemy,
          ethers: await alchemy.config.getProvider(),
        };
      })
    );
  }

  async initializeProvider() {
    let w = window as any;
    if (w && w.ethereum) {
      const provider = new ethers.providers.Web3Provider(w.ethereum, 'any');
      // try {
      let accounts = await provider.send('eth_requestAccounts', []);
      // } catch (error: any) {
      //   console.log(error)
      //   if (error.code === 4001) {

      //     return undefined;
      //   }
      // }
      return provider;
    }

    return undefined;
  }

  async checkChain(
    chainId: number,
    provider: ethers.providers.Web3Provider,
    callback: (success: boolean) => any
  ) {
    try {
      await provider.send('wallet_switchEthereumChain', [
        { chainId: ethers.utils.hexValue(chainId) },
      ]);
      callback(true);
    } catch (error) {
      // This error code indicates that the chain has not been added to MetaMask
      let err = error as any;
      //console.log(err.message)
      callback(false);
    }
  }

  finishSignUp(
    encryption: string,
    wallet: string,
    callback: (result: { status: boolean; msg: string; hex?: any }) => any
  ) {
    this.createUser(encryption, wallet, (user, hex) => {
      if (user && hex) {
        callback({ status: true, msg: 'success', hex });
      } else {
        callback({
          status: false,
          msg: 'Something went wrong. Please try again',
        });
      }
    });
  }

  finishSignIn(
    encryption: string,
    wallet: string,
    callback: (result: { status: boolean; msg: string; hex?: any }) => any
  ) {
    this.signInUser(encryption, wallet, (user, hex) => {
      if (user && hex) {
        callback({ status: true, msg: 'success', hex });
      } else {
        callback({
          status: false,
          msg: 'Invalid Credentials. Please try again',
        });
      }
    });
  }

  finishImport(
    encryption: string,
    wallet: string,
    callback: (result: { status: boolean; msg: string; hex?: any }) => any
  ) {
    this.importUser(encryption, wallet, (user, hex) => {
      if (user && hex) {
        callback({ status: true, msg: 'success', hex });
      } else {
        callback({
          status: false,
          msg: 'Invalid Credentials. Please try again',
        });
      }
    });
  }

  finishNew(
    wallet: string,
    callback: (result: { status: boolean; msg: string; hex?: any }) => any
  ) {
    this.newUser(wallet, (user, hex) => {
      if (user && hex) {
        callback({ status: true, msg: 'success', hex });
      } else {
        callback({
          status: false,
          msg: 'Invalid Credentials. Please try again',
        });
      }
    });
  }

  finishPassReset(
    email: string,
    callback: (result: { status: boolean; msg: string }) => any
  ) {}

  openItem(id: string) {
    this.router.navigateByUrl(`/apps/${id}`);
  }

  openCategory(id: string) {
    this.router.navigateByUrl(`/groups/${id}`);
  }

  openDevProfile(id: string) {
    this.router.navigateByUrl(`/developers/${id}`);
  } //

  openAuth(id: string) {
    this.router.navigateByUrl(`/account?mode=${id}`);
  }

  openDash(id: string) {
    this.router.navigateByUrl(`/dashboard/${id}`);
  }

  openHome() {
    this.router.navigateByUrl(`/home`);
  }

  get currentUser() {
    return this.auth.authState.pipe(first()).toPromise();
  }

  async signOut(root: AppComponent, callback: (result: boolean) => any) {
    try {
      //console.log("SIGNING OUT")
      await this.auth.signOut();
      await (window as any).webkit.messageHandlers.remove_key.postMessage('');
      root.signedIn = false;
      root.uid = undefined;
      callback(true);
    } catch (error) {
      callback(false);
    }
  }

  getCoreABI(
    chainId = 1,
    callback: (result?: { address: string; abi: any[] }) => any
  ) {
    var query = this.db.collection('Protocol');

    let sub = query.valueChanges().subscribe((docs) => {
      sub.unsubscribe();
      let doc = docs[0] as DocumentData;

      if (doc) {
        let addresses = doc['Addresses'] as any[];

        let address = addresses.find((a) => a.id == chainId).address as string;

        let abi = doc['ABI'] as any[];
        callback({ address, abi });
      } else {
        callback();
      }
    });
  }

  installApp(sig: string, id: string, callback: (success: boolean) => any) {
    this.functions
      .httpsCallable('installApps')({ sig, id })
      .pipe(first())
      .subscribe(async (resp) => {
        callback(resp);
      });
  }

  async getChains(
    getBalances = false,
    wallet: string | undefined = undefined,
    callback: (result: Chain[]) => any
  ) {
    console.log('USER -- ' + JSON.stringify((await this.currentUser)?.uid));
    // let thred = (window as any)?.thred;
    this.functions
      .httpsCallable('getChainsForWallet')({
        wallet,
        getBalances,
      })
      .pipe(first())
      .subscribe(async (resp) => {
        let chains = this.thredService.syncChains(resp);
        callback(chains);
      });
  }

  async saveUserInfo(
    data: User,
    imgFile: File,
    uploadImage: boolean,
    callback: (result?: User) => any
  ) {
    let uid = data.id;
    let url = data.url;
    let name = data.name;
    let email = data.email;
    let search_name = name?.toLowerCase();

    if (uploadImage) {
      try {
        let ref = this.storage.ref(`users/${uid}/profile.png`);
        await ref.put(imgFile, { cacheControl: 'no-cache' });
        url = await ref.getDownloadURL().toPromise();
      } catch (error) {
        callback(undefined);
      }
    }

    let userInfo = {
      uid,
      url,
      name,
      email,
      search_name,
    };

    try {
      await this.db.collection('Users').doc(uid).set(userInfo, { merge: true });

      callback(new User(name, uid, [], 0, url, email, data.registeredWallets));
    } catch (error) {
      callback(undefined);
    }
  }

  // send(reqData: string) {
  //   this.functions
  //     .httpsCallable('transact')(reqData)
  //     .pipe(first())
  //     .subscribe(async (resp) => {
  //       (window as any)?.reqResponse(JSON.stringify(resp));
  //     });
  // }

  createUser(
    hex: string,
    wallet: string,
    callback: (user?: User, hex?: any) => any
  ) {
    this.functions
      .httpsCallable('createNewUser')({ id: hex, isEmail: true, wallet })
      .pipe(first())
      .subscribe(
        async (resp) => {
          if (resp as any) {
            let success = resp.success as boolean;
            if (success) {
              let userData = resp.userData as any;
              let token = resp.token as string;
              let id = resp.id as string;

              if (userData && token) {
                this.auth
                  .signInWithCustomToken(token)
                  .then((userRecord) => {
                    let user = new User(
                      userData.name,
                      userData.uid,
                      [],
                      userData.joined,
                      userData.url,
                      userData.email,
                      userData.registeredWallets
                    );
                    callback(user, id);
                  })
                  .catch((err: Error) => {
                    //console.log(err);
                    callback();
                  });
              } else {
                callback();
              }
            } else {
              callback();
            }
          } else {
            callback();
          }
        },
        (err) => {
          console.error({ err });
          callback();
        }
      );
  }

  signInUser(
    hex: string,
    wallet: string,
    callback: (user?: User, hex?: any) => any
  ) {
    this.functions
      .httpsCallable('signInUser')({ id: hex, isEmail: true, wallet })
      .pipe(first())
      .subscribe(
        async (resp) => {
          if (resp as any) {
            let success = resp.success as boolean;
            if (success) {
              let userData = resp.userData as any;
              let token = resp.token as string;
              let id = resp.id as string;

              if (userData && token && id) {
                this.auth
                  .signInWithCustomToken(token)
                  .then((userRecord) => {
                    let user = new User(
                      userData.name,
                      userData.uid,
                      [],
                      userData.joined,
                      userData.url,
                      userData.email,
                      userData.registeredWallets
                    );
                    callback(user, id);
                  })
                  .catch((err: Error) => {
                    //
                  });
              } else {
                callback();
              }
            } else {
              callback();
            }
          } else {
            callback();
          }
        },
        (err) => {
          console.error({ err });
          callback();
        }
      );
  }

  verifyUser(hex: string, callback: (user?: User, hex?: any) => any) {
    this.functions
      .httpsCallable('verifyUser')({ id: hex })
      .pipe(first())
      .subscribe(
        async (resp) => {
          if (resp as any) {
            let success = resp.success as boolean;
            if (success) {
              let userData = resp.userData as any;
              let token = resp.token as string;
              let id = resp.id as string;

              if (userData && token && id) {
                this.auth
                  .signInWithCustomToken(token)
                  .then((userRecord) => {
                    let user = new User(
                      userData.name,
                      userData.uid,
                      [],
                      userData.joined,
                      userData.url,
                      userData.email,
                      userData.registeredWallets
                    );
                    callback(user, id);
                  })
                  .catch((err: Error) => {
                    //
                  });
              } else {
                callback();
              }
            } else {
              callback();
            }
          } else {
            callback();
          }
        },
        (err) => {
          console.error({ err });
          callback();
        }
      );
  }

  importUser(
    hex: string,
    wallet: string,
    callback: (user?: User, hex?: any) => any
  ) {
    this.functions
      .httpsCallable('signInUser')({ id: hex, isEmail: false, wallet })
      .pipe(first())
      .subscribe(
        async (resp) => {
          if (resp as any) {
            let success = resp.success as boolean;
            if (success) {
              let userData = resp.userData as any;
              let token = resp.token as string;
              let id = resp.id as string;

              if (userData && token && id) {
                this.auth
                  .signInWithCustomToken(token)
                  .then((userRecord) => {
                    let user = new User(
                      userData.name,
                      userData.uid,
                      [],
                      userData.joined,
                      userData.url,
                      userData.email,
                      userData.registeredWallets
                    );
                    callback(user, id);
                  })
                  .catch((err: Error) => {
                    //
                  });
              } else {
                callback();
              }
            } else {
              callback();
            }
          } else {
            callback();
          }
        },
        (err) => {
          console.error({ err });
          callback();
        }
      );
  }

  newUser(wallet: string, callback: (user?: User, hex?: any) => any) {
    this.functions
      .httpsCallable('createNewUser')({ isEmail: false, wallet })
      .pipe(first())
      .subscribe(
        async (resp) => {
          if (resp as any) {
            let success = resp.success as boolean;
            if (success) {
              let userData = resp.userData as any;
              let token = resp.token as string;
              let id = resp.id as string;

              if (userData && token && id) {
                this.auth
                  .signInWithCustomToken(token)
                  .then((userRecord) => {
                    let user = new User(
                      userData.name,
                      userData.uid,
                      [],
                      userData.joined,
                      userData.url,
                      userData.email,
                      userData.registeredWallets
                    );
                    callback(user, id);
                  })
                  .catch((err: Error) => {
                    //console.log(err);
                    callback();
                  });
              } else {
                callback();
              }
            } else {
              callback();
            }
          } else {
            callback();
          }
        },
        (err) => {
          console.error({ err });
          callback();
        }
      );
  }

  filteredSearch: BehaviorSubject<any> = new BehaviorSubject([]);

  // search(term: string) {
  //   let sub2 = this.db
  //     .collectionGroup(`Items`, (ref) =>
  //       ref
  //         .where('search_name', '>=', term)
  //         .where('search_name', '<=', term + '\uf8ff')
  //         .limit(3)
  //     )
  //     .valueChanges()
  //     .subscribe((docs2) => {
  //       sub2.unsubscribe();
  //       let returnVal: any[] = [];

  //       (docs2 as App[])?.forEach((d: App) => {
  //         returnVal.push({
  //           name: d.name,
  //           type: 1,
  //           img: d.displayUrls[0],
  //           id: d.id,
  //         });
  //       });

  //       let sub3 = this.db
  //         .collectionGroup(`Users`, (ref) =>
  //           ref
  //             .where('search_name', '>=', term)
  //             .where('search_name', '<=', term + '\uf8ff')
  //             .limit(3)
  //         )
  //         .valueChanges()
  //         .subscribe((docs3) => {
  //           sub3.unsubscribe();
  //           (docs3 as any[])?.forEach((d: any) => {
  //             returnVal.push({
  //               name: d.name,
  //               type: 0,
  //               img: d.url,
  //               id: d.uid,
  //             });
  //           });
  //           this.filteredSearch.next(returnVal);
  //         });
  //     });
  // }

  getItem(id: string, callback: (result?: App) => any, getProfiles = false) {
    let sub2 = this.db
      .collectionGroup(`Items`, (ref) => ref.where('id', '==', id))
      .valueChanges()
      .subscribe((docs2) => {
        sub2.unsubscribe();

        let docs_2 = docs2 as any[];

        let d = docs_2[0];

        if (d) {
          let util = d as App;

          // d.chains.forEach((c: any, i: number) => {
          //   d.chains[i] = this.chains.find((x) => x.id == c);
          // });
          if (getProfiles) {
            // this.getUserInfo(d.creator, false, false, (result) => {
            //   if (result) {
            //     util.creatorName = result.name;
            //   }
            //   callback(util);
            // });
          } else {
            callback(util);
          }
        } else {
          callback(undefined);
        }
      });
  }

  getItems(ids: string[], callback: (result?: App[]) => any) {
    ids = ids.concat('0');

    let sub2 = this.db
      .collectionGroup(`Items`, (ref) => ref.where('id', 'in', ids))
      .valueChanges()
      .subscribe((docs3) => {
        let docs = docs3 as DocumentData[];

        let result: App[] = [];

        docs.forEach((d) => {
          let util = d as App;

          // util.chains.forEach((c: any, i: number) => {
          //   util.chains[i] = this.chains.find((x) => x.id == c)!;
          // });

          result.push(util);
        });
        callback(result);
      });
  }

  get newAppID() {
    return this.db.createId();
  }

  getFeaturedItem(callback: (result?: App) => any) {
    let sub2 = this.db
      .collectionGroup(`Engage`)
      .valueChanges()
      .subscribe((docs2) => {
        sub2.unsubscribe();

        let docs_2 = docs2 as any[];

        let d = docs_2[0];

        if (d) {
          let featured = d['Featured'] as string;
          this.getItem(
            featured,
            (result) => {
              callback(result);
            },
            true
          );
        } else {
          callback(undefined);
        }
      });
  }

  getUserInfo(
    uid: string,
    walletId: string,
    fetchItems = true,
    fetchOnlyAvailableItems = true,
    callback: (result?: User) => any
  ) {
    var query = this.db
      .collection('Users')
      .doc(uid)
      .collection('Accounts', (ref) => ref.where('wallet', '==', walletId));

    let sub = query.valueChanges().subscribe(async (docs) => {
      let doc = docs[0] as DocumentData;

      if (doc) {
        let name = doc['name'] as string;
        let email = doc['email'] as string;
        let joined = doc['joined'] as number;
        let uid = doc['uid'] as string;
        let address = doc['address'] as string;
        let url = doc['url'] as string;
        let registeredWallets = doc['registeredWallets'] as string[];
        let myUID = (await this.currentUser)?.uid;
        if (isPlatformBrowser(this.platformID) && uid == myUID) {
          localStorage['url'] = url;
          localStorage['name'] = name;
          localStorage['email'] = email;
        }
        let developer = new User(
          name,
          address,
          [],
          joined,
          url,
          email,
          registeredWallets
        );

        if (fetchItems) {
          let q = this.db.collection(`Users/${uid}/Items`);

          if (fetchOnlyAvailableItems) {
            q = this.db.collection(`Users/${uid}/Items`, (ref) =>
              ref.where('status', '==', 0)
            );
          }
          let sub2 = q.valueChanges().subscribe((docs2) => {
            let docs_2 = docs2 as any[];

            docs_2.forEach((d) => {
              // d.chains.forEach((c: any, i: number) => {
              //   d.chains[i] = this.chains.find((x) => x.id == c);
              // });
            });
            developer.apps = (docs_2 as App[]) ?? [];

            callback(developer);
            sub2.unsubscribe();
          });
        } else {
          callback(developer);
        }
      } else {
        callback(undefined);
      }
      sub.unsubscribe();
    });
  }

  encryptData(data: any, pass?: string) {
    try {
      let key = pass ? md5(pass) : environment.hashkey.split('_');

      const algorithm = 'aes-256-cbc';

      const initVector = crypto.pseudoRandomBytes(16); //

      const Securitykey = Buffer.from(key);

      const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);

      let encryptedData = cipher.update(data, 'utf8', 'hex');
      //
      encryptedData += cipher.final('hex');
      return { d: encryptedData, v: initVector.toString('hex') };
    } catch (error) {
      //console.log(JSON.stringify(error));
      return undefined;
    }
  }


  getTokensForNetwork(
    chain: number,
    address: string,
    callback: (tokens?: ERC20[]) => any
  ) {
    try {
      this.functions
        .httpsCallable('getTokensForNetwork')({ chain, address })
        .pipe(first())
        .toPromise()
        .then((tokens) => {
          if (tokens) {
            //
            callback(
              tokens.map(
                (token: any) =>
                  new ERC20(
                    token.address,
                    token.url,
                    token.name,
                    token.symbol,
                    ethers.BigNumber.from(token.balance ?? '0x0'),
                    token.decimal,
                    token.price
                  )
              ) as ERC20[]
            );
          }
        })
        .catch((error) => {
          console.log(error.message);
          callback();
        });
    } catch (error: any) {
      console.log(error.message);
      console.log(JSON.stringify(error));
      callback();
    }
  }

  async loadNFTs(nftList: NFTList, callback: (nfts: NFT[]) => any) {
    this.functions
      .httpsCallable('getNFTsForWallet')({ nftList })
      .pipe(first())
      .subscribe(
        async (resp) => {
          console.log(resp);
          callback(resp);
        },
        (err) => {
          console.error({ err });
          callback([]);
        }
      );
  }

  async loadNFTsByWallet(uid: string, callback: (nfts: NFT[]) => any) {
    if (uid) {
      this.functions
        .httpsCallable('getNFTsByWallet')({ uid })
        .pipe(first())
        .subscribe(
          async (resp) => {
            console.log(resp);
            callback(resp);
          },
          (err) => {
            console.error({ err });
            callback([]);
          }
        );
    } else {
      callback([]);
    }
  }
  //
  getWallet(
    id: string,
    callback: (result?: Wallet) => any,
    getProfiles = false
  ) {
    console.log(id);

    this.functions
      .httpsCallable('getWallet')({ id })
      .pipe(first())
      .subscribe(
        async (resp) => {
          // this.loadedChains.next(resp);
          console.log('chains oy');
          let util = this.thredService.syncWallet(
            resp,
            this.loadedChains.value
          );

          callback(util);
        },
        (err) => {
          console.error({ err });
          callback(undefined);
        }
      );
  }
}
