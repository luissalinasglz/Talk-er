import { Verify } from '../middleware/verify.js';
import Auth from './auth.js';
import Tutor from './tutor.js';
import Student from './student.js';
import Supervisor from './supervisor.js';

const Router = (server) => {
    server.use('/v1/auth', Auth);
    server.use('/v1/tutor', Tutor);
    server.use('/v1/student', Student);
    server.use('/v1/supervisor', Supervisor);

    server.get('/v1/user', Verify, (req, res) => {
        res.status(200).json({
        status: "success",
        message: "Welcome to the your Dashboard!",
        });
    });

    server.get("/v1", (req, res) => {
        try {
            res.status(200).json({
                status: "success",
                data: [],
                message: "Welcome to our API homepage!",
            });
        } catch (err) {
            res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });
        }
    })
};
export default Router;
