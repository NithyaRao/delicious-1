/* eslint-disable newline-per-chained-call, new-cap, no-param-reassign, consistent-return, no-underscore-dangle, array-callback-return, max-len */

import express from 'express';
import Bookmark from '../models/bookmark';
import createValidator from '../validators/bookmarks/create';
import indexValidator from '../validators/bookmarks/index';
import idValidator from '../validators/bookmarks/id';
const router = module.exports = express.Router();

// index
router.get('/', indexValidator, (req, res) => {
  Bookmark.find(res.locals.filter)
          .sort(res.locals.sort)
          .limit(res.locals.limit)
          .skip(res.locals.skip)
          .exec((err, bookmarks) => {
            res.send({ bookmarks });
          });
});

// show
router.get('/:id', idValidator, (req, res) => {
  Bookmark.findById(req.params.id, (err, bookmark) => {
    res.send({ bookmark });
  });
});

// create
router.post('/', createValidator, (req, res) => {
  Bookmark.create(res.locals, (err, bookmark) => {
    res.send({ bookmark });
  });
});

// delete
router.delete('/:id', idValidator, (req, res) => {
  Bookmark.findByIdAndRemove(req.params.id, (err, bookmark) => {
    if (bookmark) {
      res.send({ id: bookmark._id });
    } else {
      res.status(400).send({ messages: ['id not found'] });
    }
  });
});
