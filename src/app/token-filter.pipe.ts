import { Pipe, PipeTransform } from '@angular/core';
import { ERC20 } from 'thred-core';

@Pipe({
  name: 'tokenFilter'
})
export class TokenFilterPipe implements PipeTransform {

  transform(value: ERC20[], onlyListed: boolean = true) {
    if (onlyListed){
      return value.filter(token => token.rates['usd'] > 0)?? []
    }
    else{
      return value ?? [];
    }
  }

}
