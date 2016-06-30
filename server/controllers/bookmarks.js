/* eslint-disable new-cap, no-param-reassign, consistent-return */

import express from 'express';
import Bookmark from '../models/bookmark';
import joi from 'joi';
const router = module.exports = express.Router();

router.post('/', (req, res) => {
  const schema = {
    title: joi.string().required(),
    url: joi.string().uri().required(),
    description: joi.string(),
    isProtected: joi.boolean(),
    datePublished: joi.date().min('1995-01-01'),
    dateCreated: joi.date(),
    stars: joi.number().min(1).max(5),
    tags: joi.array().items(joi.string()).min(1),
  };

  const results = joi.validate(req.body, schema);

  if (results.error) {
    return res.status(400).send({ messages: results.error.details.map(d => d.message) });
  }

  Bookmark.create(results.value, (err, bookmark) => {
    res.send({ bookmark });
  });
});
