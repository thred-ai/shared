import { Pipe, PipeTransform } from '@angular/core';
import { ethers } from 'ethers';

@Pipe({
  name: 'address',
})
export class AddressPipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    trim: boolean = true,
    shorten = true
  ): string {
    if (
      value &&
      value != ethers.constants.AddressZero &&
      value != ethers.constants.HashZero
    ) {
      let val = trim ? ethers.utils.hexStripZeros(value) : value;
      return shorten
        ? val.slice(0, 5) + '...' + val.slice(val.length - 4)
        : val;
    } else if (value == '') {
      return 'Zero Address';
    }
    return 'NullAddress';
  }
}
