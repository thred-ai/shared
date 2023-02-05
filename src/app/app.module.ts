import { NgModule, CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {
  ANIMATION_MODULE_TYPE,
  BrowserAnimationsModule,
} from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../environments/environment';
// import { Globals } from './globals';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DragScrollModule } from 'ngx-drag-scroll';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { InViewportModule } from 'ng-in-viewport';
import { MatSelectModule } from '@angular/material/select';
import { HttpClientModule } from '@angular/common/http';
// import { ApplicationPipesModule } from './shared/applicationPipes.module';
import {
  AngularFireFunctionsModule,
  AngularFireFunctions,
} from '@angular/fire/compat/functions';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { LazyLoadImageModule } from 'ng-lazyload-image'; // <-- include ScrollHooks
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgRouterOutletCommModule } from 'ng-router-outlet-comm';
import { MdbAccordionModule } from 'mdb-angular-ui-kit/accordion';
import { MdbCarouselModule } from 'mdb-angular-ui-kit/carousel';
import { MdbCheckboxModule } from 'mdb-angular-ui-kit/checkbox';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';
import { MdbDropdownModule } from 'mdb-angular-ui-kit/dropdown';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { MdbModalModule } from 'mdb-angular-ui-kit/modal';
import { MdbPopoverModule } from 'mdb-angular-ui-kit/popover';
import { MdbRadioModule } from 'mdb-angular-ui-kit/radio';
import { MdbRangeModule } from 'mdb-angular-ui-kit/range';
import { MdbRippleModule } from 'mdb-angular-ui-kit/ripple';
import { MdbScrollspyModule } from 'mdb-angular-ui-kit/scrollspy';
import { MdbTabsModule } from 'mdb-angular-ui-kit/tabs';
import { MdbTooltipModule } from 'mdb-angular-ui-kit/tooltip';
import { MdbValidationModule } from 'mdb-angular-ui-kit/validation';
import { MatTableModule } from '@angular/material/table';
import {
  DefaultMatCalendarRangeStrategy,
  MatDatepickerModule,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
} from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgxCurrencyModule } from 'ngx-currency';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AddressEnsLookupPipe } from './address-ens-lookup.pipe';
import { AddressValidatePipe } from './address-validate.pipe';
import { NameEnsLookupPipe } from './name-ens-lookup.pipe';
import { IsLocationPipe } from './is-location.pipe';
import { ProfileComponent } from './profile/profile.component';
import {ClipboardModule} from '@angular/cdk/clipboard';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NetworkComponent } from './network/network.component';
import { FirstLetterPipe } from './first-letter.pipe';
import { WalletViewComponent } from './wallet-view/wallet-view.component';
import { SafeUrlPipe } from './safe-url.pipe';
import { TokenFilterPipe } from './token-filter.pipe';
import { NumValuePipe } from './num-value.pipe';
import { CollectionCarouselComponent } from './collection-carousel/collection-carousel.component';
import { TransactionDialogComponent } from './transaction-dialog/transaction-dialog.component';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import { ThredCoreModule } from 'thred-core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    // ButterflyComponent,
    ProfileComponent,
    WalletViewComponent,
    AddressEnsLookupPipe,
    AddressValidatePipe,
    NameEnsLookupPipe,
    IsLocationPipe,
    NetworkComponent,
    FirstLetterPipe,
    NumValuePipe,
    SafeUrlPipe,
    TokenFilterPipe,
    CollectionCarouselComponent,
    TransactionDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    MatTooltipModule,
    BrowserAnimationsModule,
    ClipboardModule,
    MatToolbarModule,
    MatIconModule,
    AngularFireModule.initializeApp(environment.firebase),
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    DragScrollModule,
    MatDialogModule,
    MatBottomSheetModule,
    MatSnackBarModule,
    InViewportModule,
    HttpClientModule,
    FormsModule,
    NgxCurrencyModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatChipsModule,
    AngularFireFunctionsModule,
    VgCoreModule,
    VgControlsModule,
    VgBufferingModule,
    VgOverlayPlayModule,
    LazyLoadImageModule,
    MatSidenavModule,
    MatTabsModule,
    MatTableModule,
    MatNativeDateModule,
    ScrollingModule,
    NgRouterOutletCommModule,
    MdbAccordionModule,
    MdbCarouselModule,
    MdbCheckboxModule,
    MdbCollapseModule,
    MdbDropdownModule,
    MdbFormsModule,
    MdbModalModule,
    MdbPopoverModule,
    MdbRadioModule,
    MdbRangeModule,
    MdbRippleModule,
    MdbScrollspyModule,
    MdbTabsModule,
    MdbTooltipModule,
    MdbValidationModule,
    MatDatepickerModule,
    MatPaginatorModule,
    ThredCoreModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    // Globals,
    // { provide: USE_FUNCTIONS_EMULATOR, useValue: !environment.production ? ['localhost', 4000] : undefined },
    { provide: LOCALE_ID, useValue: 'en-US' },
    { provide: ANIMATION_MODULE_TYPE, useValue: 'NoopAnimations' },
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: DefaultMatCalendarRangeStrategy,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(router: Router, functions: AngularFireFunctions, auth: AngularFireAuth) {
    // functions.useEmulator('localhost', 5001)
    // auth.useEmulator('localhost')

  }
}
