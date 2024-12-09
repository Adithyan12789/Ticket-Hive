import ScreenRepository from "../Repositories/ScreenRepo";
import { IScreen, Screens } from "../Models/ScreensModel";
import ScheduleRepo from "../Repositories/ScheduleRepo";
import { ISchedule, Schedule } from "../Models/ScheduleModel";
import mongoose from "mongoose";
import TheaterDetails from "../Models/TheaterDetailsModel";

class ScreenService {
  public async addScreenHandler(
    theaterOwnerId: string,
    screenData: {
      screenNumber: number;
      capacity: number;
      layout: { label: string; isAvailable: boolean }[][];
      theater: string;
    }
  ) {
    console.log(
      "Service: Receiving screenData: ",
      JSON.stringify(screenData, null, 2)
    );

    // Validate the layout structure
    if (
      !Array.isArray(screenData.layout) ||
      !screenData.layout.every((row) => Array.isArray(row))
    ) {
      throw new Error("Invalid layout. It should be a 2D array of seats.");
    }

    try {
      // Transform the layout for saving
      const transformedLayout = screenData.layout.map((row) =>
        row.map((seat) => ({
          label: seat.label,
          isAvailable: seat.isAvailable, // Ensure isAvailable is also retained
        }))
      );

      console.log(
        "Service: Transformed layout: ",
        JSON.stringify(transformedLayout, null, 2)
      );

      // Create a new screen instance directly
      const newScreen = new Screens({
        theater: screenData.theater,
        screenNumber: screenData.screenNumber,
        capacity: screenData.capacity,
        layout: transformedLayout,
      });

      // Save the screen instance to the database
      const savedScreen = await newScreen.save();

      console.log(
        "Service: New Screen created successfully: ",
        JSON.stringify(savedScreen, null, 2)
      );

      return savedScreen;
    } catch (error) {
      console.error("Service Error: ", error);
      throw new Error("Failed to save screen.");
    }
  }

  // Edit an existing screen (static data)
  public async editScreenHandler(
    theaterOwnerId: string,
    screenId: string,
    updateData: {
      screenNumber?: number;
      capacity?: number;
      layout?: any[]; // Updated layout for the screen
    }
  ) {
    const screen = await ScreenRepository.getScreenById(screenId);

    if (!screen) {
      throw new Error("Screen not found");
    }

    // Update static screen data
    return await ScreenRepository.updateScreen(screenId, updateData);
  }

  // Add schedule for a screen (dynamic data)
  public async addScheduleHandler(
    screenId: string,
    scheduleData: {
      date: string; // ISO date format
      showTimes: {
        time: string;
        movie: string; // Movie ID
        movieTitle: string;
        layout: any[]; // Seat availability layout
      }[];
    }
  ) {
    const screen = await ScreenRepository.getScreenById(screenId);

    if (!screen) {
      throw new Error("Screen not found for scheduling");
    }

    // Create a new schedule for the given screen
    return await ScheduleRepo.createSchedule({
      screen: screenId,
      date: scheduleData.date,
      showTimes: scheduleData.showTimes,
    });
  }

  // Update schedule for a screen (dynamic data)
  public async editScheduleHandler(
    scheduleId: string,
    updateData: {
      date?: string;
      showTimes?: {
        time?: string;
        movie?: string; // Movie ID
        movieTitle?: string;
        layout?: any[];
      }[];
    }
  ) {
    const schedule = await ScheduleRepo.getScheduleById(scheduleId);

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    // Update the existing schedule
    return await ScheduleRepo.updateSchedule(scheduleId, updateData);
  }

  public async deleteScreenHandler(screenId: string): Promise<IScreen | null> {
    return await Screens.findByIdAndDelete(screenId);
  }

  public getScreenByIdHandler = async (screenId: string) => {
    try {
      const screen = await ScreenRepository.getScreenById(screenId);
      return screen;
    } catch (error: any) {
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

  public getScreensWithSchedulesByTheaterIdsService = async (id: string) => {
    try {
      console.log("theaterId: ", id);

      const screens = await Screens.find({ theater: id }).populate(
        "schedule",
        "date showTimes"
      );

      console.log("get screens: ", JSON.stringify(screens, null, 2));

      return screens;
    } catch (error) {
      throw new Error("Error fetching screens and schedules");
    }
  };

  public getScreensByIdService = async (screenId: string) => {
    try {
      // Fetch the screen details from the repository
      let screen = await ScreenRepository.getScreenById(screenId);

      if (!screen) {
        throw new Error("Screen not found");
      }

      const theaterId = screen.theater;

      const theater = await TheaterDetails.findById(theaterId);

      // Fetch schedules for the specific screenId
      const schedule = await ScreenRepository.getSchedulesByScreenId(screenId);

      console.log("service screen with schedules: ", screen);
      console.log("theater ttttt: ", theater);

      return { screen, schedule, theater };
    } catch (error) {
      throw new Error("Error fetching screen or schedules");
    }
  };

  public async getTheatersByMovieNameService(movieName: string) {
    try {
      return await ScreenRepository.getTheatersByMovieName(movieName);
    } catch (error) {
      throw new Error("Error fetching theaters by movie name");
    }
  }

  public updateSeatAvailabilityHandler = async (
    scheduleId: string, // Pass the scheduleId, not screenId
    selectedSeats: string[],
    holdSeat: boolean,
    showTime: string
  ): Promise<any> => {
    // Find the schedule by its ID
    const schedule = await Schedule.findById(scheduleId).populate("screen");

    if (!schedule) {
      throw new Error("Schedule not found.");
    }

    // Find the target show time within the schedule
    const targetShowTime = schedule.showTimes.find(
      (st) => String(st.time) === showTime
    );

    if (!targetShowTime) {
      throw new Error("Show time not found.");
    }

    // Update the layout of the show time by marking the selected seats
    targetShowTime.layout.forEach((row) => {
      row.forEach((seat) => {
        if (selectedSeats.includes(seat.label)) {
          seat.holdSeat = holdSeat;
        }
      });
    });

    // Save the updated schedule
    await schedule.save();

    // Return the updated schedule (or you can return the screen if needed)
    return schedule;
  };
}

export default new ScreenService();
