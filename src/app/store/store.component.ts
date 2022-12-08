import { Component, OnInit } from '@angular/core';
import { ethers } from 'ethers';
import { AppComponent } from '../app.component';
import { App } from '../app.model';
import { LoadService } from '../load.service';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss'],
})
export class StoreComponent implements OnInit {
  apps?: App[];
  loading = false;

  constructor(private root: AppComponent, private loadService: LoadService) {}

  async ngOnInit() {
    this.root.initApp();
    let signedInUser = (await this.loadService.currentUser)?.uid;
    if (signedInUser) {
      this.loading = true;
      await this.loadService.initProviders();
      this.loadService.getNewItems((apps) => {
        setTimeout(() => {
          this.loading = false;
          this.apps = apps ?? [];
        }, 500);
      });
    } else {
      this.root.routeToAuth();
    }
  }

  openApp(app: App) {
    this.root.routeToItem(app.id);
  }
}
