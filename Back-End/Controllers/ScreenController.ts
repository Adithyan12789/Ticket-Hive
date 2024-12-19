import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import ScreenService from "../Services/ScreenService";
import { CustomRequest } from "../Middlewares/TheaterAuthMiddleware";
import { Request, Response } from "express";
import { Screens } from "../Models/ScreensModel";
import TheaterDetails from "../Models/TheaterDetailsModel";
import { ISeat, IShowTime, Schedule } from "../Models/ScheduleModel";
import mongoose from "mongoose";

class ScreenController {
  // Validation for adding/updating screens
  validateScreenData = [
    body("screenNumber")
      .isInt({ min: 1 })
      .withMessage("Screen number must be a positive integer"),
    body("capacity")
      .isInt({ min: 1 })
      .withMessage("Capacity must be at least 1"),
    body("layout")
      .isArray({ min: 1 })
      .withMessage("Layout must be a non-empty array")
      .custom((layout) =>
        layout.every(
          (row: any[]) =>
            Array.isArray(row) &&
            row.every(
              (seat) =>
                typeof seat.label === "string" &&
                typeof seat.isAvailable === "boolean"
            )
        )
      )
      .withMessage(
        "Each layout row must be an array of objects with label and isAvailable properties"
      ),
  ];
  
  addScreen = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { theaterId } = req.params;
      const { screenNumber, capacity, showTimes } = req.body;
  
      try {
        const theater = await TheaterDetails.findById(theaterId);
  
        if (!theater) {
          res.status(404).json({ message: 'Theater not found' });
          return;
        }
  
        const existingScreen = await Screens.findOne({ theater: theaterId, screenNumber });
  
        if (existingScreen) {
          res.status(400).json({ message: 'Screen number already exists in this theater' });
          return;
        }
  
        // Create a new screen
        const newScreen = new Screens({
          theater: theaterId,
          screenNumber,
          capacity,
          layout: [], // Empty layout, can be updated later
        });
  
        const savedScreen = await newScreen.save();
  
        // Format and save the schedule
        const formattedShowTimes: IShowTime[] = showTimes.map((showTime: any) => ({
          time: showTime.time,
          movie: showTime.movie,
          movieTitle: showTime.movieTitle,
          layout: showTime.layout?.map((row: ISeat[]) =>
            row.map((seat: ISeat) => ({
              label: seat.label,
              isAvailable: true,
            }))
          ) || [], // Initialize layout if provided
        }));
        
        const formattedDate = new Date().toISOString().split("T")[0]

        console.log("formattedDate6666: ", formattedDate);
        
        const newSchedule = new Schedule({
          screen: savedScreen._id,
          date: formattedDate,
          showTimes: formattedShowTimes,
        });    
        
        await newSchedule.save();
  
        // Optionally add the schedule ID to the screen (if needed)
        savedScreen.schedule = [newSchedule._id as mongoose.Types.ObjectId];

        await savedScreen.save();
  
        res.status(201).json({
          message: 'Screen and schedule added successfully',
          screen: savedScreen,
          schedule: newSchedule,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add screen', error: error });
      }
    }
  );  
  
  // Update screen details
  updateScreen = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { theaterId, screenId } = req.params; // Get theater ID and screen ID from URL
      const { screenNumber, capacity, showTimes } = req.body; // Get screen details and showtimes from the request body
    
