import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numValue'
})
export class NumValuePipe implements PipeTransform {

  transform(value: any): number | undefined {
    try {
      return Number(value)
    } catch (error) {
      return undefined;
    }
  }

}
