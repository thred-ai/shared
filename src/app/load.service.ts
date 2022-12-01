import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { ethers } from 'ethers';
import { environment } from 'src/environments/environment';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, DocumentData } from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { User } from './user.model';
import { first } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import { Alchemy, AlchemyProvider } from 'alchemy-sdk';
import { App } from './app.model';
import { Chain } from './chain.model';
import { Category } from './category.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import crypto from 'crypto';
import { Meta, Title } from '@angular/platform-browser';
import md5 from 'blueimp-md5';

export interface Dict<T> {
  [key: string]: T;
}

@Injectable({
  providedIn: 'root',
})
export class LoadService {
  providers: Dict<{ alchemy: Alchemy; ethers: AlchemyProvider }> = {};

  chains = [
    new Chain('Ethereum', 1, 'ETH'),
    new Chain('Polygon', 137, 'MATIC'),
    new Chain('Ethereum Goerli', 5, 'ETH'),
    new Chain('Polygon Mumbai', 80001, 'MATIC'),
  ];

  loadedChains = new BehaviorSubject<Chain[]>([])

  constructor(
    @Inject(PLATFORM_ID) private platformID: Object,
    private router: Router,
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private functions: AngularFireFunctions,
    private storage: AngularFireStorage
  ) {
    this.initProviders();
    let appSigner = this.getSigner(0);
    let walletSigner = this.getSigner(1);

    (window as any).thred_request = this.thred_request;
    (window as any).webkit.messageHandlers.signers.postMessage(appSigner);

    this.getChains(chains => {
      (window as any).thred_chains = JSON.stringify(chains);
      (window as any).webkit?.messageHandlers?.chains.postMessage(JSON.stringify(chains));
      this.loadedChains.next(chains)
    })

    eval(walletSigner);

    this.setRequest();
  }

