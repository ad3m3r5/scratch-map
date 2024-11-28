import fs from 'fs';
import path from "path";
import validator from 'validator';

import { validTypes, getConnection } from '../utils/database.js';

const maxURLLength = 2048;
const validatorURLOptions = {
  require_protocol: true
};
const validatorDateOptions = {
  strictMode: true,
  delimiters: ['-', '/'],
  format: 'MM-DD-YYYY'
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
      colors: {
        unscratched: global.COLOR_UNSCRATCHED,
        unscratched_hover: global.COLOR_UNSCRATCHED_HOVER,
        scratched: global.COLOR_SCRATCHED,
        text: global.COLOR_TEXT,
        outlines: global.COLOR_OUTLINES
      },
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
      colors: {
        unscratched: global.COLOR_UNSCRATCHED,
        unscratched_hover: global.COLOR_UNSCRATCHED_HOVER,
        scratched: global.COLOR_SCRATCHED,
        text: global.COLOR_TEXT,
        outlines: global.COLOR_OUTLINES
      },
      mapSVG: fs.readFileSync(path.join(global.__rootDir, `/public/images/${mapType}.svg`))
    });
  }
});

// scratch endpoint
export const postScratch = (async (req, res, next) => {

  if (global.LOG_LEVEL == 'DEBUG') {
    console.debug(req.body);
  }

  // Expected
  //  type: map type/name, string
  //  code: entity code, string
  //  scratch: entity scratched, boolean
  //  visits: array of visits, object
  //    date: visit date, string
  //    url: url to photo album, string

  // body attribute count
  if (Object.keys(req.body).length !== 4) {
    return res.status(422).json({ status: 422, message: 'Invalid attribute length' }).send();
    // body attribute data types
  } else if (typeof req.body.type !== 'string' || typeof req.body.code !== 'string' || typeof req.body.scratch !== 'boolean' || typeof req.body.visits !== 'object') {
    return res.status(422).json({ status: 422, message: 'Invalid data types' }).send();
    // scratch type length
  } else if (req.body.type.length < 0 || req.body.type.length > 30) {
    return res.status(422).json({ status: 422, message: 'Invalid object length' }).send();
    // scratch type
  } else if (!validTypes.includes(req.body.type)) {
    return res.status(422).json({ status: 422, message: 'Invalid object type' }).send();
    // country/state code length
  } else if (req.body.code.length < 1 || req.body.code.length > 3) {
    return res.status(422).json({ status: 422, message: 'Invalid code length' }).send();
    // check that the country/state code exists
  } else if (!(req.body.code.toUpperCase() in getConnection().data[req.body.type])) {
    return res.status(422).json({ status: 422, message: 'Invalid object code' }).send();
  } else {
    let sanitizedVisits = [];

    // check each visits attributes
    if (req.body.visits.length > 0) {
      for (let i = 0; i < req.body.visits.length; i++) {
        let visit = req.body.visits[i];

        // date validity
        if (visit.date.length > 0 && !validator.isDate(visit.date, validatorDateOptions)) {
          return res.status(422).json({ status: 422, message: 'Invalid date' }).send();
          // url length
        } else if (visit.url.length < 0 || visit.url.length > maxURLLength) {
          return res.status(422).json({ status: 422, message: 'Invalid url length' }).send();
          // url validity
        } else if (visit.url.length > 0 && !validator.isURL(visit.url, validatorURLOptions)) {
          return res.status(422).json({ status: 422, message: 'Invalid url' }).send();
        } else {
          // sanitize visit URLs
          sanitizedVisits.push({
            date: visit.date || '',
            url: sanitizeInput(visit.url) || ''
          });
        }
      }
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
        scratched[req.body.type][existsIndex].visits = sanitizedVisits;
      } else {
        // add new scratch
        scratched[req.body.type].push({
          code: req.body.code.toUpperCase(),
          visits: sanitizedVisits
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
