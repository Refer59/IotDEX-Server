import express from "express";
import { protectRoute } from "../controllers/auth.js";
import { createTour, deleteTour, getAllTours, getBestCheap5, getTour, getTourMonthlyPlan, getTourStats, updateTour } from "../controllers/tours.js";
const toursRouter = () => {
    const toursRouter = express.Router();
    toursRouter.route('/top-5-best-cheap').get(getBestCheap5, getAllTours);
    toursRouter.route('/tours-stats').get(getTourStats);
    toursRouter.route('/monthly-plan/:year').get(getTourMonthlyPlan);
    toursRouter.route('')
        .get(protectRoute([]), getAllTours)
        .post(protectRoute(['LEAD-GUIDE', 'ADMIN']), createTour);
    toursRouter.route('/:id')
        .get(getTour)
        .patch(protectRoute(['LEAD-GUIDE', 'ADMIN']), updateTour)
        .delete(protectRoute(['ADMIN']), deleteTour);
    return toursRouter;
};
export default toursRouter;
//# sourceMappingURL=tours.js.map