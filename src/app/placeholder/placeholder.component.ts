import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';

@Component({
  selector: 'app-placeholder',
  templateUrl: './placeholder.component.html',
  styleUrls: ['./placeholder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaceholderComponent implements OnInit {
  @Input() numberOfLines = 4;
  @Input() useGrid = false;
  constructor() {}

  ngOnInit() {}
}
