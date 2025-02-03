"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenService = void 0;
const inversify_1 = require("inversify");
const date_fns_1 = require("date-fns");
const TheaterDetailsModel_1 = __importDefault(require("../Models/TheaterDetailsModel"));
let ScreenService = class ScreenService {
    constructor(screenRepository) {
        this.screenRepository = screenRepository;
    }
    async addScreenHandler(theaterOwnerId, screenData) {
        if (!Array.isArray(screenData.layout) ||
            !screenData.layout.every((row) => Array.isArray(row))) {
            throw new Error("Invalid layout. It should be a 2D array of seats.");
        }
        try {
            const transformedLayout = screenData.layout.map((row) => row.map((seat) => ({
                label: seat.label,
                isAvailable: seat.isAvailable,
            })));
            const newScreenData = {
                theater: screenData.theater,
                screenNumber: screenData.screenNumber,
                capacity: screenData.capacity,
                layout: transformedLayout,
            };
            return await this.screenRepository.createScreen(newScreenData);
        }
        catch (error) {
            console.error("Service Error: ", error);
            throw new Error("Failed to save screen.");
        }
    }
    async editScreenHandler(theaterOwnerId, screenId, updateData) {
        const screen = await this.screenRepository.getScreenById(screenId);
        if (!screen) {
            throw new Error("Screen not found");
        }
        return await this.screenRepository.updateScreen(screenId, updateData);
    }
    async addScheduleHandler(screenId, scheduleData) {
        const screen = await this.screenRepository.getScreenById(screenId);
        if (!screen) {
            throw new Error("Screen not found for scheduling");
        }
        const formattedDate = (0, date_fns_1.format)(new Date(scheduleData.date), "yyyy-MM-dd");
        return await this.screenRepository.createSchedule({
            screen: screenId,
            date: formattedDate,
            showTimes: scheduleData.showTimes,
        });
    }
    async editScheduleHandler(scheduleId, updateData) {
        const schedule = await this.screenRepository.getScheduleById(scheduleId);
        if (!schedule) {
            throw new Error("Schedule not found");
        }
        return await this.screenRepository.updateSchedule(scheduleId, updateData);
    }
    async deleteScreenHandler(screenId) {
        return await this.screenRepository.deleteScreen(screenId);
    }
    async getScreenByIdHandler(screenId) {
        try {
            return await this.screenRepository.getScreenById(screenId);
        }
        catch (error) {
            throw new Error(error?.message || "Failed to retrieve screen");
        }
    }
    async getScreensWithSchedulesByTheaterIdsService(id) {
        try {
            const screens = await this.screenRepository.getScreensByTheater(id);
            return screens;
        }
        catch (error) {
            throw new Error("Error fetching screens and schedules");
        }
    }
    async getScreensByIdService(screenId) {
        try {
            const screen = await this.screenRepository.getScreenById(screenId);
            if (!screen) {
                throw new Error("Screen not found");
            }
            const theaterId = screen.theater;
            const theater = await TheaterDetailsModel_1.default.findById(theaterId);
            const schedule = await this.screenRepository.getSchedulesByScreenId(screenId);
            return { screen, schedule, theater };
        }
        catch (error) {
            throw new Error("Error fetching screen or schedules");
        }
    }
    async getTheatersByMovieNameService(movieName) {
        try {
            return await this.screenRepository.getTheatersByMovieName(movieName);
        }
        catch (error) {
            throw new Error("Error fetching theaters by movie name");
        }
    }
    async updateSeatAvailabilityHandler(scheduleId, selectedSeats, holdSeat, showTime) {
        return await this.screenRepository.updateSeatAvailability(scheduleId, showTime, selectedSeats, holdSeat);
    }
};
exports.ScreenService = ScreenService;
exports.ScreenService = ScreenService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("IScreenRepository")),
    __metadata("design:paramtypes", [Object])
], ScreenService);
