/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewChild,
  inject,
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  GoogleMap,
  MapAdvancedMarker,
  MapBicyclingLayer,
  MapCircle,
  MapDirectionsRenderer,
  MapDirectionsService,
  MapGroundOverlay,
  MapHeatmapLayer,
  MapInfoWindow,
  MapKmlLayer,
  MapPolygon,
  MapPolyline,
  MapRectangle,
  MapTrafficLayer,
  MapTransitLayer,
  MapMarkerClusterer,
} from '@angular/google-maps';

const POLYLINE_PATH: google.maps.LatLngLiteral[] = [
  {lat: 25, lng: 26},
  {lat: 26, lng: 27},
  {lat: 30, lng: 34},
];

const POLYGON_PATH: google.maps.LatLngLiteral[] = [
  {lat: 20, lng: 21},
  {lat: 22, lng: 23},
  {lat: 24, lng: 25},
];

const RECTANGLE_BOUNDS: google.maps.LatLngBoundsLiteral = {
  east: 30,
  north: 15,
  west: 10,
  south: -5,
};

const CIRCLE_CENTER: google.maps.LatLngLiteral = {
  lat: 19,
  lng: 20,
};
const CIRCLE_RADIUS = 500000;

let apiLoadingPromise: Promise<unknown> | null = null;

/** Demo Component for @angular/google-maps/map */
@Component({
  selector: 'google-map-demo',
  templateUrl: 'google-map-demo.html',
  styleUrl: 'google-map-demo.css',
  imports: [
    GoogleMap,
    MapBicyclingLayer,
    MapCircle,
    MapDirectionsRenderer,
    MapGroundOverlay,
    MapHeatmapLayer,
    MapInfoWindow,
    MapKmlLayer,
    MapMarkerClusterer,
    MapAdvancedMarker,
    MapPolygon,
    MapPolyline,
    MapRectangle,
    MapTrafficLayer,
    MapTransitLayer,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoogleMapDemo {
  private readonly _mapDirectionsService = inject(MapDirectionsService);

  @ViewChild(MapPolyline) polyline: MapPolyline;
  @ViewChild(MapPolygon) polygon: MapPolygon;
  @ViewChild(MapRectangle) rectangle: MapRectangle;
  @ViewChild(MapCircle) circle: MapCircle;
  readonly cdr = inject(ChangeDetectorRef);

  center = {lat: 24, lng: 12};
  mapAdvancedMarkerPosition = {lat: 22, lng: 21};
  markerPositions: google.maps.LatLngLiteral[] = [];
  zoom = 4;
  display?: google.maps.LatLngLiteral;
  isPolylineDisplayed = false;
  polylineOptions: google.maps.PolylineOptions = {
    path: POLYLINE_PATH,
    strokeColor: 'grey',
    strokeOpacity: 0.8,
  };

  heatmapData = this._getHeatmapData(5, 1);
  heatmapOptions = {radius: 50};
  isHeatmapDisplayed = false;

  isPolygonDisplayed = false;
  polygonOptions: google.maps.PolygonOptions = {
    paths: POLYGON_PATH,
    strokeColor: 'grey',
    strokeOpacity: 0.8,
  };
  isRectangleDisplayed = false;
  rectangleOptions: google.maps.RectangleOptions = {
    bounds: RECTANGLE_BOUNDS,
    strokeColor: 'grey',
    strokeOpacity: 0.8,
  };
  isCircleDisplayed = false;
  circleOptions: google.maps.CircleOptions = {
    center: CIRCLE_CENTER,
    radius: CIRCLE_RADIUS,
    strokeColor: 'grey',
    strokeOpacity: 0.8,
  };

  isGroundOverlayDisplayed = false;
  hasLoaded = false;
  groundOverlayImages = [
    {
      title: 'Red logo',
      url: 'https://angular.io/assets/images/logos/angular/angular.svg',
    },
    {
      title: 'Black logo',
      url: 'https://angular.io/assets/images/logos/angular/angular_solidBlack.svg',
    },
  ];
  groundOverlayUrl = this.groundOverlayImages[0].url;
  groundOverlayBounds = RECTANGLE_BOUNDS;
  isKmlLayerDisplayed = false;
  demoKml =
    'https://developers.google.com/maps/documentation/javascript/examples/kml/westcampus.kml';
  isTrafficLayerDisplayed = false;
  isTransitLayerDisplayed = false;
  isBicyclingLayerDisplayed = false;
  hasCustomContentMarker = false;
  // This is necessary for testing advanced markers. It seems like any value works locally.
  mapId = '123';

  mapTypeId: google.maps.MapTypeId;
  mapTypeIds = ['hybrid', 'roadmap', 'satellite', 'terrain'] as google.maps.MapTypeId[];

  directionsResult?: google.maps.DirectionsResult;

  constructor() {
    this._loadApi();
  }

  authFailure() {
    console.log('Auth failure event emitted');
  }

  handleClick(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.markerPositions.push(event.latLng.toJSON());
    }
  }

  handleMove(event: google.maps.MapMouseEvent) {
    this.display = event.latLng?.toJSON();
  }

  handleRightclick() {
    this.markerPositions.pop();
  }

  editablePolylineChanged(editable: boolean) {
    this.polylineOptions = {
      ...this.polylineOptions,
      editable,
      path: this.polyline.getPath(),
    };
  }

  editablePolygonChanged(editable: boolean) {
    this.polygonOptions = {
      ...this.polygonOptions,
      editable,
      paths: this.polygon.getPaths(),
    };
  }

  editableRectangleChanged(editable: boolean) {
    this.rectangleOptions = {
      ...this.rectangleOptions,
      editable,
      bounds: this.rectangle.getBounds(),
    };
  }

  editableCircleChanged(editable: boolean) {
    this.circleOptions = {
      ...this.circleOptions,
      editable,
      center: this.circle.getCenter(),
      radius: this.circle.getRadius(),
    };
  }

  mapTypeChanged(event: Event) {
    this.mapTypeId = (event.target as HTMLSelectElement).value as unknown as google.maps.MapTypeId;
  }

  calculateDirections() {
    if (this.markerPositions.length >= 2) {
      const request: google.maps.DirectionsRequest = {
        destination: this.markerPositions[1],
        origin: this.markerPositions[0],
        travelMode: google.maps.TravelMode.DRIVING,
      };
      this._mapDirectionsService.route(request).subscribe(response => {
        this.directionsResult = response.result;
        this.cdr.markForCheck();
      });
    }
  }

  toggleHeatmapLayerDisplay() {
    this.isHeatmapDisplayed = !this.isHeatmapDisplayed;
  }

  private _getHeatmapData(offset: number, increment: number) {
    const result: google.maps.LatLngLiteral[] = [];

    for (let lat = this.center.lat - offset; lat < this.center.lat + offset; lat += increment) {
      for (let lng = this.center.lng - offset; lng < this.center.lng + offset; lng += increment) {
        result.push({lat, lng});
      }
    }

    return result;
  }

  private _loadApi() {
    if (this.hasLoaded) {
      return;
    }

    if (!apiLoadingPromise) {
      apiLoadingPromise = this._loadScript(
        'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js',
      );
    }

    apiLoadingPromise.then(
      () => {
        this.hasLoaded = true;
        this.cdr.markForCheck();
      },
      error => console.error('Failed to load Google Maps API', error),
    );
  }

  private _loadScript(url: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.addEventListener('load', resolve);
      script.addEventListener('error', reject);
      document.body.appendChild(script);
    });
  }
}
