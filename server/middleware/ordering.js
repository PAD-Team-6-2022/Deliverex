const ordering = (req, res, next) => {
    const column = req.query.col || "id";
    const orderDirection = req.query.order || "asc";

    if(!(column === "id" || column === "email" ||
        column === "state" || column === "created_at"))
        throw Error("Invalid column parameter");

    if(!(orderDirection === "asc" || orderDirection === "desc"))
        throw Error("Invalid order parameter");

    req.col = column;
    req.order = orderDirection;

    next();
}

module.exports = ordering;