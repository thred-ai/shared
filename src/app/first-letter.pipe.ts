import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstLetter'
})
export class FirstLetterPipe implements PipeTransform {

  transform(value: string, index: number = 0, capitalize: boolean = true) {
    let sub = value.charAt(index)
    return capitalize ? sub.toUpperCase() : capitalize;
  }

}
