var objectClass = null, objectGroups = null;

if (validTypes.includes(mapType)) {
  objectClass = document.querySelector(`.entities`);
  objectGroups = objectClass.querySelectorAll(':scope > g');
}

renderScratched(objectGroups);

function renderScratched(objects) {  
  for (let i = 0; i < objects.length; i++) {
    objects[i].classList.remove('scratched');
  }

  for (let i=0; i<scratchedObjects.length; i++) {
    for (let j = 0; j < objects.length; j++) {
      if (scratchedObjects[i].code.toUpperCase() == objects[j].id.toUpperCase()) {
        objects[j].classList.add('scratched');

        if (scratchedObjects[i].color && scratchedObjects[i].color.length > 0) {
          let customColor = scratchedObjects[i].color;

          let excludedClasses = ["label-connector", "label-text"]
          
          let paths = objects[j].querySelectorAll('path');

          let filtered = Array.from(paths).filter(path =>
            !excludedClasses.some(excludedClass => path.classList.contains(excludedClass))
          );

          filtered.forEach((path, index) => {
            path.style.fill = customColor;
          });
        }
      }
    }
  }
}
