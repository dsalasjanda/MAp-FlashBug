import { Component, OnInit } from "@angular/core";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import { getCenter } from "ol/extent";
import ImageLayer from "ol/layer/Image";
import Projection from "ol/proj/Projection";
import Static from "ol/source/ImageStatic";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Feature from "ol/Feature.js";
import { Point } from "ol/geom";
import { Icon, Style } from "ol/style";
import { HttpClient } from "@angular/common/http";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  title = "CodeSandbox";
  olMap: Map;
  /** Constructo to inject the factorys */
  constructor(private http: HttpClient) {}
  ngOnInit() {
    // Map views always need a projection.  Here we just want to map image
    // coordinates directly to map coordinates, so we create a projection that uses
    // the image extent in pixels.

    var extent = [0, 0, 1920, 1040];
    var projection = new Projection({
      code: "HORUS-image",
      units: "pixels",
      extent: extent
    });

    this.olMap = new Map({
      layers: [
        new ImageLayer({
          source: new Static({
            attributions: '© <a href="http://xkcd.com/license.html">xkcd</a>',
            //   url: "https://imgs.xkcd.com/comics/online_communities.png",
            url: "assets/tunnel.png",
            projection: projection,
            imageExtent: extent
          })
        })
      ],
      target: "map",
      view: new View({
        projection: projection,
        center: getCenter(extent),
        zoom: 2,
        maxZoom: 8
      })
    });

    this.drawToolsFromServer();
  }

  /**
   * add TOOLS Layer
   */
  public drawToolsFromServer() {
    const olLayerVector: VectorLayer = new VectorLayer({
      visible: true
    });

    const vectorLayerSource: VectorSource = new VectorSource({
      features: []
    });
    let view = this.olMap.getView();
    olLayerVector.setStyle(this.createToolStyleFuction(view).bind(this));
    olLayerVector.setSource(vectorLayerSource);

    this.http.get("assets/1_TUNNEL_TOOLS.json").subscribe(tools => {
      for (let index = 0; index < tools.length; index++) {
        const tool = tools[index];
        console.log("tool");
        var feature = this.createFeature(tool);
        // feature.isTool = true;
        vectorLayerSource.addFeature(feature);
      }
      console.log("Tools:", tools);
      this.olMap.addLayer(olLayerVector);
    });
  }
  /**
   * Create feature
   * @param  {GenericElementVO} element Generic element to create map feature
   * @returns Feature
   */
  public createFeature(element): Feature {
    var geometry = new Point([
      element.coordenates[0].longitude,
      element.coordenates[0].latitude
    ]); //this.createGeometry(element);

    if (geometry) {
      var feature = new Feature({
        featureInfo: element,
        geometry: geometry
        // population: 4000,
        // rainfall: 500,
      });

      feature.setId(element.uid);
    }

    return feature;
  }
  public createToolStyleFuction(view) {
    return function(feature, resolution) {
      var scaleTool = 1;
      if (view.getProjection().getCode() === "HORUS-image") {
        //si es un esquematico se adapta al tamaño de la imagen
        scaleTool = 1 / view.getResolution();
      } else {
        //en los geograficos coge la escal como un marker normal de tipo "tools"
        var zoom = 0;
        if (this.mapComoponet.getCurrentZoom()) {
          zoom = this.mapComoponet.getCurrentZoom();
        }
        scaleTool = this.mapFeatureStylesService.getScale(
          this.mapComoponet.mapServerConfig.props,
          zoom,
          "tools"
        );
      }
      var tool = feature.get("featureInfo");
      //  var srcUrl = 'service/getToolImage/' + vm.map.mapId + '/' + tool.uid+'?lastutupdate='+tool.lastUpdate;

      /*  let base64IMG =
        "iVBORw0KGgoAAAANSUhEUgAAAGQAAAAUCAIAAAD0og/CAAACMklEQVR42u1Ya0vjQBT1L138H1XTJPYviPhY1PjAT4KIGkSEaLcigghFWKGU6hZf+KBgFfqkWFwrXVpRNHZjRanswjqTabNpnRWFJJ/mcj7cOXPmzsxpMlPSpLH4cDQxCz5t1sjUV4Z30GjW1f0zAxUUs0qPLwxUUMx6fvnDQAXFrL8s/hPOPVlPO6PN9QEjexZPUcn5PACepWzlt0NPlgMvf2gIkFlSuGJt2aTXg38DcTFZrjh0Ztl9p0SVdrQlXsmSZjHk4wXsHUB7XwiTxYSPB+Cl4T6d56XtmnIY8WalGWQU7hV8UfXJodswd/NoHy5OvRwA9IfNTW4ug/LDORFttSdQNjSH12VEAojyaZXsCejKwBAh/5W9zsg8qhOWsc1eNNCOxVPMyhYfbMJZ4Xs3cgEGVwsaYXZnRaNJettm02fHC216gsn1QeTL5LGGlA1HXve6ZlTGddwLu4X0pBv0RLNj/RSz0j9/2YSVL8gpcSJSMpitGWSWtJLHTCq/0QXQOpNMReZb9QST3yQyRFfWjTWQyicn3FB3dbjnt/Ily9dPMSt+eW8HNmUBbaNzTTWTsSOlBaBFThABgDB+pJrJ2JpUR/aGakppOac2TBHLJcbxW61svumyBBSzTn6oliN6Hh/joPGvA6cEz++CfsXFkWNb6PDHsXhfcQG4pvXcP4D4sf07lAf9A67qAV9lqLOQsnbsgmJWJHvLQAXFrIPMDQMVFLMYPvqJhgX7UmpxvAIJ6K+Dp3WVjAAAAABJRU5ErkJggg==";
      
      */
      let base64IMG = tool.imgBase64;
      var srcUrl = "data:image/png;base64," + base64IMG;

      var newStyleIcon: Icon = new Icon({
        anchor: [0.5, 0.5],
        // anchorXUnits: "fraction",
        // anchorYUnits: "fraction",
        opacity: 1,
        // points: 4,
        src: srcUrl,
        scale: scaleTool
      });
      var newStyleOl: Style = new Style({
        image: newStyleIcon,
        zIndex: 1
      });
      var styles = [];
      styles[0] = newStyleOl;
      return styles;
    };
  }
}
