import { Pipe, PipeTransform } from '@angular/core';
import { ethers } from 'ethers';

@Pipe({
  name: 'formatEther'
})
export class FormatEtherPipe implements PipeTransform {

  transform(value: ethers.BigNumber) {
    return ethers.utils.formatEther(value);
  }

}
