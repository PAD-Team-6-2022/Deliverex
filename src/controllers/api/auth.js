const { Response, Request } = require("express");
const AuthService = require("../../services/auth");
const jwt = require("jsonwebtoken");

/**
 * This controller handles all the
 * authentication methods such as
 * logging in and registering.
 * 
 * @author Team 6
 * @since 1.0
 */
const AuthController = {
    /**
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    login: async (req, res) => {
        const loggedIn = await AuthService.login(req.body.username, req.body.password);

        if(loggedIn) {
            res.status(200);
            res.json({
                success: true
            }); 
        } else {
            res.status(403);
            res.json({
                success: false
            });
        }
    }
}

module.exports = AuthController;