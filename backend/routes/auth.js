import express from "express";
import Validate from "../middleware/validate.js";
import { check } from "express-validator";
import { Login } from "../controllers/auth.js";

const router = express.Router();

router.post(
    "/login",
    check("username").not().isEmpty(),
    check("password").not().isEmpty(),
    Validate,
    Login
);

export default router;
