import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isLocation'
})
export class IsLocationPipe implements PipeTransform {

  transform(value: string) {
    return window.location.pathname == value;
  }

}
