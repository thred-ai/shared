import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppComponent } from '../app.component';
import { ButterflyComponent } from '../butterfly/butterfly.component';
import { LoadService } from '../load.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit, OnDestroy {
  mode = 3;
  loading = false;
  isAuth = true;

  err?: string;

  signUpForm = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, Validators.required],
    confirmPass: [null, Validators.required],
  });

  signInForm = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, Validators.required],
  });

  passResetForm = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
  });

  @ViewChild(ButterflyComponent) butterfly?: ButterflyComponent;

  constructor(
    private fb: FormBuilder,
    private loadService: LoadService,
    private root: AppComponent,
    @Inject(PLATFORM_ID) private platformID: Object
  ) {}

  continue() {
    this.loading = true;
    this.beginAuth(async (result) => {
      this.loading = false;
      if (result.status) {
        let user = await this.loadService.currentUser;
        if (user) {
          // this.loadService.openDash(user.uid);
        }
      } else {
        this.err = result.msg;
      }
    });
  }

  private beginAuth(
    callback: (result: { status: boolean; msg: string }) => any
  ) {
    var form: FormGroup;

    switch (this.mode) {
      case 0:
        form = this.signUpForm;

        let conditions0 = [
          {
            condition: (form.controls['password'].value.length ?? 0) >= 6,
            msg: 'Password not long enough',
          },
          {
            condition:
              form.controls['password'].value ==
              form.controls['confirmPass'].value,
            msg: 'Passwords do not match',
          },
        ];
        let isValid0 = this.validateForm(form, conditions0);

        if (isValid0.status) {
          this.handleSignUp(form, (result) => {
            callback(result);
          });
        } else {
          callback(isValid0);
        }
        return;
      case 1:
        form = this.signInForm;
        let conditions1 = [
          {
            condition: (form.controls['password'].value.length ?? 0) >= 6,
            msg: 'Invalid password',
          },
        ];
        let isValid1 = this.validateForm(form, conditions1);
        if (isValid1.status) {
          this.handleSignIn(form, (result) => {
            callback(result);
          });
        } else {
          callback(isValid1);
        }
        return;
      case 2:
        form = this.passResetForm;
        let isValid2 = this.validateForm(form);
        if (isValid2.status) {
          this.handlePassReset(form, (result) => {
            callback({ status: false, msg: 'Check your email for a link!' });
          });
        } else {
          callback(isValid2);
        }
        return;
      default:
        return;
    }
  }

  private validateForm(
    form: FormGroup,
    extra: { condition: boolean; msg: string }[] = []
  ) {
    let invalidConditions = extra.filter((val) => val.condition == false);
    if (form.valid && invalidConditions.length == 0) {
      return { status: true, msg: '' };
    } else {
      if (!form.valid) {
        return { status: false, msg: 'Missing required fields' };
      } else if (invalidConditions.length > 0) {
        return {
          status: false,
          msg: invalidConditions.map((c) => c.msg).join(', '),
        };
      }
      return { status: false, msg: 'Missing required fields' };
    }
  }

  private handleSignUp(
    form: FormGroup,
    callback: (result: { status: boolean; msg: string }) => any
  ) {
    let email = form.controls['email'].value;
    let pass = form.controls['password'].value;

    let data = this.loadService.encryptData(
      `$${JSON.stringify({ email, pass })}$`
    );

    if (data) {
      let d = data.d;
      let v = data.v;

      let hex = `${v}.${d}`;

      this.loadService.finishSignUp(hex, (result) => {
        (window as any).newInstance = true;
        (window as any).registerKey(hex);
        this.root.routeToProfile();
        callback(result);
      });
    }
  }

  private handleSignIn(
    form: FormGroup,
    callback: (result: { status: boolean; msg: string }) => any
  ) {
    let email = form.controls['email'].value;
    let pass = form.controls['password'].value;

    let data = this.loadService.encryptData(
      `$${JSON.stringify({ email, pass })}$`
    );
    //
    if (data) {
      let d = data.d;
      let v = data.v;

      let hex = `${v}.${d}`;

      this.loadService.finishSignIn(hex, (result) => {
        (window as any).newInstance = true;
        (window as any).registerKey(hex);
        this.root.routeToProfile();
        callback(result);
      });
    } //
  }

  private handlePassReset(
    form: FormGroup,
    callback: (result: { status: boolean; msg: string }) => any
  ) {
    let email = form.controls['email'].value;
  }

  ngOnDestroy(): void {
    window.onclick = null;
  }

  async ngOnInit() {
    let hex = (await (window as any)?.thred()) as string;

    if (hex) {
      this.mode = 3;
      this.butterfly?.addRing();
      this.loadService.finishSignIn(hex, (result) => {
        (window as any).newInstance = true;
        (window as any).registerKey(hex);
        this.root.routeToProfile();
      });
    } else {
      this.mode = 0;
    }
    //
    window.onclick = (e) => {
      if (isPlatformBrowser(this.platformID)) {
        if ((e.target as any).id != 'continue') {
          this.err = undefined;
        }
      }
    };
  }
}
