import fs from 'fs';
import path from "path";
import validator from 'validator';

import { validTypes, getConnection } from '../utils/database.js';

const maxURLLength = 1024;
const validatorURLOptions = {
  require_protocol: true
};

// home page
export const getHome = ((req, res, next) => {
  let dbData = getConnection().data;
  let scratched = dbData.scratched;

  let unscratchedLists = {};
  for (let i = 0; i < validTypes.length; i++) {

    // get list of unscratched entities
    unscratchedLists[validTypes[i]] = {};
    for (const [key, value] of Object.entries(dbData[validTypes[i]])) {
      let index = scratched[validTypes[i]].findIndex(x => x.code == key);
      if (index == -1) unscratchedLists[validTypes[i]][key] = value;
    }

    // add names to scratched list
    for (let j = 0; j < scratched[validTypes[i]].length; j++) {
      for (const [key, value] of Object.entries(dbData[validTypes[i]])) {
        if (scratched[validTypes[i]][j].code == key) {
          scratched[validTypes[i]][j].name = value;
        }
      }
    }
  }

  res.render('index', {
    title: 'Home',
    dbData,
    validTypes,
    parseTypeName,
    unscratchedLists,
    scratchedLists: scratched
  });
});

// map
export const getMap = ((req, res, next) => {
  let mapType = req.params.mapType;

  if (!validTypes.includes(mapType)) {
    res.render('error', { status: '404', message: `${req.originalUrl} Not Found` });
  } else {
    let objectList = getConnection().data[mapType];
    let scratchedObjects = getConnection().data.scratched[mapType];

    res.render('map', {
      title: parseTypeName(mapType),
      mapType,
      validTypes,
      objectList,
      scratchedObjects,
      enableShare: global.ENABLE_SHARE,
      mapSVG: fs.readFileSync(path.join(global.__rootDir, `/public/images/${mapType}.svg`))
    });
  }
});

// view
export const getView = ((req, res, next) => {
  let mapType = req.params.mapType;

  if (!validTypes.includes(mapType)) {
    res.render('error', { status: '404', message: `${req.originalUrl} Not Found` });
  } else {
    let scratchedObjects = getConnection().data.scratched[mapType];

    res.render('view', {
      title: parseTypeName(mapType),
      mapType,
      validTypes,
      scratchedObjects,
      mapSVG: fs.readFileSync(path.join(global.__rootDir, `/public/images/${mapType}.svg`))
    });
  }
});

// scratch endpoint
export const postScratch = (async (req, res, next) => {

  if (global.LOG_LEVEL == 'DEBUG') {
    console.debug(req.body);
  }

  if (Object.keys(req.body).length !== 5) {
    // body attribute count
    return res.status(422).json({ status: 422, message: 'Invalid attir length' }).send();
  } else if (typeof req.body.type !== 'string' || typeof req.body.code !== 'string' || typeof req.body.scratch !== 'boolean' || typeof req.body.year !== 'string' || typeof req.body.url !== 'string') {
    // body attribute data types
    return res.status(422).json({ status: 422, message: 'Invalid data type' }).send();
  } else if (req.body.type.length < 0 || req.body.type.length > 30) {
    // scratch type length
    return res.status(422).json({ status: 422, message: 'Invalid object length' }).send();
  } else if (!validTypes.includes(req.body.type)) {
    // scratch type
    return res.status(422).json({ status: 422, message: 'Invalid object type' }).send();
  } else if (req.body.code.length < 1 || req.body.code.length > 3) {
    // country/state code length
    return res.status(422).json({ status: 422, message: 'Invalid code length' }).send();
  } else if (req.body.year.length < 0 || req.body.year.length > 6) {
    // year length
    return res.status(422).json({ status: 422, message: 'Invalid year length' }).send();
  } else if (req.body.year.length > 0 && !isValidYear(req.body.year)) {
    // year only contains numbers
    return res.status(422).json({ status: 422, message: 'Invalid year' }).send();
  } else if (req.body.url.length < 0 || req.body.url.length > maxURLLength) {
    // url length
    return res.status(422).json({ status: 422, message: 'Invalid url length' }).send();
  } else if (req.body.url.length > 0 && !validator.isURL(req.body.url, validatorURLOptions)) {
    // check URL validity
    return res.status(422).json({ status: 422, message: 'Invalid url' }).send();
  } else {
    // check that the country/state code exists
    if (!(req.body.code.toUpperCase() in getConnection().data[req.body.type])) {
      return res.status(422).json({ status: 422, message: 'Invalid object code' }).send();
    }

    let sanitizedUrl = sanitizeInput(req.body.url);

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
        scratched[req.body.type][existsIndex].url = sanitizedUrl;
      } else {
        // add new scratch
        scratched[req.body.type].push({
          'code': req.body.code.toUpperCase(),
          'year': req.body.year || '',
          'url': sanitizedUrl || ''
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
  const regex = /^(0|[1-9]\d*)$/;

  return regex.test(year);
}

function parseTypeName(name) {
  let spaced = name.replaceAll('-', ' ');
  let words = spaced.split(' ');

  for (let i = 0; i < words.length; i++) {
    words[i] = words[i][0].toUpperCase() + words[i].substr(1);
  }

  return words.join(' ');
}

function sanitizeInput(string) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    "/": '&#x2F;',
  };
  const reg = /[&<>"'/]/ig;
  return string.replace(reg, (match)=>(map[match]));
}
