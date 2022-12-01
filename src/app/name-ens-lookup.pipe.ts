import { isPlatformBrowser } from '@angular/common';
import { Inject, Pipe, PipeTransform, PLATFORM_ID } from '@angular/core';
import { LoadService } from './load.service';

@Pipe({
  name: 'nameEnsLookup',
})
export class NameEnsLookupPipe implements PipeTransform {
  constructor(private loadService: LoadService, @Inject(PLATFORM_ID) private platformID: Object) {}

  transform(value: string) {
    if (isPlatformBrowser(this.platformID)){
      try {
        return (this.loadService.providers["1"].ethers.resolveName(value))
      } catch (error) {
        return null
      }
    }
    return null
  }
}
