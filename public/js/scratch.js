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

const dpCloseButton = {
  content: 'Close',
  onClick: (dp) => {
    dp.hide()
  }
}

const dpSingleButton = {
  content: 'Single Date',
  onClick: (dp) => {
    dp.clear({ silent: true });
    dp.update({
      buttons: [ 'clear', dpRangeButton, dpCloseButton ],
      autoClose: false,
      multipleDates: false,
      multipleDatesSeparator: ' - ',
      range: false,
      dynamicRange: false
    });
    dp.clear({ silent: true });
  }
}

const dpRangeButton = {
  content: 'Date Range',
  onClick: (dp) => {
    dp.clear({ silent: true });
    dp.update({
      buttons: [ 'clear', dpSingleButton, dpCloseButton ],
      autoClose: false,
      multipleDates: false,
      multipleDatesSeparator: ' - ',
      range: true,
      dynamicRange: true
    });
    dp.clear({ silent: true });
  }
}

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
    // existing scratch
  if (scratched) {
    saResponse = await Swal.fire({
      title: `Update ${object.name}?`,
      icon: 'question',
      html: `
        <label for="swal2-checkbox-1" class="swal2-checkbox" style="display: flex;">
          <span class="swal2-label">Scratched: </span>
          <input type="checkbox" id="swal2-checkbox-1" checked>
        </label>

        <div id="swal2-input-color-div" class="fill">
          <label for="swal2-input-color" class="swal2-input-label" style="display: inline-block;">Scratch color: </label>
          <input id="swal2-input-color" class="full" value="${colors.scratched || '#c2c2c2'}" type="text" data-coloris>
        </div>

        <br/>

        <div id="visit-section-wrapper">
          ${renderSwalVisits(object)}
        </div>

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

          if (visit.date.length == 23) {
            new AirDatepicker(`#swal2-input-${index}-date`, {
              locale: datePickerLocale,
              buttons: [ 'clear', dpSingleButton, dpCloseButton ],
              autoClose: false,
              multipleDates: false,
              multipleDatesSeparator: ' - ',
              range: true,
              dynamicRange: true,
              selectedDates: visit.date.split(" - ")
            });
          } else {
            new AirDatepicker(`#swal2-input-${index}-date`, {
              locale: datePickerLocale,
              buttons: [ 'clear', dpRangeButton, dpCloseButton ],
              autoClose: false,
              multipleDates: false,
              multipleDatesSeparator: ' - ',
              range: false,
              dynamicRange: false
            });
          }
        });

        Coloris({
          el: '#swal2-input-color',
          theme: 'default',
          themeMode: 'light',
          format: 'hex',
          alpha: false,
          clearButton: true,
          closeButton: true,
        });
      },
      preConfirm: () => {
        let newVisits = readSwalVisits();
        let colorInput = document.getElementById('swal2-input-color');
        let color = colorInput.value;

        let invalidData = false;

        if (!validator.isHexColor(color)) {
          Swal.showValidationMessage(
            `Invalid color code. Must be in the format "#c2c2c2"`
          );
          return false;
        }

        newVisits.forEach((visit, index) => {
          let dateInput = document.getElementById(`swal2-input-${index}-date`);
          let urlInput = document.getElementById(`swal2-input-${index}-date`);

          let date = visit.date;
          let url = visit.url;

          if ((date.length > 0 && !isValidDate(date, validatorDateOptions))) {
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
          );
          return false;
        }

        return {
          checkbox: document.getElementById('swal2-checkbox-1').checked,
          color: color,
          visits: newVisits
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
    // new scratch
  } else if (!scratched) {
    saResponse = await Swal.fire({
      title: `Scratch ${object.name}?`,
      icon: 'question',
      html: `
        <div id="swal2-input-color-div" class="fill">
          <label for="swal2-input-color" class="swal2-input-label" style="display: inline-block;">Scratch color: </label>
          <input id="swal2-input-color" class="full" value="${colors.scratched || '#c2c2c2'}" type="text" data-coloris>
        </div>

        <label for="swal2-input-date" class="swal2-input-label">Date you visited</label>
        <input id="swal2-input-date" class="swal2-input" placeholder="${tMonth}-${tDay}-${tYear}" type="text">

        <label for="swal2-input-url" class="swal2-input-label">Link to Photo Album</label>
        <input id="swal2-input-url" class="swal2-input" placeholder="https://cloud.mydomain.com/${encodeURIComponent(object.name.toLowerCase())}-trip-photos" type="url">
      `,
      didOpen: () => {
        new AirDatepicker('#swal2-input-date', {
          locale: datePickerLocale,
          buttons: [ 'clear', dpRangeButton, dpCloseButton ],
          autoClose: false,
          multipleDates: false,
          multipleDatesSeparator: ' - ',
          range: false,
          dynamicRange: false
        });

        Coloris({
          el: '#swal2-input-color',
          theme: 'default',
          themeMode: 'light',
          format: 'hex',
          alpha: false,
          clearButton: true,
          closeButton: true,
        });
      },
      preConfirm: () => {
        let colorInput = document.getElementById('swal2-input-color');
        let dateInput = document.getElementById('swal2-input-date');
        let urlInput = document.getElementById('swal2-input-url');

        let color = colorInput.value;
        let date = dateInput.value;
        let url = urlInput.value;

        let invalidData = false;

        if (!validator.isHexColor(color)) {
          Swal.showValidationMessage(
            `Invalid color code. Must be in the format "#c2c2c2"`
          );
          return false;
        }

        if ((date.length > 0 && !isValidDate(date, validatorDateOptions))) {
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
          );
          return false;
        }

        return {
          color,
          visits: [{
            date: date,
            url: url
          }]
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
        'code': object.code.toUpperCase(),
        'scratch': !scratched ? true : (keepScratched ? true : false),
        'color': saResponse.value.color.toUpperCase(),
        'visits': saResponse.value.visits
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

function renderSwalVisits(object) {
  let today = new Date();
  let tMonth = String(today.getMonth() + 1).padStart(2, '0');
  let tDay = String(today.getDate()).padStart(2, '0');
  let tYear = today.getFullYear();

  let html = "";

  object.visits.forEach((visit, index) => {
    html = html + `
      <div class="visit-section">
        <div class="visit-section-field">
          <label for="swal2-input-${index}-date" class="swal2-input-label visit-date-label">Date: </label>
          <input id="swal2-input-${index}-date" class="swal2-input" type="text" placeholder="${tMonth}-${tDay}-${tYear}" value="${visit.date || ''}">
        </div>

        <div class="visit-section-field">
          <label for="swal2-input-${index}-url" class="swal2-input-label visit-url-label">Photo URL: </label>
          <input id="swal2-input-${index}-url" class="swal2-input" type="url" placeholder="https://cloud.mydomain.com/${encodeURIComponent(object.name.toLowerCase())}-trip-photos" value="${visit.url || ''}">

          <div id="scratch-delete-icon">
            <button id="scratch-delete-button-${index}">
              <img src="../images/trash.svg" alt="Delete" />
            </button>
          </div>
        </div>
      </div>
    `;
  });

  return html;
}

function readSwalVisits() {
  let visits = document.querySelectorAll('#visit-section-wrapper .visit-section');

  let newVisits = [];

  visits.forEach((visit, index) => {
    let inputs = visit.querySelectorAll('input');

    newVisits.push({
      date: inputs[0].value,
      url: inputs[1].value
    });
  });

  return newVisits;
}

function reloadSwalVisits(object) {
  let newVisitsHtml = renderSwalVisits(object);
  let visitBody = document.getElementById('visit-section-wrapper');
  visitBody.innerHTML = newVisitsHtml;

  object.visits.forEach((visit, index) => {
    let deleteVisitButton = document.getElementById(`scratch-delete-button-${index}`);
    deleteVisitButton.addEventListener('click', (e) => {
      deleteScratchVisit(e, object, visit, index);
    });

    if (visit.date.length == 23) {
      new AirDatepicker(`#swal2-input-${index}-date`, {
        locale: datePickerLocale,
        buttons: [ 'clear', dpSingleButton, dpCloseButton ],
        autoClose: false,
        multipleDates: false,
        multipleDatesSeparator: ' - ',
        range: true,
        dynamicRange: true,
        selectedDates: visit.date.split(" - ")
      });
    } else {
      new AirDatepicker(`#swal2-input-${index}-date`, {
        locale: datePickerLocale,
        buttons: [ 'clear', dpRangeButton, dpCloseButton ],
        autoClose: false,
        multipleDates: false,
        multipleDatesSeparator: ' - ',
        range: false,
        dynamicRange: false
      });
    }
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
      alert("Please add a date or URL to the previous visit before adding another");
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

  let visitDate = document.getElementById(`swal2-input-${index}-date`);
  let visitUrl = document.getElementById(`swal2-input-${index}-url`);

  let result = confirm(`
    Are you sure you want to delete visit #${index+1}?
        Date: ${visitDate.value}
        URL: ${visitUrl.value}
  `);

  if (result) {
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

function isValidDate(date) {
  let isValid = true;

  if (date.length == 10) {
    isValid = validator.isDate(date, validatorDateOptions)
  } else if (date.length == 23) {
    let dates = date.split(" - ");
    dates.forEach((singleDate) => {
      if (!validator.isDate(singleDate, validatorDateOptions)) {
        isValid = false;
      }
    });
  } else {
    isValid = false;
  }

  return isValid;
}
