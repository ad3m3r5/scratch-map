import { getConnection } from '../utils/database.js';


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

// world map
export const getWorldMap = ((req, res, next) => {
  let countriesList = getConnection().data.countries;
  let scratchedCountries = getConnection().data.scratched.countries;

    res.render('map', {
    title: 'World Map',
    maptype: 'c',
    objectList: countriesList,
    scratchedObjects: scratchedCountries
  });
});

// states map
export const getStateMap = ((req, res, next) => {
  let statesList = getConnection().data.states;
  let scratchedStates = getConnection().data.scratched.states;

  res.render('map', {
    title: 'US States',
    maptype: 's',
    objectList: statesList,
    scratchedObjects: scratchedStates
  });
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
  } else if (req.body.type.length !== 1) {
    // scratch type length
    return res.status(422).json({ status: 422, message: 'Invalid object length' }).send();
  } else if (req.body.type !== 'c' && req.body.type !== 's') {
    // scratch type - country/state
    return res.status(422).json({ status: 422, message: 'Invalid object type' }).send();
  } else if (req.body.code.length !== 2) {
    // country/state code length
    return res.status(422).json({ status: 422, message: 'Invalid code length' }).send();
  } else if (req.body.year.length < 0 || req.body.year.length > 4) {
    // year length
    return res.status(422).json({ status: 422, message: 'Invalid year length' }).send();
  } else if (/^\d+\.\d+$/.test(req.body.year)) {
    // year only contains numbers
    return res.status(422).json({ status: 422, message: 'Invalid year' }).send();
  } else if (req.body.url.length < 0 || req.body.url.length > 1024) {
    // url length
    return res.status(422).json({ status: 422, message: 'Invalid url length' }).send();
  } else {
    let countriesList = getConnection().data.countries;
    let statesList = getConnection().data.states;

    // check that the country/state code exists
    if (req.body.type == 'c') {
      if (!(req.body.code.toUpperCase() in countriesList)) {
        return res.status(422).json({ status: 422, message: 'Invalid object code' }).send();
      }
    } else if (req.body.type == 's') {
      if (!(req.body.code.toUpperCase() in statesList)) {
        return res.status(422).json({ status: 422, message: 'Invalid object code' }).send();
      }
    }

    // new scratch
    if (req.body.scratch) {
      // check if already scratched
      let exists = false;
      let existsIndex = null;
      if (req.body.type == 'c') {
        for (let i=0; i < getConnection().data.scratched.countries.length; i++) {
          if (getConnection().data.scratched.countries[i].code.toUpperCase() == req.body.code.toUpperCase()) {
            exists = true;
            existsIndex = i;
          }
        }

        if (exists) {
          // update existing scratch
          getConnection().data.scratched.countries[existsIndex].year = req.body.year;
          getConnection().data.scratched.countries[existsIndex].url = req.body.url;
        } else {
          // add new scratch
          getConnection().data.scratched.countries.push({
            'code': req.body.code.toUpperCase(),
            'year': req.body.year || '',
            'url': req.body.url || ''
          });
        }
      } else if (req.body.type == 's') {
        for (let i=0; i < getConnection().data.scratched.states.length; i++) {
          if (getConnection().data.scratched.states[i].code.toUpperCase() == req.body.code.toUpperCase()) {
            exists = true;
            existsIndex = i;
          }
        }

        if (exists) {
          // update existing scratch
          getConnection().data.scratched.states[existsIndex].year = req.body.year;
          getConnection().data.scratched.states[existsIndex].url = req.body.url;
        } else {
          // add new scratch
          getConnection().data.scratched.states.push({
            'code': req.body.code.toUpperCase(),
            'year': req.body.year || '',
            'url': req.body.url || ''
          });
        }
      }
      getConnection().write();
    } else {
      // undo scratch
      let scratched = getConnection().data.scratched;
      let objectIndex = null;
      if (req.body.type == 'c') {
        objectIndex = scratched.countries.findIndex(x => x.code == req.body.code.toUpperCase());
      } else if (req.body.type == 's') {
        objectIndex = scratched.states.findIndex(x => x.code == req.body.code.toUpperCase());
      }

      if (objectIndex > -1) {
        if (req.body.type == 'c') {
          scratched.countries.splice(objectIndex, 1);
        } else if (req.body.type == 's') {
          scratched.states.splice(objectIndex, 1);
        }

        getConnection().data.scratched = scratched;
        getConnection().write();
      } else {
        return res.status(422).json({ status: 422, message: `Unable to unscratch ${req.body.code.toUpperCase()}` }).send();
      }
    }

    let returnedScratched = {};
    if (req.body.type == 'c') {
      returnedScratched = getConnection().data.scratched.countries;
    } else if (req.body.type == 's') {
      returnedScratched = getConnection().data.scratched.states;
    }

    // return the new scratched values
    return res.status(200).json({
      status: 200,
      message: `${req.body.code.toUpperCase()} successfully ${req.body.scratch ? 'scratched' : 'unscratched'}!`,
      scratched: returnedScratched
    });
  }
});