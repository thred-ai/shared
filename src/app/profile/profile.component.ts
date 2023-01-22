import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from 'thred-core';
import { AppComponent } from '../app.component';
import { LoadService } from '../load.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {

  
  constructor(
    private fb: FormBuilder,
    private loadService: LoadService,
    private root: AppComponent
  ) {
    if (!(window as any).user){
      this.root.routeToProfile()
    }
    else{
      this.profileForm.controls['url'].setValue({
        url: (window as any).user?.url ? (window as any).user?.url : null,
        file: null,
        changed: false,
      });
      this.profileForm.controls['name'].setValue((window as any).user?.name);
      this.profileForm.controls['email'].setValue((window as any).user?.email);
      this.profileForm.controls['email'].disable()

    }
  }

  profileForm = this.fb.group({
    name: [null, Validators.required],
    url: [{ url: null, file: null, changed: false }, Validators.required],
    email: [null, Validators.required],
  });

  loading = false;


  async fileChangeEvent(event: any): Promise<void> {

    let file = event.target.files[0];

    let buffer = await file.arrayBuffer();

    var blob = new Blob([buffer]);

    var reader = new FileReader();
    reader.onload = (event: any) => {
      var base64 = event.target.result;
      this.profileForm.controls['url'].setValue({
        url: base64,
        file,
        changed: true,
      });
    };

    reader.readAsDataURL(blob);

  }

  save() {
    if (this.profileForm.valid) {
      this.loading = true;
      let name = this.profileForm.controls['name'].value;
      let img = this.profileForm.controls['url'].value;
      let url = img.url;
      let uploadImage = img.changed;
      let file = img.file as File;

      let uid = (window as any).user?.id;
      let email = this.profileForm.controls['email'].value;

      let user = new User(name, uid, [], 0, url, email, [])
      this.loadService.saveUserInfo(user, file, uploadImage, (result) => {
        this.loading = false;
        if (result) {
          this.root.routeToProfile()
        } else {
        }
      });
    }
  }

  ngOnInit(): void {}
}
