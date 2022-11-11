var objectClass = null, objectGroups = null;

if (maptype == 'c') {
  objectClass = document.querySelector('.countries');
  objectGroups = objectClass.querySelectorAll(':scope > g');
} else if (maptype == 's') {
  objectClass = document.querySelector('.states');
  objectGroups = objectClass.querySelectorAll(':scope > g');
}

renderScratched(objectGroups);

for (let i = 0; i < objectGroups.length; i++) {
  objectGroups[i].addEventListener('click', clickObject);
}

async function clickObject(e) {
  e.stopPropagation();
  e.preventDefault();

  let parentGroup = null;
  if (maptype == 'c') {
    parentGroup = e.target.closest('.countries > g');
  } else if (maptype == 's') {
    parentGroup = e.target.closest('.states > g');
  }
  let objectCode = parentGroup.id;
  let objectName = '';
  for (var key of Object.keys(objectList)) {
    if (objectCode.toUpperCase() == key.toUpperCase()) {
      objectName = objectList[key];
    }
  }

  let scratched = false;
  for (let i=0; i<scratchedObjects.length; i++) {
    if (scratchedObjects[i].code.toUpperCase() == objectCode.toUpperCase()) {
      scratched = true;
    }
  }

  let saResponse = await Swal.fire({
    title: `${scratched ? 'Unscratch' : 'Scratch'} ${objectName}?`,
    icon: 'question',
    input: scratched ? null : 'text',
    inputLabel: scratched ? null : 'Year you visited',
    inputPlaceholder: scratched ? null : (new Date().getFullYear()),
    showConfirmButton: true,
    showDenyButton: true,
    confirmButtonText: 'Yes',
    denyButtonText: 'No',
    confirmButtonColor: '#4d9e1b',
    denyButtonColor: '#f54b38'
  });

  if (saResponse.isConfirmed) {
    const rawResponse = await fetch('/scratch', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'type': maptype,
        'code': objectCode,
        'scratch': !scratched,
        'year': scratched ? "" : saResponse.value
      })
    });
    let jsonResponse = await rawResponse.json();

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });

    if (jsonResponse.status == 200) {
      let dataSet = jsonResponse.scratched;
      scratchedObjects = dataSet;

      if (maptype == 'c') {
        objectClass = document.querySelector('.countries');
        objectGroups = objectClass.querySelectorAll(':scope > g');
      } else if (maptype == 's') {
        objectClass = document.querySelector('.states');
        objectGroups = objectClass.querySelectorAll(':scope > g');
      }
      renderScratched(objectGroups);

      Toast.fire({
        icon: 'success',
        title: jsonResponse.message
      })
    } else {
      Toast.fire({
        icon: 'error',
        title: jsonResponse.message
      })
    }
    
  }
}

function renderScratched(objects) {  
  for (let i = 0; i < objects.length; i++) {
    objects[i].classList.remove('scratched');
  }

  for (let i=0; i<scratchedObjects.length; i++) {
    for (let j = 0; j < objects.length; j++) {
      if (scratchedObjects[i].code.toUpperCase() == objects[j].id.toUpperCase()) {
        objects[j].classList.add('scratched');
      }
    }
  }
}