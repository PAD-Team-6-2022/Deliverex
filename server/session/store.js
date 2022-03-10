const { Store: ExpressSessionStore } = require("express-session");
const { Op } = require("sequelize");
const Session = require("../models/session");

class SessionStore extends ExpressSessionStore {
  constructor() {
    super();

    // Set interval for each expiration check
    setInterval(() => {
      Session.destroy({
        where: {
          expiresAt: {
            [Op.lt]: new Date(),
          },
        },
      });
    }, 15 * 60 * 1000);
  }

  async get(id, callback) {
    return Session.findByPk(id)
      .then((session) => (session ? session.data : null))
      .then((session) => callback(null, session))
      .catch((err) => callback(err, null));
  }

  async set(id, data, callback) {
    const expiresAt =
      data.cookie && data.cookie.expires
        ? data.cookie.expires
        : new Date(Date.now() + 24 * 60 * 60 * 1000);

    return Session.findByPk(id)
      .then((session) => {
        if (session) {
          session.data = data;
          session.expiresAt = expiresAt;

          return session.save();
        } else {
          return Session.create({
            id,
            data,
            expiresAt,
          });
        }
      })
      .then((session) => callback(null, session.data))
      .catch((err) => callback(err, null));
  }

  async destroy(id, callback) {
    return Session.destroy({ where: { id } })
      .then(() => callback(null))
      .catch((err) => callback(err));
  }
}

module.exports = SessionStore;
