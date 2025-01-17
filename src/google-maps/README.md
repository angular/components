# Angular Google Maps component

This component provides a Google Maps Angular component that implements the
[Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/tutorial).
File any bugs against the [angular/components repo](https://github.com/angular/components/issues).

## Installation

To install, run `ng add @angular/google-maps`.

## Getting the API Key

Follow [these steps](https://developers.google.com/maps/gmp-get-started) to get an API key that can be used to load Google Maps.

## Loading the API

Include the [Dynamic Library Import script](https://developers.google.com/maps/documentation/javascript/load-maps-js-api#dynamic-library-import) in the `index.html` of your app. When a Google Map is being rendered, it'll use the Dynamic Import API to load the necessary JavaScript automatically.

```html
<!-- index.html -->
<!DOCTYPE html>
<body>
  ...
  <script>
    (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
      v: "weekly",
      key: YOUR_API_KEY_GOES_HERE
    });
  </script>
</body>
</html>
```

**Note:** the component also supports loading the API using the [legacy script tag](https://developers.google.com/maps/documentation/javascript/load-maps-js-api#use-legacy-tag), however it isn't recommended because it requires all of the Google Maps JavaScript to be loaded up-front, even if it isn't used.

## Components

- [`GoogleMap`](./google-map/README.md)
- [`MapMarker`](./map-marker/README.md)
- [`MapInfoWindow`](./map-info-window/README.md)
- [`MapPolyline`](./map-polyline/README.md)
- [`MapPolygon`](./map-polygon/README.md)
- [`MapRectangle`](./map-rectangle/README.md)
- [`MapCircle`](./map-circle/README.md)
- [`MapGroundOverlay`](./map-ground-overlay/README.md)
- [`MapKmlLayer`](./map-kml-layer/README.md)
- [`MapTrafficLayer`](./map-traffic-layer/README.md)
- [`MapTransitLayer`](./map-transit-layer/README.md)
- [`MapBicyclingLayer`](./map-bicycling-layer/README.md)
- [`MapDirectionsRenderer`](./map-directions-renderer/README.md)
- [`MapHeatmapLayer`](./map-heatmap-layer/README.md)

## Services

- [`MapGeocoder`](./map-geocoder/README.md)


## The Options Input

The Google Maps components implement all of the options for their respective objects from the
Google Maps JavaScript API through an `options` input, but they also have specific inputs for some
of the most common options. For example, the Google Maps component could have its options set either
in with a google.maps.MapOptions object:

```html
<google-map [options]="options" />
```

```typescript
options: google.maps.MapOptions = {
  center: {lat: 40, lng: -20},
  zoom: 4
};
```

It can also have individual options set for some of the most common options:

```html
<google-map [center]="center" [zoom]="zoom" />
```

```typescript
center: google.maps.LatLngLiteral = {lat: 40, lng: -20};
zoom = 4;
```

Not every option has its own input. See the API for each component to see if the option has a
dedicated input or if it should be set in the options input.
