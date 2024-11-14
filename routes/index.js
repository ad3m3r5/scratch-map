import express from 'express';
var router = express.Router();

// import controllers
import {
  getHome,
  getMap,
  getView,
  postScratch
} from '../controllers/index.js';

router.get('/', getHome);
router.get('/map/:mapType', getMap);
if (global.ENABLE_SHARE) router.get('/view/:mapType', getView);
router.post('/scratch', postScratch);

export default router;
