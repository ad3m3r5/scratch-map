const { pan, zoom, getScale, setScale, resetScale } = svgPanZoomContainer;

const container = document.getElementById('svg-container');

const options = {
  origin: {
    clientX: 800,
    clientY: 0,
  },
  minScale: 1,
  maxScale: 2
};

function resetView() {
  resetScale(container);
}

function zoomIn() {
  let maxZoom = (window.location.pathname == '/worldmap' ? 8 : 2);
  zoom(container, 1.2, {
    origin: {
      clientX: container.clientWidth/2,
      clientY: container.clientHeight/2,
    },
    minScale: 1,
    maxScale: maxZoom
  });
}

function zoomOut() {
  let maxZoom = (window.location.pathname == '/worldmap' ? 8 : 2);
  zoom(container, 0.8, {
    origin: {
      clientX: container.clientWidth/2,
      clientY: container.clientHeight/2,
    },
    minScale: 1,
    maxScale: maxZoom
  });
}

