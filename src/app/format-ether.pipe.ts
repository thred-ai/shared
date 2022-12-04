import { Pipe, PipeTransform } from '@angular/core';
import { ethers } from 'ethers';

@Pipe({
  name: 'formatEther'
})
export class FormatEtherPipe implements PipeTransform {

  transform(value: ethers.BigNumber, decimal: number = 4) {
    return Number(ethers.utils.formatEther(value)).toFixed(decimal);
  }

}
