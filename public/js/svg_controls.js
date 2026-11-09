const { pan, zoom, getScale, setScale, resetScale } = svgPanZoomContainer;

var mapContainer = document.getElementById('map-container');
const svgContainer = document.getElementById('svg-container');
const autofitButton = document.getElementById('zoom-autofit');
let autofit = readAutofit();

const options = {
  origin: {
    clientX: 800,
    clientY: 0,
  },
  minScale: 1,
  maxScale: 2
};

function fullscreenView() {
  if (!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement)) {
    if (mapContainer.requestFullscreen) {
      mapContainer.requestFullscreen();
    } else if (mapContainer.webkitRequestFullscreen) { /* Safari */
      mapContainer.webkitRequestFullscreen();
    } else if (mapContainer.msRequestFullscreen) { /* IE11 */
      mapContainer.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
      document.msExitFullscreen();
    }
  }
}

function getMaxZoom() {
  let match = (svgContainer.dataset.zoomOnWheel || '').match(/max-scale:\s*([\d.]+)/);
  return match ? Number(match[1]) : 2;
}

function resetView() {
  resetScale(svgContainer);
}

function zoomIn() {
  let maxZoom = getMaxZoom();
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
  let maxZoom = getMaxZoom();
  zoom(svgContainer, 0.8, {
    origin: {
      clientX: svgContainer.clientWidth/2,
      clientY: svgContainer.clientHeight/2,
    },
    minScale: 1,
    maxScale: maxZoom
  });
}


function readAutofit() {
  try {
    return localStorage.getItem('autofit') !== 'false';
  } catch {
    return true;
  }
}

function toggleAutofit() {
  autofit = !autofit;
  try {
    localStorage.setItem('autofit', autofit);
  } catch {}
  applyAutofit();
}

function getMapRatio() {
  let viewBox = document.getElementById('svg-map').viewBox.baseVal;
  return viewBox.width / viewBox.height;
}

function applyAutofit() {
  autofitButton.setAttribute('aria-pressed', autofit);

  if (!autofit) {
    svgContainer.style.maxWidth = '';
    return;
  }

  let inFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
  let top = svgContainer.getBoundingClientRect().top + (inFullscreen ? 0 : window.scrollY);
  let bottomGap = inFullscreen ? 0 : parseFloat(getComputedStyle(mapContainer).marginBottom);
  let availableHeight = Math.max(window.innerHeight - top - bottomGap, 150);

  svgContainer.style.maxWidth = `${availableHeight * getMapRatio()}px`;
}

['resize', 'load'].forEach(event => window.addEventListener(event, applyAutofit));
['fullscreenchange', 'webkitfullscreenchange'].forEach(event => document.addEventListener(event, applyAutofit));
applyAutofit();
