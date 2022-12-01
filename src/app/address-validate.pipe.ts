import { isPlatformBrowser } from '@angular/common';
import { Inject, Pipe, PipeTransform, PLATFORM_ID } from '@angular/core';
import { ethers } from 'ethers';

@Pipe({
  name: 'addressValidate',
})
export class AddressValidatePipe implements PipeTransform {
  constructor(@Inject(PLATFORM_ID) private platformID: Object){}
  transform(value: string) {
    if (isPlatformBrowser(this.platformID)){
      try {
        let address = ethers.utils.isAddress(value);
        return address;
      } catch (error) {
        return false;
      }
    }
    return false
  }
}
