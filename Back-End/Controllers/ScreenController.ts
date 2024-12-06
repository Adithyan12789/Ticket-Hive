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

      const currentDate = new Date().toISOString().split("T")[0];
      
      const updatedShowTimes = showTimes.map((show: any) => ({
        ...show,
        date: currentDate,
      }));

      const ScreenData = {
        screenNumber,
        capacity,
        showTimes: updatedShowTimes,
        theater: theaterId,
      };

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
      const { screenId } = req.params;
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

      const { screenNumber, capacity, showTimes } = req.body;

      const updateData = {
        screenNumber,
        capacity,
        showTimes,
      };

      const updatedScreen = await ScreenService.editScreenHandler(
        theaterOwnerId,
        screenId,
        updateData
      );

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
      const { id } = req.params;

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
      const { screenId } = req.params;

      console.log('screenId: ', screenId);

      try {
        const screen = await ScreenService.getScreensByIdService(screenId);

        console.log('screen: ', screen);

        res.status(200).json(screen);
      } catch (error: any) {
        res
          .status(500)
          .json({ message: error?.message || "Internal server error" });
      }
    }
  );

  getTheatersByMovieName = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { movieName } = req.params;

      if (!movieName) {
        res.status(400).json({ error: "Movie name is required" });
        return;
      }

      try {
        const theaters = await ScreenService.getTheatersByMovieNameService(
          movieName
        );

        if (!theaters.length) {
          res
            .status(404)
            .json({ message: "No theaters found for the specified movie" });
          return;
        }

        res.status(200).json(theaters);
      } catch (error: any) {
        res
          .status(500)
          .json({ message: error?.message || "Internal server error" });
      }
    }
  );

  updateSeatAvailability = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { screenId, selectedSeats, holdSeat, showTime } = req.body;

      if (!screenId || !Array.isArray(selectedSeats)) {
        res
          .status(400)
          .json({
            error: "Invalid data. 'screenId' and 'selectedSeats' are required.",
          });
        return;
      }

      try {
        const updatedSeats = await ScreenService.updateSeatAvailabilityHandler(
          screenId,
          selectedSeats,
          holdSeat,
          showTime
        );

        if (!updatedSeats) {
          res
            .status(404)
            .json({ message: "Screen not found or unable to update seats." });
          return;
        }

        res.status(200).json({
          message: "Seat availability updated successfully.",
          updatedSeats,
        });
      } catch (error: any) {
        console.error("Error updating seat availability:", error);
        res
          .status(500)
          .json({ message: error.message || "Internal server error" });
      }
    }
  );
}

export default new ScreenController();
