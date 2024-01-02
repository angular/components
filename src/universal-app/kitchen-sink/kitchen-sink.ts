import {A11yModule, FocusMonitor} from '@angular/cdk/a11y';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ScrollingModule, ViewportRuler} from '@angular/cdk/scrolling';
import {CdkTableModule, DataSource} from '@angular/cdk/table';
import {Component, ElementRef, InjectionToken, inject} from '@angular/core';
import {MatRippleModule, provideNativeDateAdapter} from '@angular/material/core';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatTableModule} from '@angular/material/table';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDialog} from '@angular/material/dialog';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSliderModule} from '@angular/material/slider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatBottomSheetModule, MatBottomSheet} from '@angular/material/bottom-sheet';
import {MatBadgeModule} from '@angular/material/badge';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSortModule} from '@angular/material/sort';
import {MatStepperModule} from '@angular/material/stepper';
import {YouTubePlayer} from '@angular/youtube-player';
import {
  GoogleMap,
  MapBicyclingLayer,
  MapCircle,
  MapGroundOverlay,
  MapHeatmapLayer,
  MapInfoWindow,
  MapKmlLayer,
  MapMarker,
  MapMarkerClusterer,
  MapPolygon,
  MapPolyline,
  MapRectangle,
  MapTrafficLayer,
  MapTransitLayer,
} from '@angular/google-maps';
import {Observable, of as observableOf} from 'rxjs';
import {DOCUMENT} from '@angular/common';

export class TableDataSource extends DataSource<any> {
  connect(): Observable<any> {
    return observableOf([{userId: 1}, {userId: 2}]);
  }

  disconnect() {}
}

export const AUTOMATED_KITCHEN_SINK = new InjectionToken<boolean>('AUTOMATED_KITCHEN_SINK');

@Component({
  template: `<button>Do the thing</button>`,
  standalone: true,
})
export class TestEntryComponent {}

@Component({
  selector: 'kitchen-sink',
  templateUrl: './kitchen-sink.html',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  styles: `
    .universal-viewport {
      height: 100px;
      border: 1px solid black;
    }
  `,
  imports: [
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDividerModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatExpansionModule,
    MatSortModule,
    MatTableModule,
    MatStepperModule,
    ScrollingModule,

    // CDK Modules
    CdkTableModule,
    DragDropModule,
    A11yModule,

    // Other modules
    YouTubePlayer,
    GoogleMap,
    MapBicyclingLayer,
    MapCircle,
    MapGroundOverlay,
    MapHeatmapLayer,
    MapInfoWindow,
    MapKmlLayer,
    MapMarker,
    MapMarkerClusterer,
    MapPolygon,
    MapPolyline,
    MapRectangle,
    MapTrafficLayer,
    MapTransitLayer,
  ],
})
export class KitchenSink {
  /** List of columns for the CDK and Material table. */
  tableColumns = ['userId'];

  /** Data source for the CDK and Material table. */
  tableDataSource = new TableDataSource();

  /** Data used to render a virtual scrolling list. */
  virtualScrollData = Array(10000).fill(50);

  /** Whether the kitchen sink is running as a part of an automated test or for local debugging. */
  isAutomated: boolean;

  constructor(
    private _snackBar: MatSnackBar,
    private _dialog: MatDialog,
    viewportRuler: ViewportRuler,
    focusMonitor: FocusMonitor,
    elementRef: ElementRef<HTMLElement>,
    private _bottomSheet: MatBottomSheet,
  ) {
    this.isAutomated = inject(AUTOMATED_KITCHEN_SINK, {optional: true}) ?? true;
    focusMonitor.focusVia(elementRef, 'program');

    // Do a sanity check on the viewport ruler.
    viewportRuler.getViewportRect();
    viewportRuler.getViewportSize();
    viewportRuler.getViewportScrollPosition();

    // Only open overlays when automation is enabled since they can prevent debugging.
    if (this.isAutomated) {
      inject(DOCUMENT).body.classList.add('test-automated');
      this.openSnackbar();
      this.openDialog();
      this.openBottomSheet();
    }
  }

  openSnackbar() {
    this._snackBar.open('Hello there');
  }

  openDialog() {
    this._dialog.open(TestEntryComponent);
  }

  openBottomSheet() {
    this._bottomSheet.open(TestEntryComponent);
  }
}
