//Screen Repo

import Screens from "../Models/ScreensModel";

class ScreenRepository {
  public async createScreen(screenData: {
    screenNumber: number;
    capacity: number;
    layout: any;
    showTimes: { time: string; movie: string }[];
    theater: string;
  }) {
    const newScreen = new Screens({
      ...screenData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await newScreen.save();
  }

  

  public async getScreensByTheater(id: string) {
    return await Screens.find({ theater: id });
  }

  public async getScreenById(screenId: string) {
    return await Screens.findById(screenId).populate("theater", "name");
  }

  public async updateScreen(screenId: string, updateData: any) {
    return await Screens.findByIdAndUpdate(screenId, updateData, { new: true });
  }

  public async deleteScreen(screenId: string) {
    return await Screens.findByIdAndDelete(screenId);
  }
}

export default new ScreenRepository();