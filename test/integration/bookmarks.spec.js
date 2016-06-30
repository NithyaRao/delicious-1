/* eslint-disable no-unused-expressions, no-underscore-dangle, max-len */

const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../dst/server');
const mongoose = require('mongoose');

describe('bookmarks', () => {
  beforeEach((done) => {
    mongoose.connection.db.dropDatabase(() => {
      done();
    });
  });

  describe('post /bookmarks', () => {
    it('should create a bookmark', (done) => {
      request(app)
      .post('/bookmarks')
      .send({ title: 'a', url: 'b', description: 'c',
              isProtected: true, datePublished: '2016-03-15',
              stars: 3, tags: ['d', 'e'] })
      .end((err, rsp) => {
        expect(err).to.be.null;
        expect(rsp.status).to.equal(200);
        expect(rsp.body.bookmark.__v).to.not.be.null;
        expect(rsp.body.bookmark._id).to.not.be.null;
        expect(rsp.body.bookmark.url).to.equal('b');
        done();
      });
    });

    it('should NOT create a bookmark - missing title', (done) => {
      request(app)
      .post('/bookmarks')
      .send({ url: 'b', description: 'c',
              isProtected: true, datePublished: '2016-03-15',
              stars: 3, tags: ['d', 'e'] })
      .end((err, rsp) => {
        expect(err).to.be.null;
        expect(rsp.status).to.equal(400);
        expect(rsp.body.messages).to.deep.equal(['"title" is required']);
        done();
      });
    });

    it('should NOT create a bookmark - date is too old', (done) => {
      request(app)
      .post('/bookmarks')
      .send({ title: 'a', url: 'b', description: 'c',
              isProtected: true, datePublished: '1816-03-15',
              stars: 3, tags: ['d', 'e'] })
      .end((err, rsp) => {
        expect(err).to.be.null;
        expect(rsp.status).to.equal(400);
        expect(rsp.body.messages).to.deep.equal(['"datePublished" must be larger than or equal to "Sat Dec 31 1994 18:00:00 GMT-0600 (CST)"']);
        done();
      });
    });
  });
});
