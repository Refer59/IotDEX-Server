import express from "express";
import { streamData } from "../controllers/broker.js";
const brokerRouter = () => {
    const brokerRouter = express.Router();
    brokerRouter.route('')
        .post(streamData);
    return brokerRouter;
};
export default brokerRouter;
//# sourceMappingURL=broker.js.map