import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'noImage'
})
export class NoImagePipe implements PipeTransform {

  transform(value: string, photoToDisplay?: string): string {
    if (!value) {
      // Verifica si contiene un valor la imagen
      let urlToDisplay: string = './assets/images/notavailable-194.jpg';
      if (photoToDisplay) {
        urlToDisplay = photoToDisplay;
      }
      return urlToDisplay;
    } else {
      return value;
    }
  }

}
