import { Component, OnInit, Input, ViewChild, ViewContainerRef, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Badge } from './Badge';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent implements OnInit {

  @Input() id: number;

  private text = "";
  @ViewChild('template', {static: false}) set someDummySetterName(theElementRef: ElementRef) {
    console.log(theElementRef);
    this.text = theElementRef.nativeElement.textContent.replace(/#/g,"\n");
    this.changeDetector.detectChanges();
  }

  constructor(private changeDetector: ChangeDetectorRef) { }

  ngOnInit() {

  }

  ngAfterContentInit() {
    this.changeDetector.detectChanges();
  }

  ngAfterViewInit() {
    this.changeDetector.detectChanges();
  }
}