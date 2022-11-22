import { Component, OnInit } from '@angular/core';
import { ethers } from 'ethers';
import { AppComponent } from '../app.component';
import { App } from '../app.model';
import { LoadService } from '../load.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(private loadService: LoadService, private root: AppComponent) {}

  tapedTwice = false;

  clickedFly() {
    if (!this.tapedTwice) {
      this.tapedTwice = true;
      setTimeout(() => {
        this.tapedTwice = false;
      }, 300);
      return false;
    }
    // do something
    this.initFly();

    return true;
  }

  initFly() {
    var fly = document.getElementById('flyRing');
    this.beginFlyAnimation()

    let bottomBarHeight = window.innerHeight / 10;

    setTimeout(() => {
      fly!.style.left = window.innerWidth / 2 - 155 / 2 + 'px';
      fly!.style.top =
        document.body.scrollHeight - 155 - bottomBarHeight + 'px';

      setTimeout(() => {
        this.endFlyAnimation()
      }, 2000);
    }, 0);
  }

  beginFlyAnimation() {
    var fly = document.getElementById('flyRing');

    var fly2 = document.getElementById('fly');

    fly!.classList.remove('border');


    fly2!.classList.remove('fly2');
    fly2!.classList.add('fly');//
  }

  endFlyAnimation() {
    // var fly = document.getElementById('flyRing');

    var fly2 = document.getElementById('fly');

    // fly!.classList.add('border');

    fly2!.classList.remove('fly');
    fly2!.classList.add('fly2');
  }

  async ngOnInit() {
    // document.addEventListener('mousemove', (e) => {
    //   this.beginFlyAnimation()
    //   var fly = document.getElementById('flyRing');

    //   fly!.style.left = e.pageX - 77.5 + 'px';
    //   fly!.style.top = e.pageY - 77.5 + 'px';

    //   var cursor = document.getElementById('cursor');
    //   cursor!.style.display = 'block';

    //   cursor!.style.left = e.pageX + 'px';
    //   cursor!.style.top = e.pageY + 'px';

    //   setTimeout(() => {
    //     cursor!.style.display = 'none';
    //     this.endFlyAnimation()
    //   }, 2000);
    // });

    let signedInUser =
      (await this.loadService.currentUser)?.uid ??
      '0xd31c54eFD3A4B5E6a993AaA4618D3700a12ff752';
    if (signedInUser) {
      await this.loadService.initProviders();
      this.loadApps(signedInUser);
    }
  }

  apps?: App[];

  openApp() {}

  loadApps(
    user: string,
    chainId = 137,
    provider = this.loadService.providers[chainId].ethers
  ) {
    // this.loading = true;
    this.loadService.getCoreABI(chainId, async (result) => {
      if (result) {
        let abi = result.abi;
        let address = result.address;

        try {
          let contract = new ethers.Contract(address, abi, provider);

          let data = (await contract['fetchAppsForUser'](user)) as string[];

          let filtered = [...new Set(data.filter((d) => d != ''))];

          this.loadService.getNewItems((apps) => {
            // this.loading = false;
            // this.mode = 1;

            //
            setTimeout(() => {
              this.apps = apps ?? [];
              this.initFly();
            }, 500);
          });
        } catch (error) {
          // this.loading = false;
          // this.mode = 1;
          this.apps = [];
        }
      }
    });
  }
}
