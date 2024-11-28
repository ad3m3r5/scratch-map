var objectClass = null, objectGroups = null;
var clickingObject = false, draggingObject = false;

const maxURLLength = 2048;
const validatorURLOptions = {
  require_protocol: true
};
const validatorDateOptions = {
  strictMode: true,
  delimiters: ['-', '/'],
  format: 'MM-DD-YYYY'
};

const datePickerLocale = {
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  today: 'Today',
  clear: 'Clear',
  dateFormat: 'MM-dd-yyyy',
  timeFormat: 'hh:mm aa',
  firstDay: 0
};

if (validTypes.includes(mapType)) {
  objectClass = document.querySelector(`.entities`);
  objectGroups = objectClass.querySelectorAll(':scope > g');
}

renderScratched(objectGroups);

for (let i = 0; i < objectGroups.length; i++) {
  objectGroups[i].addEventListener('click', clickObject);

  objectGroups[i].addEventListener('mousedown', () => {
    clickingObject = true;
  });

  objectGroups[i].addEventListener('mousemove', () => {
    if (clickingObject) {
      draggingObject = true;
    }
  });

  objectGroups[i].addEventListener('mouseup', () => {
    clickingObject = false;
    setTimeout(() => draggingObject = false, 10);
  });
}

async function clickObject(e) {
  if (draggingObject) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  e.stopPropagation();
  e.preventDefault();
  
  let today = new Date();
  let tMonth = String(today.getMonth() + 1).padStart(2, '0');
  let tDay = String(today.getDate()).padStart(2, '0');
  let tYear = today.getFullYear();

  let object = {
    code: '',
    name: '',
    visits: []
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

      object.visits = scratchedObjects[i].visits || [];
    }
  }

  let saResponse = null;
  let keepScratched = null;
  // prompt user
  if (scratched) {
    let visitEntry = `
      <input id="swal2-input-1" class="swal2-input" placeholder="${tMonth}-${tDay}-${tYear}" value="${object.year || ''}" type="text" style="width: -webkit-fill-available;">
      <label for="swal2-input-2" class="swal2-input-label">Link to Photo Album</label>
      <input id="swal2-input-2" class="swal2-input" placeholder="https://cloud.mydomain.com/${encodeURIComponent(object.name.toLowerCase())}-trip-photos" value="${object.url || ''}" type="url" style="width: -webkit-fill-available;">
    `;

    saResponse = await Swal.fire({
      title: `Update ${object.name}?`,
      icon: 'question',
      html:
        `<label for="swal2-checkbox-1" class="swal2-checkbox" style="display: flex;">` +
          `<span class="swal2-label">Scratched: </span>` +
          `<input type="checkbox" id="swal2-checkbox-1" checked>` +
        `</label>` +
        `<br/>` +
        `<label for="swal2-input-1" class="swal2-input-label">Date you visited</label>` +
        `<input id="swal2-input-1" class="swal2-input" placeholder="${tMonth}-${tDay}-${tYear}" value="${object.year || ''}" type="text" style="width: -webkit-fill-available;">` +
        `<label for="swal2-input-2" class="swal2-input-label">Link to Photo Album</label>` +
        `<input id="swal2-input-2" class="swal2-input" placeholder="https://cloud.mydomain.com/${encodeURIComponent(object.name.toLowerCase())}-trip-photos" value="${object.url || ''}" type="url" style="width: -webkit-fill-available;">`,
      preConfirm: () => {
        let date = document.getElementById('swal2-input-1').value;
        let url = document.getElementById('swal2-input-2').value;
        
        if ((date.length > 0 && !validator.isDate(date, validatorDateOptions))) {
          Swal.showValidationMessage(
            `Invalid Date - must be formatted as MM-DD-YYYY.`
          )
        } else if ((url.length > 0 && !validator.isURL(url, validatorURLOptions)) || url.length > maxURLLength) {
          Swal.showValidationMessage(
            `Invalid URL - must contain a protocol and be less than ${maxURLLength} characters.`
          )
        } else {
          return {
            checkbox: document.getElementById('swal2-checkbox-1').checked,
            date: document.getElementById('swal2-input-1').value,
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
        `<label for="swal2-input-1" class="swal2-input-label">Date you visited</label>` +
        `<input id="swal2-input-1" class="swal2-input" placeholder="${tMonth}-${tDay}-${tYear}" type="text" style="width: -webkit-fill-available;">` +
        `<label for="swal2-input-2" class="swal2-input-label">Link to Photo Album</label>` +
        `<input id="swal2-input-2" class="swal2-input" placeholder="https://cloud.mydomain.com/${encodeURIComponent(object.name.toLowerCase())}-trip-photos" type="url" style="width: -webkit-fill-available;">`,
      didOpen: () => {
        new AirDatepicker('#swal2-input-1', {
          locale: datePickerLocale,
          buttons: [ 'clear' ],
          autoClose: true
        });
      },
      preConfirm: () => {
        let date = document.getElementById('swal2-input-1').value;
        let url = document.getElementById('swal2-input-2').value;

        if ((date.length > 0 && !validator.isDate(date, validatorDateOptions))) {
          Swal.showValidationMessage(
            `Invalid Date - must be formatted as MM-DD-YYYY.`
          )
        } else if ((url.length > 0 && !validator.isURL(url, validatorURLOptions)) || url.length > maxURLLength) {
          Swal.showValidationMessage(
            `Invalid URL - must contain a protocol and be less than ${maxURLLength} characters.`
          )
        } else {
          return {
            date: document.getElementById('swal2-input-1').value,
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
    let newVisits = object.visits;
    newVisits.push({
      date: saResponse.value.date,
      url: saResponse.value.url
    });

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
        'visits': newVisits
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
