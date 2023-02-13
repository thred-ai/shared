import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { ethers } from 'ethers';
import { environment } from 'src/environments/environment';
import { AngularFirestore, DocumentData } from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { first } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import { Alchemy, AlchemyProvider } from 'alchemy-sdk';
import { BehaviorSubject, Observable } from 'rxjs';
import crypto from 'crypto';
import md5 from 'blueimp-md5';
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
import { AuthService } from './auth.service';

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
    private db: AngularFirestore,
    private functions: AngularFireFunctions,
    private storage: AngularFireStorage,
    public thredService: ThredCoreService,
    private authService: AuthService,
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


  async getChains(
    getBalances = false,
    wallet: string | undefined = undefined,
    callback: (result: Chain[]) => any
  ) {
    console.log("chains")
    console.log(getBalances)
    console.log(wallet)

    // let thred = (window as any)?.thred;
    this.functions
      .httpsCallable('getChainsForWallet')({
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
        let myUID = (await this.authService.currentUser)?.uid;
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
    console.log("nfts")
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
    console.log("nfts wallet")
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
    console.log("wallet");

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
