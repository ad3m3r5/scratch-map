import express from 'express';
var router = express.Router();

// import controllers
import {
  getHome,
  getMap,
  getShare,
  postScratch
} from '../controllers/index.js';

router.get('/', getHome);
router.get('/map/:mapType', getMap);
if (process.env.ENABLE_SHARE) router.get('/share/:mapType', getShare);
router.post('/scratch', postScratch);

export default router;