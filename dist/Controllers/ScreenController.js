"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const ScreenService_1 = __importDefault(require("../Services/ScreenService"));
const ScreensModel_1 = require("../Models/ScreensModel");
const TheaterDetailsModel_1 = __importDefault(require("../Models/TheaterDetailsModel"));
const ScheduleModel_1 = require("../Models/ScheduleModel");
class ScreenController {
    constructor() {
        // Validation for adding/updating screens
        this.validateScreenData = [
            (0, express_validator_1.body)("screenNumber")
                .isInt({ min: 1 })
                .withMessage("Screen number must be a positive integer"),
            (0, express_validator_1.body)("capacity")
                .isInt({ min: 1 })
                .withMessage("Capacity must be at least 1"),
            (0, express_validator_1.body)("layout")
                .isArray({ min: 1 })
                .withMessage("Layout must be a non-empty array")
                .custom((layout) => layout.every((row) => Array.isArray(row) &&
                row.every((seat) => typeof seat.label === "string" &&
                    typeof seat.isAvailable === "boolean")))
                .withMessage("Each layout row must be an array of objects with label and isAvailable properties"),
        ];
        this.addScreen = (0, express_async_handler_1.default)(async (req, res) => {
            const { theaterId } = req.params;
            const { screenNumber, capacity, showTimes } = req.body;
            try {
                const theater = await TheaterDetailsModel_1.default.findById(theaterId);
                if (!theater) {
                    res.status(404).json({ message: 'Theater not found' });
                    return;
                }
                const existingScreen = await ScreensModel_1.Screens.findOne({ theater: theaterId, screenNumber });
                if (existingScreen) {
                    res.status(400).json({ message: 'Screen number already exists in this theater' });
                    return;
                }
                // Create a new screen
                const newScreen = new ScreensModel_1.Screens({
                    theater: theaterId,
                    screenNumber,
                    capacity,
                    layout: [], // Empty layout, can be updated later
                });
                const savedScreen = await newScreen.save();
                // Format and save the schedule
                const formattedShowTimes = showTimes.map((showTime) => ({
                    time: showTime.time,
                    movie: showTime.movie,
                    movieTitle: showTime.movieTitle,
                    layout: showTime.layout?.map((row) => row.map((seat) => ({
                        label: seat.label,
                        isAvailable: true,
                    }))) || [], // Initialize layout if provided
                }));
                const formattedDate = new Date().toISOString().split("T")[0];
                console.log("formattedDate6666: ", formattedDate);
                const newSchedule = new ScheduleModel_1.Schedule({
                    screen: savedScreen._id,
                    date: formattedDate,
                    showTimes: formattedShowTimes,
                });
                await newSchedule.save();
                // Optionally add the schedule ID to the screen (if needed)
                savedScreen.schedule = [newSchedule._id];
                await savedScreen.save();
                res.status(201).json({
                    message: 'Screen and schedule added successfully',
                    screen: savedScreen,
                    schedule: newSchedule,
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Failed to add screen', error: error });
            }
        });
        // Update screen details
        this.updateScreen = (0, express_async_handler_1.default)(async (req, res) => {
            const { theaterId, screenId } = req.params; // Get theater ID and screen ID from URL
            const { screenNumber, capacity, showTimes } = req.body; // Get screen details and showtimes from the request body
            try {
                // Check if the theater exists
                const theater = await TheaterDetailsModel_1.default.findById(theaterId);
                if (!theater) {
                    res.status(404).json({ message: 'Theater not found' });
                    return;
                }
                // Check if the screen exists
                const screen = await ScreensModel_1.Screens.findById(screenId);
                if (!screen) {
                    res.status(404).json({ message: 'Screen not found' });
                    return;
                }
                // Check if the new screen number already exists in the theater (if the screen number is being updated)
                if (screenNumber !== screen.screenNumber) {
                    const existingScreen = await ScreensModel_1.Screens.findOne({ theater: theaterId, screenNumber });
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
                    const formattedShowTimes = showTimes.map((showTime) => ({
                        time: showTime.time,
                        movie: showTime.movie,
                        movieTitle: showTime.movieTitle,
                        layout: showTime.layout.map((row) => row.map((seat) => ({
                            label: seat.label,
                            isAvailable: true, // All seats are available by default
                        }))),
                    }));
                    // Find the existing schedule and update the showtimes
                    const schedule = await ScheduleModel_1.Schedule.findOne({ screen: screenId });
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
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Failed to update screen', error: error });
            }
        });
        // Validation for schedules
        this.validateScheduleData = [
            (0, express_validator_1.body)("screen").isMongoId().withMessage("Screen ID must be valid"),
            (0, express_validator_1.body)("showTimes").isArray().withMessage("Show times must be an array"),
            (0, express_validator_1.body)("showTimes.*.time").notEmpty().withMessage("Show time is required"),
            (0, express_validator_1.body)("showTimes.*.movie").isMongoId().withMessage("Movie ID must be valid"),
            (0, express_validator_1.body)("showTimes.*.movieTitle")
                .notEmpty()
                .withMessage("Movie title is required"),
        ];
        this.addSchedule = (0, express_async_handler_1.default)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const { screen, date, showTimes } = req.body;
            // Pass screenId and scheduleData to the service method
            const createdSchedule = await ScreenService_1.default.addScheduleHandler(screen, {
                date,
                showTimes,
            });
            res
                .status(201)
                .json({ message: "Schedule created successfully", createdSchedule });
        });
        this.deleteScreen = (0, express_async_handler_1.default)(async (req, res) => {
            const { screenId } = req.params;
            try {
                const deletedScreen = await ScreenService_1.default.deleteScreenHandler(screenId);
                if (!deletedScreen) {
                    res.status(404).json({ message: "Screen not found for deletion" });
                    return;
                }
                res
                    .status(200)
                    .json({ message: "Screen deleted successfully", deletedScreen });
            }
            catch (error) {
                console.error("Error deleting Screen:", error);
                res
                    .status(500)
                    .json({ message: "Error deleting Screen", error: error.message });
            }
        });
        this.getScreensByTheaterId = (0, express_async_handler_1.default)(async (req, res) => {
            const { id } = req.params;
            try {
                const screenDetails = await ScreenService_1.default.getScreensWithSchedulesByTheaterIdsService(id);
                if (!screenDetails || screenDetails.length === 0) {
                    res.status(404).json({ message: "Screens not found" });
                    return;
                }
                res.status(200).json(screenDetails);
            }
            catch (error) {
                res.status(500).json({ message: error?.message || "Internal server error" });
            }
        });
        this.getScreensById = (0, express_async_handler_1.default)(async (req, res) => {
            console.log(" entered getScreensById");
            const { screenId } = req.params;
            console.log("screenId: ", screenId);
            try {
                const screenWithSchedules = await ScreenService_1.default.getScreensByIdService(screenId);
                console.log("screenWithSchedules: ", screenWithSchedules);
                res.status(200).json(screenWithSchedules);
            }
            catch (error) {
                res
                    .status(500)
                    .json({ message: error?.message || "Internal server error" });
            }
        });
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
        this.getTheatersByMovieName = (0, express_async_handler_1.default)(async (req, res) => {
            const { movieName } = req.params;
            if (!movieName) {
                res.status(400).json({ error: "Movie name is required" });
                return;
            }
            try {
                const theaters = await ScreenService_1.default.getTheatersByMovieNameService(movieName);
                if (!theaters.length) {
                    res
                        .status(404)
                        .json({ message: "No theaters found for the specified movie" });
                    return;
                }
                res.status(200).json(theaters);
            }
            catch (error) {
                res
                    .status(500)
                    .json({ message: error?.message || "Internal server error" });
            }
        });
        this.updateSeatAvailability = (0, express_async_handler_1.default)(async (req, res) => {
            const { scheduleId, selectedSeats, holdSeat, showTime } = req.body;
            if (!scheduleId || !Array.isArray(selectedSeats)) {
                res.status(400).json({
                    error: "Invalid data. 'scheduleId' and 'selectedSeats' are required.",
                });
                return;
            }
            try {
                const updatedSeats = await ScreenService_1.default.updateSeatAvailabilityHandler(scheduleId, selectedSeats, holdSeat, showTime);
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
            }
            catch (error) {
                console.error("Error updating seat availability:", error);
                res
                    .status(500)
                    .json({ message: error.message || "Internal server error" });
            }
        });
    }
}
exports.default = new ScreenController();
