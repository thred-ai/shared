import { Component, OnInit, ViewChild } from '@angular/core';
import { ethers } from 'ethers';
import { AppComponent } from '../app.component';
import { App } from '../app.model';
import { ButterflyComponent } from '../butterfly/butterfly.component';
import { LoadService } from '../load.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(private loadService: LoadService, private root: AppComponent) {}

  @ViewChild(ButterflyComponent) butterfly?: ButterflyComponent;

  

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
      (await this.loadService.currentUser)?.uid;
    if (signedInUser) {
      await this.loadService.initProviders();

      if ((window as any).newInstance ?? false){
        this.butterfly?.beginFlyAnimation()
      }

      this.loadApps(signedInUser);//
    }
  }

  apps?: App[];

  openApp(app: App) {
    console.log(app);
    (window as any)?.openApp(JSON.parse(JSON.stringify(app)))
  }

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
              this.butterfly?.initFly()
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
