import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadService } from './load.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = '';

  tabs = [
    {
      name: 'Discover',
      icon: 'search',
      link: '/store',
    },
    {
      name: 'My Apps',
      icon: 'apps',
      link: '/home',
    },
    {
      name: 'Account',
      icon: 'account_balance_wallet',
      link: '/account',
    },
  ];

  constructor(private router: ActivatedRoute, private loadService: LoadService) {
    console.log((window as any).authToken)
  }

  ngOnInit() {
    document.body.classList.add("bar")
    let url =
      window.location.pathname == '/' ? '/home' : window.location.pathname;
    console.log(url);

    this.title = this.tabs.find((tab) => tab.link == url)?.name ?? '';
  }
}
