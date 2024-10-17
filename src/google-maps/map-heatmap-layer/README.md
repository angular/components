# MapHeatmapLayer

The `MapHeatmapLayer` directive wraps the [`google.maps.visualization.HeatmapLayer` class](https://developers.google.com/maps/documentation/javascript/reference/visualization#HeatmapLayer) from the Google Maps Visualization JavaScript API. It displays
a heatmap layer on the map when it is a content child of a `GoogleMap` component. Like `GoogleMap`,
this directive offers an `options` input as well as a convenience input for passing in the `data`
that is shown on the heatmap.

## Example

```typescript
// google-map-demo.component.ts
import {Component} from '@angular/core';
import {GoogleMap, MapHeatmapLayer} from '@angular/google-maps';

@Component({
  selector: 'google-map-demo',
  templateUrl: 'google-map-demo.html',
  imports: [GoogleMap, MapHeatmapLayer],
})
export class GoogleMapDemo {
  center = {lat: 37.774546, lng: -122.433523};
  zoom = 12;
  heatmapOptions = {radius: 5};
  heatmapData = [
    {lat: 37.782, lng: -122.447},
    {lat: 37.782, lng: -122.445},
    {lat: 37.782, lng: -122.443},
    {lat: 37.782, lng: -122.441},
    {lat: 37.782, lng: -122.439},
    {lat: 37.782, lng: -122.437},
    {lat: 37.782, lng: -122.435},
    {lat: 37.785, lng: -122.447},
    {lat: 37.785, lng: -122.445},
    {lat: 37.785, lng: -122.443},
    {lat: 37.785, lng: -122.441},
    {lat: 37.785, lng: -122.439},
    {lat: 37.785, lng: -122.437},
    {lat: 37.785, lng: -122.435}
  ];
}
```

```html
<!-- google-map-demo.component.html -->
<google-map height="400px" width="750px" [center]="center" [zoom]="zoom">
  <map-heatmap-layer [data]="heatmapData" [options]="heatmapOptions" />
</google-map>
```
