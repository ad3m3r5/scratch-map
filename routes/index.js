import express from 'express';
var router = express.Router();

// import controllers
import {
  getHome,
  getWorldMap,
  getStateMap,
  postScratch,
} from '../controllers/index.js';

router.get('/', getHome);
router.get('/worldmap', getWorldMap);
router.get('/statemap', getStateMap);
router.post('/scratch', postScratch);

export default router;