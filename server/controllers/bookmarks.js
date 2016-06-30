/* eslint-disable new-cap, no-param-reassign */

import express from 'express';
import Bookmark from '../models/bookmark';
const router = module.exports = express.Router();

router.post('/', (req, res) => {
  Bookmark.create(req.body, (err, bookmark) => {
    res.send({ bookmark });
  });
});
