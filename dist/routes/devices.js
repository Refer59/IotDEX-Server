import express from "express";
import { protectRoute } from "../controllers/auth.js";
import { createDevice, deleteDevice, getAllDevices, updateDevice } from "../controllers/devices.js";
const devicesRouter = () => {
    const devicesRouter = express.Router();
    devicesRouter.route('')
        .get(protectRoute(['ADMIN']), getAllDevices)
        .post(protectRoute(['ADMIN']), createDevice);
    devicesRouter.route('/:id')
        /*.get(getDevice)*/
        .patch(protectRoute(['ADMIN']), updateDevice)
        .delete(protectRoute(['ADMIN']), deleteDevice);
    return devicesRouter;
};
export default devicesRouter;
//# sourceMappingURL=devices.js.map