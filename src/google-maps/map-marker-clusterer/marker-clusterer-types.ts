/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="google.maps" />

// tslint:disable

declare type onClusterClickHandler = (
  event: google.maps.MapMouseEvent,
  cluster: Cluster,
  map: google.maps.Map,
) => void;

/**
 * MarkerClusterer creates and manages per-zoom-level clusters for large amounts
 * of markers. See {@link MarkerClustererOptions} for more details.
 */
declare class MarkerClusterer {
  /** @see {@link MarkerClustererOptions.onClusterClick} */
  onClusterClick: onClusterClickHandler;
  constructor({map, markers, algorithm, renderer, onClusterClick}: MarkerClustererOptions);
  addMarker(marker: google.maps.Marker, noDraw?: boolean): void;
  addMarkers(markers: google.maps.Marker[], noDraw?: boolean): void;
  removeMarker(marker: google.maps.Marker, noDraw?: boolean): boolean;
  removeMarkers(markers: google.maps.Marker[], noDraw?: boolean): boolean;
  clearMarkers(noDraw?: boolean): void;
  /**
   * Recalculates and draws all the marker clusters.
   */
  render(): void;
  onAdd(): void;
  onRemove(): void;
}

interface MarkerClustererOptions {
  markers?: google.maps.Marker[];
  /**
   * An algorithm to cluster markers. Default is {@link SuperClusterAlgorithm}. Must
   * provide a `calculate` method accepting {@link AlgorithmInput} and returning
   * an array of {@link Cluster}.
   */
  algorithm?: Algorithm;
  map?: google.maps.Map | null;
  /**
   * An object that converts a {@link Cluster} into a `google.maps.Marker`.
   * Default is {@link DefaultRenderer}.
   */
  renderer?: Renderer;
  onClusterClick?: onClusterClickHandler;
}

declare enum MarkerClustererEvents {
  CLUSTERING_BEGIN = 'clusteringbegin',
  CLUSTERING_END = 'clusteringend',
  CLUSTER_CLICK = 'click',
}

interface ClusterOptions {
  position?: google.maps.LatLng | google.maps.LatLngLiteral;
  markers?: google.maps.Marker[];
}

declare class Cluster {
  marker: google.maps.Marker;
  readonly markers?: google.maps.Marker[];
  constructor({markers, position}: ClusterOptions);
  get bounds(): google.maps.LatLngBounds | undefined;
  get position(): google.maps.LatLng;
  /**
   * Get the count of **visible** markers.
   */
  get count(): number;
  /**
   * Add a marker to the cluster.
   */
  push(marker: google.maps.Marker): void;
  /**
   * Cleanup references and remove marker from map.
   */
  delete(): void;
}

declare class ClusterStats {
  readonly markers: {
    sum: number;
  };
  readonly clusters: {
    count: number;
    markers: {
      mean: number;
      sum: number;
      min: number;
      max: number;
    };
  };
  constructor(markers: google.maps.Marker[], clusters: Cluster[]);
}

interface Renderer {
  /**
   * Turn a {@link Cluster} into a `google.maps.Marker`.
   *
   * Below is a simple example to create a marker with the number of markers in the cluster as a label.
   *
   * ```typescript
   * return new google.maps.Marker({
   *   position,
   *   label: String(markers.length),
   * });
   * ```
   */
  render(cluster: Cluster, stats: ClusterStats): google.maps.Marker;
}

declare class DefaultRenderer implements Renderer {
  /**
   * The default render function for the library used by {@link MarkerClusterer}.
   *
   * Currently set to use the following:
   *
   * ```typescript
   * // change color if this cluster has more markers than the mean cluster
   * const color =
   *   count > Math.max(10, stats.clusters.markers.mean)
   *     ? "#ff0000"
   *     : "#0000ff";
   *
   * // create svg url with fill color
   * const svg = window.btoa(`
   * <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
   *   <circle cx="120" cy="120" opacity=".6" r="70" />
   *   <circle cx="120" cy="120" opacity=".3" r="90" />
   *   <circle cx="120" cy="120" opacity=".2" r="110" />
   *   <circle cx="120" cy="120" opacity=".1" r="130" />
   * </svg>`);
   *
   * // create marker using svg icon
   * return new google.maps.Marker({
   *   position,
   *   icon: {
   *     url: `data:image/svg+xml;base64,${svg}`,
   *     scaledSize: new google.maps.Size(45, 45),
   *   },
   *   label: {
   *     text: String(count),
   *     color: "rgba(255,255,255,0.9)",
   *     fontSize: "12px",
   *   },
   *   // adjust zIndex to be above other markers
   *   zIndex: 1000 + count,
   * });
   * ```
   */
  render({count, position}: Cluster, stats: ClusterStats): google.maps.Marker;
}
