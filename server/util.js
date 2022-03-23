const { Op } = require("sequelize");

const searchQueryToWhereClause = (query, fields) => {
  return {
    [Op.or]: fields.map((field) => ({
      [field]: {
        [Op.like]: `%${query}%`,
      },
    })),
  };
};

const delay = (fn, ms) => {
  let timer;

  return (...args) => {
    clearTimeout(timer);

    timer = setTimeout(fn.bind(this, ...args), ms || 0);
  };
};

module.exports = { searchQueryToWhereClause, delay };
