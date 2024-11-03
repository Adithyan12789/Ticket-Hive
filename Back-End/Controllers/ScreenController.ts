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
    body("showTimes")
      .isArray()
      .withMessage("Show times must be an array")
      .custom((value) => {
        if (!Array.isArray(value)) {
          throw new Error("Show times must be an array");
        }
        value.forEach((item) => {
          if (typeof item !== "object" || !item.time || !item.movie) {
            throw new Error(
              "Each show time must be an object with 'time' and 'movie' properties"
            );
          }
        });
        return true;
      }),
  ];

  addScreen = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      console.log("dfbxcvbxd");

      const { theaterId } = req.params;
      const theaterOwnerId = req.theaterOwner?._id;

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
        showTimes, // Ensure this follows the new structure of showTimes array with objects { time, movie }
        theater: theaterId,
      };

      console.log("Screen Data:", ScreenData);

      const createdScreen = await ScreenService.addScreenHandler(
        theaterOwnerId,
        ScreenData
      );

      res
        .status(201)
        .json({ message: "Screen created successfully", createdScreen });
    }
  );

  updateScreen = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      console.log("dfbcvbdhdfb");
      
      const { screenId } = req.params;
      const theaterOwnerId = req.theaterOwner?._id;

      console.log("screenId: ", screenId);
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

      console.log("req.body", req.body);

      const updateData = {
        screenNumber,
        capacity,
        layout,
        showTimes,
      };

      console.log("updateData", updateData);
      

      const updatedScreen = await ScreenService.editScreenHandler(
        theaterOwnerId,
        screenId,
        updateData
      );

      console.log("updatedScreen: ", updatedScreen);
      

      if (updatedScreen) {
        res
          .status(200)
          .json({ message: "Screen updated successfully", updatedScreen });
      } else {
        res
          .status(404)
          .json({ error: "Screen not found or unauthorized access" });
      }
    }
  );

  deleteScreen = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { screenId } = req.params;

      console.log("screenId: ", screenId);

      try {
        const deletedScreen = await ScreenService.deleteScreenHandler(screenId);

        if (!deletedScreen) {
          res.status(404).json({ message: "Screen not found for deletion" });
          return;
        }

        res
          .status(200)
          .json({ message: "Screen deleted successfully", deletedScreen });
      } catch (error: any) {
        console.error("Error deleting Screen:", error);
        res
          .status(500)
          .json({ message: "Error deleting Screen", error: error.message });
      }
    }
  );

  getScreensByTheaterId = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      console.log("helloooooooooooo");

      const { id } = req.params;
      console.log(id);

      try {
        const screen = await ScreenService.getScreensByTheaterIdsService(id);
        if (!screen) {
          res.status(404).json({ message: "Screen not found" });
          return;
        }
        res.status(200).json(screen);
      } catch (error: any) {
        res
          .status(500)
          .json({ message: error?.message || "Internal server error" });
      }
    }
  );

  getScreensById = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      console.log("hello");
      
      const { screenId } = req.params;
      console.log(screenId);

      try {
        const screen = await ScreenService.getScreensByIdService(screenId);
        if (!screen) {
          res.status(404).json({ message: "Screen not found" });
          return;
        }
        res.status(200).json(screen);
      } catch (error: any) {
        res
          .status(500)
          .json({ message: error?.message || "Internal server error" });
      }
    }
  );
}

export default new ScreenController();
