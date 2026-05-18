import express from "express";
import Validate from "../middleware/validate.js";
import { check } from "express-validator";
import { Login, Logout } from "../controllers/auth.js";
import { Verify } from "../middleware/verify.js";

const router = express.Router();

router.post(
    "/login",
    check("username").not().isEmpty(),
    check("password").not().isEmpty(),
    Validate,
    Login
);

router.post(
    "/logout",
    Verify,
    Logout
);

export default router;
