import Auth from './auth.js';

const Router = (server) => {
server.use('/v1/auth', Auth);

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
