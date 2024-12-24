"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ScheduleModel_1 = require("../Models/ScheduleModel");
const ScreensModel_1 = require("../Models/ScreensModel");
class ScreenRepository {
    async getScreenById(screenId) {
        return await ScreensModel_1.Screens.findById(screenId).populate({
            path: 'theater',
            select: 'name city address',
        });
    }
    // Add a method to fetch schedules by screenId
    async getSchedulesByScreenId(screenId) {
        return await ScheduleModel_1.Schedule.find({ screen: screenId }).populate({
            path: 'showTimes.movie',
            select: 'title',
        });
    }
    // public async getSchedulesByUserScreenId(
    //   screenId: string,
    //   date?: string,
    //   movieTitle?: string,
    //   showTime?: string
    // ) {
    //   const query: any = { screen: screenId };
    //   if (showTime) query['showTimes.time'] = showTime;
    //   if (movieTitle) query['showTimes.movieTitle'] = movieTitle;
    //   console.log("Constructed Query:", query);
    //   const schedules = await Schedule.find(query).populate({
    //     path: 'showTimes.movie',
    //     select: 'title',
    //   });
    //   console.log("Fetched Schedules:", schedules);
    //   return schedules;
    // }
    // Update a screen by ID
    async updateScreen(screenId, updateData) {
        return await ScreensModel_1.Screens.findByIdAndUpdate(screenId, updateData, {
            new: true,
        });
    }
    async getScreensByTheater(id) {
        return await ScreensModel_1.Screens.find({ theater: id });
    }
    async deleteScreen(screenId) {
        return await ScreensModel_1.Screens.findByIdAndDelete(screenId);
    }
    async getTheatersByMovieName(movieName) {
        return await ScreensModel_1.Screens.find({ "showTimes.movie": movieName }).populate("theater", "name location");
    }
}
exports.default = new ScreenRepository();
