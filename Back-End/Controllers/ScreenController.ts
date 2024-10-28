import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import ScreenService from "../Services/ScreenService";
import { CustomRequest } from "../Middlewares/TheaterAuthMiddleware";
import { Request, Response } from "express";

class ScreenController {
    validateScreenData = [
        body("screenNumber")
            .isInt({ min: 1 })
            .withMessage("Screen number must be a positive integer"),
        body("capacity")
            .isInt({ min: 1 })
            .withMessage("Capacity must be at least 1"),
        body("layout").isArray().withMessage("Layout must be an array"),
        body("showTimes").isArray().withMessage("Show times must be an array"),
    ];

    addScreen = asyncHandler(
        async (req: CustomRequest, res: Response): Promise<void> => {
            const { theaterId } = req.params;
            const theaterOwnerId = req.theaterOwner?._id;

            console.log("body: ", req.body);
            console.log("theaterId: ", theaterId);
            console.log("theaterOwnerId: ", theaterOwnerId);
            

            if (!theaterOwnerId) {
                res.status(400).json({ error: "Theater owner ID is required." });
                return;
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }

            const { screenNumber, capacity, layout, showTimes } = req.body;

            const ScreenData = {
                screenNumber,
                capacity,
                layout,
                showTimes,
                theater: theaterId,
            };

            const createdScreen = await ScreenService.addScreenHandler(
                theaterOwnerId,
                ScreenData
            );

            console.log("createdScreen: ", createdScreen);
            

            res.status(201).json({ message: "Screen created successfully", createdScreen });
        }
    );
}

export default new ScreenController();
