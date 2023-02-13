import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { User } from 'thred-core';
import { first } from 'rxjs/operators';
import { AppComponent } from './app.component';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private auth: AngularFireAuth,
    private functions: AngularFireFunctions
  ) {}

  get currentUser() {
    return this.auth.authState.pipe(first()).toPromise();
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

  createUser(
    hex: string,
    wallet: string,
    callback: (user?: User, hex?: any) => any
  ) {
    console.log("create")
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
    console.log("sign in")
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
    console.log("verify")
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
    console.log("import")
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
    console.log("new")
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
}
