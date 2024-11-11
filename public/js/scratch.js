var objectClass = null, objectGroups = null;

if (validTypes.includes(mapType)) {
  objectClass = document.querySelector(`.entities`);
  objectGroups = objectClass.querySelectorAll(':scope > g');
}

renderScratched(objectGroups);

for (let i = 0; i < objectGroups.length; i++) {
  objectGroups[i].addEventListener('click', clickObject);
}

async function clickObject(e) {
  e.stopPropagation();
  e.preventDefault();

  let object = {
    code: '',
    name: '',
    year: '',
    url: ''
  };

  object.code = e.target.closest(`.entities > g`).id;

  // get name of object
  for (var key of Object.keys(objectList)) {
    if (object.code.toUpperCase() == key.toUpperCase()) {
      object.name = objectList[key];
    }
  }

  // determine if object has already been scratched
  let scratched = false;
  for (let i=0; i<scratchedObjects.length; i++) {
    if (scratchedObjects[i].code.toUpperCase() == object.code.toUpperCase()) {
      scratched = true;

      object.year = scratchedObjects[i].year;
      object.url = scratchedObjects[i].url;
    }
  }

  let saResponse = null;
  let keepScratched = null;
  // Prompt user
  if (scratched) {
    saResponse = await Swal.fire({
      title: `Update ${object.name}?`,
      icon: 'question',
      html:
        `<label for="swal2-checkbox-1" class="swal2-checkbox" style="display: flex;">` +
          `<span class="swal2-label">Scratched: </span>` +
          `<input type="checkbox" id="swal2-checkbox-1" checked>` +
        `</label>` +
        `<br/>` +
        `<label for="swal2-input-1" class="swal2-input-label">Year you visited</label>` +
        `<input id="swal2-input-1" class="swal2-input" placeholder="${new Date().getFullYear()}" value="${object.year || ''}" type="text" style="width: -webkit-fill-available;">` +
        `<label for="swal2-input-2" class="swal2-input-label">Link to Photo Album</label>` +
        `<input id="swal2-input-2" class="swal2-input" placeholder="https://cloud.mydomain.com/${object.name.toLowerCase()}-trip-photos" value="${object.url || ''}" type="url" style="width: -webkit-fill-available;">`,
      preConfirm: () => {
        let year = document.getElementById('swal2-input-1').value;
        let url = document.getElementById('swal2-input-2').value;
        if ((year.length > 0 && !isValidYear(year)) || year.length > 6) {
          Swal.showValidationMessage(
            `Invalid Year. Year must must be a number and less than 6 characters.`
          )
        } else if ((url.length > 0 && !isValidURL(url)) || url.length > 1024) {
          Swal.showValidationMessage(
            `Invalid URL. URL must contain a protocol and be less than 1024 characters.`
          )
        } else {
          return {
            checkbox: document.getElementById('swal2-checkbox-1').checked,
            year: document.getElementById('swal2-input-1').value,
            url: document.getElementById('swal2-input-2').value
          }
        }
      },
      showConfirmButton: true,
      showDenyButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: 'No',
      confirmButtonColor: '#4d9e1b',
      denyButtonColor: '#f54b38'
    });

    if (saResponse.isConfirmed) {
      if (saResponse.value.checkbox) {
        keepScratched = true;
      } else {
        keepScratched = false;
      }
    }
  } else if (!scratched) {
    saResponse = await Swal.fire({
      title: `Scratch ${object.name}?`,
      icon: 'question',
      html:
        `<label for="swal2-input-1" class="swal2-input-label">Year you visited</label>` +
        `<input id="swal2-input-1" class="swal2-input" placeholder="${new Date().getFullYear()}" type="text" style="width: -webkit-fill-available;">` +
        `<label for="swal2-input-2" class="swal2-input-label">Link to Photo Album</label>` +
        `<input id="swal2-input-2" class="swal2-input" placeholder="https://cloud.mydomain.com/${object.name.toLowerCase()}-trip-photos" type="url" style="width: -webkit-fill-available;">`,
      preConfirm: () => {
        let year = document.getElementById('swal2-input-1').value;
        let url = document.getElementById('swal2-input-2').value;
        if ((year.length > 0 && !isValidYear(year)) || year.length > 6) {
          Swal.showValidationMessage(
            `Invalid Year. Year must must be a number and less than 6 characters.`
          )
        } else if ((url.length > 0 && !isValidURL(url)) || url.length > 1024) {
          Swal.showValidationMessage(
            `Invalid URL. URL must contain a protocol and be less than 1024 characters.`
          )
        } else {
          return {
            year: document.getElementById('swal2-input-1').value,
            url: document.getElementById('swal2-input-2').value
          }
        }
      },
      showConfirmButton: true,
      showDenyButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: 'No',
      confirmButtonColor: '#4d9e1b',
      denyButtonColor: '#f54b38'
    });
  };

  if (saResponse == null) {
    Toast.fire({
      icon: 'error',
      title: 'An unknown error has occurred'
    });
  } else if (saResponse.isConfirmed) {
    const rawResponse = await fetch('/scratch', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'type': mapType,
        'code': object.code,
        'scratch': !scratched ? true : (keepScratched ? true : false),
        'year': saResponse.value.year,
        'url': saResponse.value.url
      })
    });
    let jsonResponse = await rawResponse.json();

    // handle api response
    if (jsonResponse.status == 200) {
      let dataSet = jsonResponse.scratched;
      scratchedObjects = dataSet;

      if (validTypes.includes(mapType)) {
        objectClass = document.querySelector(`.entities`);
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
      });
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

// preconfigured toast object
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

function isValidYear(year) {
  const regex = /^-?\d+\.?\d*$/;

  return regex.test(year);
}

function isValidURL(url) {
  const regex = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;

  return regex.test(url);
}
