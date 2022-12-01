import { isPlatformBrowser } from '@angular/common';
import { Inject, Pipe, PipeTransform, PLATFORM_ID } from '@angular/core';
import { LoadService } from './load.service';

@Pipe({
  name: 'addressEnsLookup',
})
export class AddressEnsLookupPipe implements PipeTransform {
  constructor(
    private loadService: LoadService,
    @Inject(PLATFORM_ID) private platformID: Object
  ) {}

  transform(value: string) {
    if (isPlatformBrowser(this.platformID)) {
      try {
        console.log(value)
        return this.loadService.providers['1']?.ethers.lookupAddress(value);
      } catch (error) {
        console.log(error);
        return null;
      }
    } else {
      return null;
    }
  }
}