      try {
        // Check if the theater exists
        const theater = await TheaterDetails.findById(theaterId);
        if (!theater) {
          res.status(404).json({ message: 'Theater not found' });
          return;
        }
    
        // Check if the screen exists
        const screen = await Screens.findById(screenId);
        if (!screen) {
          res.status(404).json({ message: 'Screen not found' });
          return;
        }
    
        // Check if the new screen number already exists in the theater (if the screen number is being updated)
        if (screenNumber !== screen.screenNumber) {
          const existingScreen = await Screens.findOne({ theater: theaterId, screenNumber });
          if (existingScreen) {
            res.status(400).json({ message: 'Screen number already exists in this theater' });
            return;
          }
        }
    
        // Update the screen with the new details
        screen.screenNumber = screenNumber;
        screen.capacity = capacity;
    
        // Save the updated screen
        const updatedScreen = await screen.save();
    
        // If showtimes are provided, update the schedule for the screen
        if (showTimes) {
          // Format the showtimes
          const formattedShowTimes: IShowTime[] = showTimes.map((showTime: { time: any; movie: any; movieTitle: any; layout: ISeat[][]; }) => ({
            time: showTime.time,
            movie: showTime.movie,
            movieTitle: showTime.movieTitle,
            layout: showTime.layout.map((row: ISeat[]) =>
              row.map((seat: ISeat) => ({
                label: seat.label,
                isAvailable: true, // All seats are available by default
              }))
            ),
          }));
    
          // Find the existing schedule and update the showtimes
          const schedule = await Schedule.findOne({ screen: screenId });
          if (!schedule) {
            res.status(404).json({ message: 'Schedule not found for the specified screen' });
            return;
          }
    
          schedule.showTimes = formattedShowTimes;
    
          // Save the updated schedule
          await schedule.save();
        }
    
        // Respond with the updated screen and schedule
        res.status(200).json({
          message: 'Screen updated successfully',
          screen: updatedScreen,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update screen', error: error });
      }
    }
  );
  

  // Validation for schedules
  validateScheduleData = [
    body("screen").isMongoId().withMessage("Screen ID must be valid"),
    body("showTimes").isArray().withMessage("Show times must be an array"),
    body("showTimes.*.time").notEmpty().withMessage("Show time is required"),
    body("showTimes.*.movie").isMongoId().withMessage("Movie ID must be valid"),
    body("showTimes.*.movieTitle")
      .notEmpty()
      .withMessage("Movie title is required"),
  ];

  addSchedule = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { screen, date, showTimes } = req.body;

      // Pass screenId and scheduleData to the service method
      const createdSchedule = await ScreenService.addScheduleHandler(screen, {
        date,
        showTimes,
      });

      res
        .status(201)
        .json({ message: "Schedule created successfully", createdSchedule });
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
        const screenDetails = await ScreenService.getScreensWithSchedulesByTheaterIdsService(id);
        if (!screenDetails || screenDetails.length === 0) {
          res.status(404).json({ message: "Screens not found" });
          return;
        }
        res.status(200).json(screenDetails);
      } catch (error: any) {
        res.status(500).json({ message: error?.message || "Internal server error" });
      }
    }
  );

  getScreensById = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      console.log( " entered getScreensById");

      const { screenId } = req.params;

      console.log("screenId: ", screenId);
  
      try {
        const screenWithSchedules = await ScreenService.getScreensByIdService(screenId);

        console.log("screenWithSchedules: ", screenWithSchedules);
        
        res.status(200).json(screenWithSchedules);
      } catch (error: any) {
        res
          .status(500)
          .json({ message: error?.message || "Internal server error" });
      }
    }
  );

  // getUserScreensById = asyncHandler(
  //   async (req: CustomRequest, res: Response): Promise<void> => {
  //     console.log("entered");
      

  //     const { screenId } = req.params;
  //     const { date, movieTitle, showTime } = req.query;
      
  //     console.log("req.params: ", req.params);
  //     console.log("req.query: ", req.query);
  
  //     try {
  //       const screenWithSchedules = await ScreenService.getUserScreensByIdService(
  //         screenId,
  //         date as string, 
  //         movieTitle as string, 
  //         showTime as string
  //       );

  //       console.log("screenWithSchedules: ", screenWithSchedules);
  
  //       res.status(200).json(screenWithSchedules);
  //     } catch (error: any) {
  //       res
  //         .status(500)
  //         .json({ message: error?.message || "Internal server error" });
  //     }
  //   }
  // );  
  

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

      const { scheduleId, selectedSeats, holdSeat, showTime } = req.body;

      if (!scheduleId || !Array.isArray(selectedSeats)) {
        res.status(400).json({
          error: "Invalid data. 'scheduleId' and 'selectedSeats' are required.",
        });
        return;
      }

      try {
        const updatedSeats = await ScreenService.updateSeatAvailabilityHandler(
          scheduleId,
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
