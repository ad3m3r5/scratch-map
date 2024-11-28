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
  e.preventDefault();
  e.stopPropagation();

  if (draggingObject) {
    return;
  }
  
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
    let visitHtml = renderSwalVisits(object);

    saResponse = await Swal.fire({
      title: `Update ${object.name}?`,
      icon: 'question',
      html: `
        <label for="swal2-checkbox-1" class="swal2-checkbox" style="display: flex;">
          <span class="swal2-label">Scratched: </span>
          <input type="checkbox" id="swal2-checkbox-1" checked>
        </label>
        <br/>
        <table id="visit-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>URL</th>
            </tr>
          </thead>
          <tbody id="visit-table-body">
            ${visitHtml}
          </tbody>
        </table>
        <br/>
        <button id="scratch-add-button" class="swal2-confirm swal2-styled swal2-default-outline">Add Visit</button>
      `,
      didOpen: () => {
        let addVisitButton = document.getElementById(`scratch-add-button`);
        addVisitButton.addEventListener('click', (e) => {
          addScratchVisit(e, object);
        });

        object.visits.forEach((visit, index) => {
          let deleteVisitButton = document.getElementById(`scratch-delete-button-${index}`);
          deleteVisitButton.addEventListener('click', (e) => {
            deleteScratchVisit(e, object, visit, index);
          });

          new AirDatepicker(`#swal2-input-${index}-date`, {
            locale: datePickerLocale,
            buttons: [ 'clear' ],
            autoClose: true,
            onSelect: ({date, formattedDate, datepicker}) => {
              let dateElement = document.getElementById(`swal2-input-${index}-date`);
              dateElement.value = formattedDate;
              dateElement.setAttribute('value', formattedDate);
            }
          });
        });
      },
      preConfirm: () => {
        let newVisits = readSwalVisits();

        let invalidData = false;

        newVisits.forEach((visit, index) => {
          let date = visit.date;
          let url = visit.url;

          let dateInput = document.getElementById(`swal2-input-${index}-date`);
          let urlInput = document.getElementById(`swal2-input-${index}-date`);

          if ((date.length > 0 && !validator.isDate(date, validatorDateOptions))) {
            invalidData = true;
            dateInput.style.outline = '2px solid red';
          } else {
            dateInput.style.outline = '';
          }
          
          if ((url.length > 0 && !validator.isURL(url, validatorURLOptions)) || url.length > maxURLLength) {
            invalidData = true;
            urlInput.style.outline = '2px solid red';
          } else {
            urlInput.style.outline = '';
          }
        });
        
        if (invalidData) {
          Swal.showValidationMessage(
            `Please fix the outlined errors. Dates must be formatted as MM-DD-YYYY, and URLs must contain a protocol and be less than ${maxURLLength} characters.`
          )
        } else {
          return {
            checkbox: document.getElementById('swal2-checkbox-1').checked,
            visits: newVisits
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
        `<label for="swal2-input-date" class="swal2-input-label">Date you visited</label>` +
        `<input id="swal2-input-date" class="swal2-input" placeholder="${tMonth}-${tDay}-${tYear}" type="text" style="width: -webkit-fill-available;">` +
        `<label for="swal2-input-url" class="swal2-input-label">Link to Photo Album</label>` +
        `<input id="swal2-input-url" class="swal2-input" placeholder="https://cloud.mydomain.com/${encodeURIComponent(object.name.toLowerCase())}-trip-photos" type="url" style="width: -webkit-fill-available;">`,
      didOpen: () => {
        new AirDatepicker('#swal2-input-date', {
          locale: datePickerLocale,
          buttons: [ 'clear' ],
          autoClose: true
        });
      },
      preConfirm: () => {
        let dateInput = document.getElementById('swal2-input-date');
        let urlInput = document.getElementById('swal2-input-url');

        let date = dateInput.value;
        let url = urlInput.value;

        let invalidData = false;

        if ((date.length > 0 && !validator.isDate(date, validatorDateOptions))) {
          invalidData = true;
          dateInput.style.outline = '2px solid red';
        } else {
          dateInput.style.outline = '';
        }
        
        if ((url.length > 0 && !validator.isURL(url, validatorURLOptions)) || url.length > maxURLLength) {
          invalidData = true;
          urlInput.style.outline = '2px solid red';
        } else {
          urlInput.style.outline = '';
        }

        if (invalidData) {
          Swal.showValidationMessage(
            `Please fix the outlined errors. Dates must be formatted as MM-DD-YYYY, and URLs must contain a protocol and be less than ${maxURLLength} characters.`
          )
        } else {
          return {
            visits: [{
              date: date,
              url: url
            }]
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
    let newVisits = saResponse.value.visits;

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

function renderSwalVisits(object) {
  let today = new Date();
  let tMonth = String(today.getMonth() + 1).padStart(2, '0');
  let tDay = String(today.getDate()).padStart(2, '0');
  let tYear = today.getFullYear();

  let html = "";

  object.visits.forEach((visit, index) => {
    html = html + `
      <tr id="visit-row-${index}">
        <td>
          <div>
            <input id="swal2-input-${index}-date" class="swal2-input" placeholder="${tMonth}-${tDay}-${tYear}" value="${visit.date || ''}" type="text" style="width: 100%; margin: 0">
          </div>
        </td>
        <td>
          <div>
            <input id="swal2-input-${index}-url" class="swal2-input" placeholder="https://cloud.mydomain.com/${encodeURIComponent(object.name.toLowerCase())}-trip-photos" value="${visit.url || ''}" type="url" style="width: 100%; margin: 0">
          </div>
        </td>
        <td>
          <div id="scratch-delete-icon">
            <button id="scratch-delete-button-${index}">
              <img src="../images/trash.svg" alt="Delete" />
            </button>
          </div>
        </td>
      </tr>        
    `;
  });

  return html;
}

function readSwalVisits() {
  let visits = document.querySelectorAll('#visit-table-body tr');

  let newVisits = [];

  visits.forEach((visit, index) => {
    let inputs = visit.querySelectorAll('td input');

    newVisits.push({
      date: inputs[0].value,
      url: inputs[1].value
    });
  });

  return newVisits;
}

function reloadSwalVisits(object) {
  let newVisitsHtml = renderSwalVisits(object);
  let tbody = document.getElementById('visit-table-body');
  tbody.innerHTML = newVisitsHtml;

  object.visits.forEach((visit, index) => {
    let deleteVisitButton = document.getElementById(`scratch-delete-button-${index}`);
    deleteVisitButton.addEventListener('click', (e) => {
      deleteScratchVisit(e, object, visit, index);
    });

    new AirDatepicker(`#swal2-input-${index}-date`, {
      locale: datePickerLocale,
      buttons: [ 'clear' ],
      autoClose: true,
      onSelect: ({date, formattedDate, datepicker}) => {
        let dateElement = document.getElementById(`swal2-input-${index}-date`);
        dateElement.value = formattedDate;
        dateElement.setAttribute('value', formattedDate);
      }
    });
  });
}

function addScratchVisit(e, object) {
  e.preventDefault();
  e.stopPropagation();

  readSwalVisits();

  let newVisits = readSwalVisits();

  let lastElement = newVisits.length - 1;

  if (newVisits.length > 0) {
    if (newVisits[lastElement].date.length < 1 && newVisits[lastElement].url.length < 1) {
      alert("Please complete the previous visit before adding another");
      return;
    }
  }

  newVisits.push({
    date: '',
    url: ''
  });

  object.visits = newVisits;

  reloadSwalVisits(object);
}

function deleteScratchVisit(e, object, visit, index) {
  e.preventDefault();
  e.stopPropagation();

  //let target = e.target;
  //let closestTr = target.closest('tr');
  let visitDate = document.getElementById(`swal2-input-${index}-date`);

  let result = confirm(`Are you sure you want to delete the visit for ${visitDate.value}?`);

  if (result) {
    //closestTr.remove();
    let newVisits = object.visits;
    newVisits.splice(index, 1);
    object.visits = newVisits;

    reloadSwalVisits(object);
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
