const UsersService = require("./users");
const { compareSync } = require("bcrypt");

/**
 * This is a CRUD-service that
 * interacts with the user model.
 * 
 * @author Team 6
 * @since 1.0
 */
const AuthService = {
    login: async (username, password) => {
        const user = await UsersService.getByUsername(username);

        if(compareSync(password, user.password)) return true;
    }
}

module.exports = AuthService;