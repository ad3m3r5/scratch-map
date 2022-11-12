import express from 'express';
var router = express.Router();

// import controllers
import {
  getHome,
  getMap,
  postScratch,
} from '../controllers/index.js';

router.get('/', getHome);
router.get('/map/:mapType', getMap);
router.post('/scratch', postScratch);

export default router;