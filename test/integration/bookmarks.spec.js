/* eslint-disable no-unused-expressions, no-underscore-dangle, max-len */

const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../dst/server');
const cp = require('child_process');
const Bookmark = require('../../dst/models/bookmark');

describe('bookmarks', () => {
  beforeEach((done) => {
    cp.execFile(`${__dirname}/../scripts/populate.sh`, { cwd: `${__dirname}/../scripts` }, () => {
      done();
    });
  });

  describe('delete /bookmarks/:id', () => {
    it('should delete a bookmark', (done) => {
      Bookmark.create({ title: 'a', description: 'b', url: 'c' }, (err1, bm) => {
        const id = bm._id.toString();
        request(app)
        .delete(`/bookmarks/${id}`)
        .end((err2, rsp) => {
          expect(err2).to.be.null;
          expect(rsp.status).to.equal(200);
          expect(rsp.body.id).to.equal(id);
          done();
        });
      });
    });

    it('should NOT delete a bookmark - does not exist', (done) => {
      request(app)
      .delete('/bookmarks/01234567890123456789abcd')
      .end((err2, rsp) => {
        expect(err2).to.be.null;
        expect(rsp.status).to.equal(400);
        expect(rsp.body.messages[0]).to.equal('id not found');
        done();
      });
    });

    it('should NOT delete a bookmark - bad id', (done) => {
      request(app)
      .delete('/bookmarks/wrong')
      .end((err2, rsp) => {
        expect(err2).to.be.null;
        expect(rsp.status).to.equal(400);
        expect(rsp.body.messages[0]).to.contain('"id" with value "wrong" fails to match the required pattern');
        done();
      });
    });
  });

  describe('post /bookmarks', () => {
    it('should create a bookmark', (done) => {
      request(app)
      .post('/bookmarks')
      .send({ title: 'a', url: 'http://google.com', description: 'c',
              isProtected: true, datePublished: '2016-03-15',
              stars: 3, tags: ['d', 'e'] })
      .end((err, rsp) => {
        expect(err).to.be.null;
        expect(rsp.status).to.equal(200);
        expect(rsp.body.bookmark.__v).to.not.be.null;
        expect(rsp.body.bookmark._id).to.not.be.null;
        expect(rsp.body.bookmark.url).to.equal('http://google.com');
        done();
      });
    });

    it('should NOT create a bookmark - missing title', (done) => {
      request(app)
      .post('/bookmarks')
      .send({ url: 'http://google.com', description: 'c',
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
      .send({ title: 'a', url: 'http://google.com', description: 'c',
              isProtected: true, datePublished: '1816-03-15',
              stars: 3, tags: ['d', 'e'] })
      .end((err, rsp) => {
        expect(err).to.be.null;
        expect(rsp.status).to.equal(400);
        expect(rsp.body.messages).to.deep.equal(['"datePublished" must be larger than or equal to "Sat Dec 31 1994 18:00:00 GMT-0600 (CST)"']);
        done();
      });
    });

    it('should NOT create a bookmark - url is malformed', (done) => {
      request(app)
      .post('/bookmarks')
      .send({ title: 'a', url: 'garbage', description: 'c',
              isProtected: true, datePublished: '2016-03-15',
              stars: 3, tags: ['d', 'e'] })
      .end((err, rsp) => {
        expect(err).to.be.null;
        expect(rsp.status).to.equal(400);
        expect(rsp.body.messages).to.deep.equal(['"url" must be a valid uri']);
        done();
      });
    });

    it('should NOT create a bookmark - stars has wrong number', (done) => {
      request(app)
      .post('/bookmarks')
      .send({ title: 'a', url: 'http://google.com', description: 'c',
              isProtected: true, datePublished: '2016-03-15',
              stars: 20, tags: ['d', 'e'] })
      .end((err, rsp) => {
        expect(err).to.be.null;
        expect(rsp.status).to.equal(400);
        expect(rsp.body.messages).to.deep.equal(['"stars" must be less than or equal to 5']);
        done();
      });
    });

    it('should NOT create a bookmark - must have at least one tag', (done) => {
      request(app)
      .post('/bookmarks')
      .send({ title: 'a', url: 'http://google.com', description: 'c',
              isProtected: true, datePublished: '2016-03-15',
              stars: 3, tags: [] })
      .end((err, rsp) => {
        expect(err).to.be.null;
        expect(rsp.status).to.equal(400);
        expect(rsp.body.messages).to.deep.equal(['"tags" must contain at least 1 items']);
        done();
      });
    });
  });
});
