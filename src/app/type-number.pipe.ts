import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberType'
})
export class TypeNumberPipe implements PipeTransform {

  transform(value: any): number | undefined {
    return Number(value);
  }

}
