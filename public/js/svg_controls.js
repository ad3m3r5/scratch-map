const { pan, zoom, getScale, setScale, resetScale } = svgPanZoomContainer;
var isFullscreen = false;

var mapContainer = document.getElementById('map-container');
const svgContainer = document.getElementById('svg-container');

const options = {
  origin: {
    clientX: 800,
    clientY: 0,
  },
  minScale: 1,
  maxScale: 2
};

function fullscreenView() {
  if (!isFullscreen) {
    if (mapContainer.requestFullscreen) {
      mapContainer.requestFullscreen();
    } else if (mapContainer.webkitRequestFullscreen) { /* Safari */
      mapContainer.webkitRequestFullscreen();
    } else if (mapContainer.msRequestFullscreen) { /* IE11 */
      mapContainer.msRequestFullscreen();
    }
    isFullscreen = true;
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
      document.msExitFullscreen();
    }
    isFullscreen = false;
  }
}

function resetView() {
  resetScale(svgContainer);
}

function zoomIn() {
  let maxZoom = (window.location.pathname == '/map/world' ? 8 : 2);
  zoom(svgContainer, 1.2, {
    origin: {
      clientX: svgContainer.clientWidth/2,
      clientY: svgContainer.clientHeight/2,
    },
    minScale: 1,
    maxScale: maxZoom
  });
}

function zoomOut() {
  let maxZoom = (window.location.pathname == '/map/world' ? 8 : 2);
  zoom(svgContainer, 0.8, {
    origin: {
      clientX: svgContainer.clientWidth/2,
      clientY: svgContainer.clientHeight/2,
    },
    minScale: 1,
    maxScale: maxZoom
  });
}