  decodeHex(hex: string) {
    var str = '';
    for (var n = 0; n < hex.length; n += 2) {
      str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
  }

  async setRequest() {
    (window as any).sendRequest = async (
      data: string,
      callback: (result: string | null) => any = (window as any)?.reqResponse
    ) => {
      try {
        let payload = JSON.parse(data);
        console.log(await (window as any).thred());
        payload.id = await (window as any).thred();
        this.functions
          .httpsCallable('transact')(payload)
          .pipe(first())
          .toPromise()
          .then((resp) => {
            console.log(
              'RESP -- ' +
                payload.method +
                ' -- ' +
                JSON.stringify({ success: true, error: null, data: resp })
            );
            if (resp) {
              callback(
                JSON.stringify({ success: true, error: null, data: resp })
              );
            }
          })
          .catch((error) => {
            console.log(
              'ERR -- ' +
                payload.method +
                ' -- ' +
                JSON.stringify({ success: false, error, data: null })
            );
            callback(JSON.stringify({ success: false, error, data: null }));
          });
      } catch (error: any) {
        console.log(error.message)
        console.log(JSON.stringify(error));
        callback(null);
      }
    };

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
    console.log(this.providers);
  }

  async initializeProvider() {
    let w = window as any;
    if (w && w.ethereum) {
      const provider = new ethers.providers.Web3Provider(w.ethereum, 'any');
      // try {
      let accounts = await provider.send('eth_requestAccounts', []);
      console.log(accounts);
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

  async checkChain(chainId: number, provider: ethers.providers.Web3Provider, callback: (success: boolean) => any) {
    let network = await provider.getNetwork();
    console.log(network);
    if (network.chainId !== chainId) {
      try {
        await provider.send('wallet_switchEthereumChain', [
          { chainId: ethers.utils.hexValue(chainId) },
        ]);
        callback(true)
      } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask
        let err = error as any;
        console.log(err.message)
        callback(false)
      }
    }
  }

  finishSignUp(
    encryption: string,
    callback: (result: { status: boolean; msg: string }) => any
  ) {
    this.createUser(encryption, (user) => {
      if (user) {
        callback({ status: true, msg: 'success' });
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
    callback: (result: { status: boolean; msg: string }) => any
  ) {
    this.signInUser(encryption, (user) => {
      if (user) {
        callback({ status: true, msg: 'success' });
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

  async signOut(callback: (result: boolean) => any) {
    try {
      console.log("SIGNING OUT")
      await this.auth.signOut();
      await (window as any).webkit.messageHandlers.remove_key.postMessage("")
      console.log("SIGNED OUT")
      callback(true);
    } catch (error) {
      callback(false);
    }
  }

  loadNetworks(callback: (result: boolean) => any) {}

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

  installApp(sig: string, id: string, callback: (success: boolean) => any){
    this.functions
      .httpsCallable('installApps')({sig, id})
      .pipe(first())
      .subscribe(async (resp) => {
        console.log("SUCCESS -- " + JSON.stringify(resp));
        callback(resp)
      });
  }

  getChains(callback: (result: Chain[]) => any) {
    var query = this.db.collection('Networks');

    let sub = query.valueChanges().subscribe((docs) => {
      sub.unsubscribe();
      let doc = docs as DocumentData[];

      if (doc) {
        var chains: Chain[] = [];
        doc.forEach((d) => {
          let chain = new Chain(
            d['name'] as string,
            d['id'] as number,
            d['symbol'] as string,
            !(d['main'] as boolean)
          );
          chains.push(chain);
        });
        callback(chains);
      } else {
        callback([]);
      }
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

      callback(new User(name, uid, [], 0, url, email));
    } catch (error) {
      callback(undefined);
    }
  }

  send(reqData: string) {
    console.log('sending request from thred');
    this.functions
      .httpsCallable('transact')(reqData)
      .pipe(first())
      .subscribe(async (resp) => {
        console.log(resp);
        (window as any)?.reqResponse(JSON.stringify(resp));
      });
  }

  createUser(hex: string, callback: (user?: User) => any) {
    this.functions
      .httpsCallable('createNewUser')({ id: hex })
      .pipe(first())
      .subscribe(
        async (resp) => {
          if (resp as any) {
            let success = resp.success as boolean;
            if (success) {
              let userData = resp.userData as any;
              let token = resp.token as string;

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
                      userData.email
                    );
                    callback(user);
                  })
                  .catch((err: Error) => {
                    console.log(err);
                    callback();
                  });
              } else {
                callback();
              }
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

  signInUser(hex: string, callback: (user?: User) => any) {
    this.functions
      .httpsCallable('signInUser')({ id: hex })
      .pipe(first())
      .subscribe(
        async (resp) => {
          if (resp as any) {
            let success = resp.success as boolean;
            if (success) {
              let userData = resp.userData as any;
              let token = resp.token as string;

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
                      userData.email
                    );
                    callback(user);
                  })
                  .catch((err: Error) => {
                    //
                  });
              } else {
                callback();
              }
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

  search(term: string) {
    let sub2 = this.db
      .collectionGroup(`Items`, (ref) =>
        ref
          .where('search_name', '>=', term)
          .where('search_name', '<=', term + '\uf8ff')
          .limit(3)
      )
      .valueChanges()
      .subscribe((docs2) => {
        sub2.unsubscribe();
        let returnVal: any[] = [];

        (docs2 as App[])?.forEach((d: App) => {
          returnVal.push({
            name: d.name,
            type: 1,
            img: d.displayUrls[0],
            id: d.id,
          });
        });

        let sub3 = this.db
          .collectionGroup(`Users`, (ref) =>
            ref
              .where('search_name', '>=', term)
              .where('search_name', '<=', term + '\uf8ff')
              .limit(3)
          )
          .valueChanges()
          .subscribe((docs3) => {
            sub3.unsubscribe();
            (docs3 as any[])?.forEach((d: any) => {
              returnVal.push({
                name: d.name,
                type: 0,
                img: d.url,
                id: d.uid,
              });
            });
            this.filteredSearch.next(returnVal);
          });
      });
  }

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

          d.chains.forEach((c: any, i: number) => {
            d.chains[i] = this.chains.find((x) => x.id == c);
          });
          if (getProfiles) {
            this.getUserInfo(d.creator, false, false, (result) => {
              if (result) {
                util.creatorName = result.name;
              }
              callback(util);
            });
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
        console.log('moy');
        let docs = docs3 as DocumentData[];

        let result: App[] = [];

        console.log(docs);

        docs.forEach((d) => {
          let util = d as App;
          console.log(d);

          util.chains.forEach((c: any, i: number) => {
            util.chains[i] = this.chains.find((x) => x.id == c)!;
          });

          result.push(util);
        });
        callback(result);
      });
  }

  getNewItems(callback: (result: App[]) => any) {
    this.db
      .collectionGroup('Items', (ref) =>
        ref.where('status', '==', 0).orderBy('created', 'desc')
      )
      .valueChanges()
      .subscribe((docs) => {
        let docs_2 = (docs as App[]) ?? [];
        docs_2.forEach((d, index) => {
          d.chains.forEach((c: any, i: number) => {
            d.chains[i] = this.chains.find((x) => x.id == c)!;
          });
          if (d.creatorName == 'thred' || (d.creatorName ?? "").trim() == ""){
            d.creatorName = "Utility"
          }
        });
        callback(docs_2);
      });
  }

  getPopularItems(callback: (result: App[]) => any) {
    this.db
      .collectionGroup('Items', (ref) =>
        ref.where('status', '==', 0).orderBy('views', 'desc')
      )
      .valueChanges()
      .subscribe((docs) => {
        let docs_2 = (docs as any[]) ?? [];
        docs_2.forEach((d, index) => {
          d.chains.forEach((c: any, i: number) => {
            d.chains[i] = this.chains.find((x) => x.id == c);
          });
        });
        callback(docs_2);
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
    fetchItems = true,
    fetchOnlyAvailableItems = true,
    callback: (result?: User) => any
  ) {
    var query = this.db.collection('Users', (ref) =>
      ref.where(firebase.firestore.FieldPath.documentId(), '==', uid)
    );

    let sub = query.valueChanges().subscribe(async (docs) => {
      let doc = docs[0] as DocumentData;

      if (doc) {
        let name = doc['name'] as string;
        let email = doc['email'] as string;
        let joined = doc['joined'] as number;
        let uid = doc['uid'] as string;
        let url = doc['url'] as string;
        let myUID = (await this.currentUser)?.uid;
        if (isPlatformBrowser(this.platformID) && uid == myUID) {
          localStorage['url'] = url;
          localStorage['name'] = name;
          localStorage['email'] = email;
        }
        let developer = new User(name, uid, [], joined, url, email);

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
              d.chains.forEach((c: any, i: number) => {
                d.chains[i] = this.chains.find((x) => x.id == c);
              });
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
      console.log(JSON.stringify(error));
      return undefined;
    }
  }

  decryptData(data: any, vector: any, key = environment.hashkey.split('_')) {
    const algorithm = 'aes-256-cbc';

    const Securitykey = Buffer.from(key);

    const decipher = crypto.createDecipheriv(algorithm, Securitykey, vector);

    let decryptedData = decipher.update(data, 'hex', 'utf8');

    decryptedData += decipher.final('utf8');

    return decryptedData;
  }

  thred_request = async (data: string) => {
    console.log('DATA -- ' + data);
    return new Promise(async (resolve, reject) => {
      let result = await (
        window as any
      ).webkit.messageHandlers.thred_request.postMessage(data);
      console.log('RESULT -- ' + result);
      if (result == '"rejected"') {
        console.log('REJECTING');
        resolve(result);
      } else {
        console.log('PROCESSING');
        (window as any).sendRequest(data, resolve);
      }
    });
  };

  getSigner(mode = 0) {
    let requestMethod =
      mode == 0
        ? 'window.webkit.messageHandlers.thred_request.postMessage(JSON.stringify(data))'
        : 'window.thred_request(JSON.stringify(data))';
    return `


window.ethereum = {
    
    chainId: "0x89",
    
    networkVersion: "137",

    isMetaMask:true,
    isBraveWallet:true,

    selectedAddress:null,

    enable: async function(){
        var data = {method: "eth_accounts", params: [], chainId: window.ethereum.networkVersion}
        console.log("CONNECTING")
        let returnData = JSON.parse(await ${requestMethod})
        window.ethereum.selectedAddress = returnData[0];
        return Promise.resolve(str);
    },

    isConnected:function(){
        console.log("checking connection");
        return Promise.resolve(true);
    },

    _metamask:{
      isUnlocked: function(){ return true }
    },

    send: function(method, params){
        console.log(method);
    },
    _sendSync: function(req){
        console.log(req);
    },
    sendAsync: function(req, callback){
        console.log(req);
    },
    publicKey: function(){
        console.log("public key")
    },
    signMessage: function(){
        console.log("sign message")
    },
    connect: function(req){
        console.log("connet message")
    },
    request: async function(req) {
        let method = (req.method);
        let params = (req.params);

        console.log(req)

        if (method === 'eth_chainId') {
            return Promise.resolve(this.chainId);
        }
        else if (method === 'wallet_switchEthereumChain'){
            let chain = params.find((p) => p)?.chainId ?? '0x1';
            console.log(chain)
            this.chainId = chain;
            this.networkVersion = String(parseInt(chain, 16))
            console.log("CHANGED -- " + window.ethereum.networkVersion)

            return null;
        }
        else{
            var data = {method, params, chainId: window.ethereum.networkVersion}

            if (method === 'personal_sign'){
                data.params[0] = params[0].slice(2)
            }
            else if (method === 'eth_sendTransaction'){
                let value = data.params[0].value ?? "0x0"
                data.displayValue = String(parseInt(value, 16)/1000000000000000000)
                console.log("CHAINS -- " + window.thred_chains)
                data.symbol = JSON.parse(window.thred_chains ?? '[]')?.find(c => String(c.id) == String(data.chainId))?.currency ?? "ETH"
            }
   
            let returnData = JSON.parse(await ${requestMethod})

            if (returnData == "rejected"){
                console.log("ERR")
                const err = new Error()
                err.message = "User rejected the request."
                err.code = 4001
           
                throw err
                
            }
            else if (returnData.success == false && returnData.error != null){
                console.log("ERR")
                const err = new Error()
                err.message = returnData.error.message
                err.code = returnData.error.code
                throw err
            }
            if (method == "eth_requestAccounts" || method == "eth_accounts"){
              window.ethereum.selectedAddress = returnData[0];
            }
            console.log("FINAL -- " + JSON.stringify(returnData.data))
            return Promise.resolve(returnData.data)
        }
        return null;
    }

}

`;
  }
}
