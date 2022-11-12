import { getConnection } from '../utils/database.js';

const validTypes = ['countries', 'states'];

// home page
export const getHome = ((req, res, next) => {
  let countriesList = getConnection().data.countries;
  let statesList = getConnection().data.states;
  let scratchedCountries = getConnection().data.scratched.countries;
  let scratchedStates = getConnection().data.scratched.states;

  let unscratchedCountries = (() => {
    let unscratched = {};
    for (const [key, value] of Object.entries(countriesList)) {
      let countryIndex = scratchedCountries.findIndex(x => x.code == key);
      if (countryIndex == -1) unscratched[key] = value;
    }
    return unscratched;
  })();

  let unscratchedStates = (() => {
    let unscratched = {};
    for (const [key, value] of Object.entries(statesList)) {
      let stateIndex = scratchedStates.findIndex(x => x.code == key);
      if (stateIndex == -1) unscratched[key] = value;
    }
    return unscratched;
  })();

  for (let i=0; i<scratchedCountries.length; i++) {
    for (const [key, value] of Object.entries(countriesList)) {
      if (scratchedCountries[i].code == key) {
        scratchedCountries[i].name = value;
      }
    }
  }
  for (let i=0; i<scratchedStates.length; i++) {
    for (const [key, value] of Object.entries(statesList)) {
      if (scratchedStates[i].code == key) {
        scratchedStates[i].name = value;
      }
    }
  }

  res.render('index', {
    title: 'Home',
    countriesList: unscratchedCountries,
    statesList: unscratchedStates,
    scratchedCountries,
    scratchedStates
  });
});

// map
export const getMap = ((req, res, next) => {
  let mapType = req.params.mapType;

  if (!validTypes.includes(mapType)) {
    res.render('error', { status: '404', message: `/map/${mapType} Not Found` });
  } else {
    let objectList = getConnection().data[mapType];
    let scratchedObjects = getConnection().data.scratched[mapType];
  
    let title = `Map of ${mapType.charAt(0).toUpperCase + mapType.slice(1)}`;
  
    if (mapType == 'countries') title = 'World Map';
    if (mapType == 'states') title = 'US States';
  
    res.render('map', {
      title,
      mapType,
      objectList,
      scratchedObjects
    });
  }
});

// scratch endpoint
export const postScratch = (async (req, res, next) => {
  console.log(req.body);
  if (Object.keys(req.body).length !== 5) {
    // body attribute count
    return res.status(422).json({ status: 422, message: 'Invalid body length' }).send();
  } else if (typeof req.body.type !== 'string' || typeof req.body.code !== 'string' || typeof req.body.scratch !== 'boolean' || typeof req.body.year !== 'string' || typeof req.body.url !== 'string') {
    // body attribute data types
    return res.status(422).json({ status: 422, message: 'Invalid data type' }).send();
  } else if (req.body.type.length < 0 || req.body.type.length > 20) {
    // scratch type length
    return res.status(422).json({ status: 422, message: 'Invalid object length' }).send();
  } else if (!validTypes.includes(req.body.type)) {
    // scratch type
    return res.status(422).json({ status: 422, message: 'Invalid object type' }).send();
  } else if (req.body.code.length !== 2) {
    // country/state code length
    return res.status(422).json({ status: 422, message: 'Invalid code length' }).send();
  } else if (req.body.year.length < 0 || req.body.year.length > 6) {
    // year length
    return res.status(422).json({ status: 422, message: 'Invalid year length' }).send();
  } else if (req.body.year.length > 0 && !isValidYear(req.body.year)) {
    // year only contains numbers
    return res.status(422).json({ status: 422, message: 'Invalid year' }).send();
  } else if (req.body.url.length < 0 || req.body.url.length > 1024) {
    // url length
    return res.status(422).json({ status: 422, message: 'Invalid url length' }).send();
  } else if (req.body.url.length > 0 && !isValidURL(req.body.url)) {
    // url valid (has protocol defined)
    return res.status(422).json({ status: 422, message: 'Invalid url' }).send();
  } else {
    // check that the country/state code exists
    if (!(req.body.code.toUpperCase() in getConnection().data[req.body.type])) {
      return res.status(422).json({ status: 422, message: 'Invalid object code' }).send();
    }

    let scratched = getConnection().data.scratched;

    // new scratch
    if (req.body.scratch) {
      // check if already scratched
      let exists = false;
      let existsIndex = null;

      for (let i=0; i < scratched[req.body.type].length; i++) {
        if (scratched[req.body.type][i].code.toUpperCase() == req.body.code.toUpperCase()) {
          exists = true;
          existsIndex = i;
        }
      }
      if (exists) {
        // update existing scratch
        scratched[req.body.type][existsIndex].year = req.body.year;
        scratched[req.body.type][existsIndex].url = req.body.url;
      } else {
        // add new scratch
        scratched[req.body.type].push({
          'code': req.body.code.toUpperCase(),
          'year': req.body.year || '',
          'url': req.body.url || ''
        });
      }

      getConnection().data.scratched = scratched;
      getConnection().write();
    } else {
      // undo scratch
      let objectIndex = scratched[req.body.type].findIndex(x => x.code == req.body.code.toUpperCase());

      if (objectIndex > -1) {
        scratched[req.body.type].splice(objectIndex, 1);

        getConnection().data.scratched = scratched;
        getConnection().write();
      } else {
        return res.status(422).json({ status: 422, message: `Unable to unscratch ${req.body.code.toUpperCase()}` }).send();
      }
    }

    let returnedScratched = getConnection().data.scratched[req.body.type];

    // return the new scratched values
    return res.status(200).json({
      status: 200,
      message: `${req.body.code.toUpperCase()} successfully ${req.body.scratch ? 'scratched' : 'unscratched'}!`,
      scratched: returnedScratched
    });
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