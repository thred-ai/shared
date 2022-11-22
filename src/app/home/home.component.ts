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
    var fly = document.getElementById('fly');

    fly!.classList.add("grow")

    return true
  }

  initFly() {
    var fly = document.getElementById('flyRing');
    fly!.classList.remove('border');

    let bottomBarHeight = window.innerHeight / 10;

    setTimeout(() => {
      fly!.style.left = window.innerWidth / 2 - 155 / 2 + 'px';
      fly!.style.top =
        document.body.scrollHeight - 155 - bottomBarHeight + 'px';
    }, 0);
  }

  async ngOnInit() {

    document.addEventListener('mousemove', function (e) {
      var fly = document.getElementById('flyRing');

      fly!.style.left = e.pageX - 77.5 + 'px';
      fly!.style.top = e.pageY - 77.5 + 'px';

      var cursor = document.getElementById('cursor');
      cursor!.style.display = 'block';

      cursor!.style.left = e.pageX + 'px';
      cursor!.style.top = e.pageY + 'px';

      setTimeout(() => {
        cursor!.style.display = 'none';
      }, 1000);
    });

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
