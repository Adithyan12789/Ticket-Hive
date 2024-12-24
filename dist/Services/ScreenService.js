"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ScreenRepo_1 = __importDefault(require("../Repositories/ScreenRepo"));
const ScreensModel_1 = require("../Models/ScreensModel");
const ScheduleRepo_1 = __importDefault(require("../Repositories/ScheduleRepo"));
const date_fns_1 = require("date-fns");
const TheaterDetailsModel_1 = __importDefault(require("../Models/TheaterDetailsModel"));
const ScheduleModel_1 = require("../Models/ScheduleModel");
class ScreenService {
    constructor() {
        this.getScreenByIdHandler = async (screenId) => {
            try {
                const screen = await ScreenRepo_1.default.getScreenById(screenId);
                return screen;
            }
            catch (error) {
                throw new Error(error?.message || "Failed to retrieve screen");
            }
        };
        // public getScreensByTheaterIdsService = async (id: string) => {
        //   try {
        //     return await ScreenRepository.getScreensByTheater(id);
        //   } catch (error) {
        //     throw new Error("Error fetching Screens");
        //   }
        // };
        this.getScreensWithSchedulesByTheaterIdsService = async (id) => {
            try {
                const screens = await ScreensModel_1.Screens.find({ theater: id }).populate("schedule", "date showTimes");
                return screens;
            }
            catch (error) {
                throw new Error("Error fetching screens and schedules");
            }
        };
        this.getScreensByIdService = async (screenId) => {
            try {
                console.log(" entered service");
                // Fetch the screen details from the repository]
                let screen = await ScreenRepo_1.default.getScreenById(screenId);
                if (!screen) {
                    throw new Error("Screen not found");
                }
                const theaterId = screen.theater;
                const theater = await TheaterDetailsModel_1.default.findById(theaterId);
                // Fetch schedules for the specific screenId
                const schedule = await ScreenRepo_1.default.getSchedulesByScreenId(screenId);
                console.log("schedule: ", schedule);
                return { screen, schedule, theater };
            }
            catch (error) {
                throw new Error("Error fetching screen or schedules");
            }
        };
        this.updateSeatAvailabilityHandler = async (scheduleId, selectedSeats, holdSeat, showTime) => {
            const schedule = await ScheduleModel_1.Schedule.findById(scheduleId).populate("screen");
            if (!schedule) {
                throw new Error("Schedule not found.");
            }
            const targetShowTime = schedule.showTimes.find((st) => String(st.time) === showTime);
            if (!targetShowTime) {
                throw new Error("Show time not found.");
            }
            targetShowTime.layout.forEach((row) => {
                row.forEach((seat) => {
                    if (selectedSeats.includes(seat.label)) {
                        seat.holdSeat = holdSeat;
                    }
                });
            });
            await schedule.save();
            return schedule;
        };
    }
    async addScreenHandler(theaterOwnerId, screenData) {
        // Validate the layout structure
        if (!Array.isArray(screenData.layout) ||
            !screenData.layout.every((row) => Array.isArray(row))) {
            throw new Error("Invalid layout. It should be a 2D array of seats.");
        }
        try {
            // Transform the layout for saving
            const transformedLayout = screenData.layout.map((row) => row.map((seat) => ({
                label: seat.label,
                isAvailable: seat.isAvailable, // Ensure isAvailable is also retained
            })));
            // Create a new screen instance directly
            const newScreen = new ScreensModel_1.Screens({
                theater: screenData.theater,
                screenNumber: screenData.screenNumber,
                capacity: screenData.capacity,
                layout: transformedLayout,
            });
            // Save the screen instance to the database
            const savedScreen = await newScreen.save();
            return savedScreen;
        }
        catch (error) {
            console.error("Service Error: ", error);
            throw new Error("Failed to save screen.");
        }
    }
    // Edit an existing screen (static data)
    async editScreenHandler(theaterOwnerId, screenId, updateData) {
        const screen = await ScreenRepo_1.default.getScreenById(screenId);
        if (!screen) {
            throw new Error("Screen not found");
        }
        // Update static screen data
        return await ScreenRepo_1.default.updateScreen(screenId, updateData);
    }
    // Add schedule for a screen (dynamic data)
    async addScheduleHandler(screenId, scheduleData) {
        const screen = await ScreenRepo_1.default.getScreenById(screenId);
        if (!screen) {
            throw new Error("Screen not found for scheduling");
        }
        const formattedDate = (0, date_fns_1.format)(new Date(scheduleData.date), "yyyy-MM-dd");
        console.log("formattedDate 99999: ", formattedDate);
        return await ScheduleRepo_1.default.createSchedule({
            screen: screenId,
            date: formattedDate,
            showTimes: scheduleData.showTimes,
        });
    }
    // Update schedule for a screen (dynamic data)
    async editScheduleHandler(scheduleId, updateData) {
        const schedule = await ScheduleRepo_1.default.getScheduleById(scheduleId);
        if (!schedule) {
            throw new Error("Schedule not found");
        }
        // Update the existing schedule
        return await ScheduleRepo_1.default.updateSchedule(scheduleId, updateData);
    }
    async deleteScreenHandler(screenId) {
        return await ScreensModel_1.Screens.findByIdAndDelete(screenId);
    }
    // public getUserScreensByIdService = async (
    //   screenId: string,
    //   date?: string,
    //   movieTitle?: string,
    //   showTime?: string
    // ) => {
    //   try {
    //     console.log("entered ser");
    //     // Fetch the screen details from the repository
    //     const screen = await ScreenRepository.getScreenById(screenId);
    //     if (!screen) {
    //       throw new Error("Screen not found");
    //     }
    //     const theaterId = screen.theater;
    //     const theater = await TheaterDetails.findById(theaterId);
    //     // Fetch schedules with optional filtering
    //     const schedule = await ScreenRepository.getSchedulesByScreenId(
    //       screenId,
    //     );
    //     console.log("schedule ccccc: ", schedule);
    //     return { screen, schedule, theater };
    //   } catch (error) {
    //     throw new Error("Error fetching screen or schedules");
    //   }
    // };
    async getTheatersByMovieNameService(movieName) {
        try {
            return await ScreenRepo_1.default.getTheatersByMovieName(movieName);
        }
        catch (error) {
            throw new Error("Error fetching theaters by movie name");
        }
    }
}
exports.default = new ScreenService();
