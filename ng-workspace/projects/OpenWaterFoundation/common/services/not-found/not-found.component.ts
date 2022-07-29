import { Component,
          Input,
          OnInit } from '@angular/core';

@Component({
  selector: 'common-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {

  @Input('pageType') pageType = 'InfoMapper';

  constructor() { }

  ngOnInit(): void {
  }

}
