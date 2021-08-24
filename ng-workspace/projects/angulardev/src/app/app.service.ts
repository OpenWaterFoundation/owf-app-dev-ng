import { Injectable }       from '@angular/core';
import { HttpClient }       from '@angular/common/http';

import { Observable,
          of }              from 'rxjs';
import { OwfCommonService } from '@OpenWaterFoundation/common/services';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private http: HttpClient, private owfCommonService: OwfCommonService) { }


  /**
   * Read data asynchronously from a file or URL and return it as a JSON object.
   * @param path The path or URL to the file needed to be read
   * @returns The JSON retrieved from the host as an Observable
   */
  public getJSONData(path: string, type?: string, id?: string): Observable<any> {
    // This creates an options object with the optional headers property to add headers to the request. This could solve some
    // CORS issues, but is not completely tested yet
    // var options = {
    //   headers: new HttpHeaders({
    //     'Access-Control-Request-Method': 'GET'
    //   })
    // }
    return this.http.get<any>(path);
  }

  /**
   * Read data asynchronously from a file or URL and return it as plain text.
   * @param path The path to the file to be read, or the URL to send the GET request
   * @param type Optional type of request sent, e.g. IM.Path.cPP. Used for error handling and messaging
   * @param id Optional app-config id to help determine where exactly an error occurred
   */
  public getPlainText(path: string, type?: string, id?: string): Observable<any> {
    // This next line is important, as it tells our response that it needs to return plain text, not a default JSON object.
    const obj: Object = { responseType: 'text' as 'text' };
    return this.http.get<any>(path, obj);
  }

  /**
   * 
   */
  public async loadConfigFiles() {
    // App Configuration
    const appData = await this.http.get('assets/app/app-config.json').toPromise();
    this.owfCommonService.setAppConfig(appData);

    // Map Configuration
    // const mapData = await this.http.get('assets/app/map-config.json').toPromise();
    // this.owfCommonService.setMapConfig(mapData);
  }

  /**
   * Sanitizes the markdown syntax by checking if image links are present, and replacing them with the full path to the
   * image relative to the markdown file being displayed. This eases usability so that just the name and extension of the
   * file can be used e.g. ![Waldo](waldo.png) will be converted to ![Waldo](full/path/to/markdown/file/waldo.png)
   * @param doc The documentation string retrieved from the markdown file
   */
  // public sanitizeDoc(doc: string, pathType: string): string {
  //   // Needed for a smaller scope when replacing the image links
  //   var _this = this;
  //   // If anywhere in the documentation there exists  ![any amount of text](
  //   // then it is the syntax for an image, and the path needs to be changed
  //   if (/!\[(.*?)\]\(/.test(doc)) {
  //     // Create an array of all substrings in the documentation that match the regular expression  ](any amount of text)
  //     var allImages: string[] = doc.match(/\]\((.*?)\)/g);
  //     // Go through each one of these strings and replace each one that does not specify itself as an in-page link,
  //     // or external link
  //     for (let image of allImages) {
  //       if (image.startsWith('](#') || image.startsWith('](https') || image.startsWith('](http') || image.startsWith('](www')) {
  //         continue;
  //       } else {

  //         doc = doc.replace(image, function(word) {
  //           // Take off the pre pending ]( and ending )
  //           var innerParensContent = word.substring(2, word.length - 1);
  //           // Return the formatted full markdown path with the corresponding bracket and parentheses
  //           return '](' + _this.buildPath(pathType, [innerParensContent]) + ')';
  //         });

  //       }
  //     }
  //   }

  //   return doc;
  // }
}
