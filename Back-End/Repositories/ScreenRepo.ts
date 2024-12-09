import { Schedule } from "../Models/ScheduleModel";
import { Screens } from "../Models/ScreensModel";

class ScreenRepository {

  public async getScreenById(screenId: string) {
    return await Screens.findById(screenId).populate({
      path: 'theater',
      select: 'name city address',
    });
  }
  
  // Add a method to fetch schedules by screenId
  public async getSchedulesByScreenId(screenId: string) {
    return await Schedule.find({ screen: screenId }).populate({
      path: 'showTimes.movie',
      select: 'title',
    });
  }  

  // Update a screen by ID
  public async updateScreen(screenId: string, updateData: any) {
    return await Screens.findByIdAndUpdate(screenId, updateData, {
      new: true,
    });
  }

  public async getScreensByTheater(id: string) {
    return await Screens.find({ theater: id });
  }

  public async deleteScreen(screenId: string) {
    return await Screens.findByIdAndDelete(screenId);
  }

  public async getTheatersByMovieName(movieName: string) {
    return await Screens.find({ "showTimes.movie": movieName }).populate(
      "theater",
      "name location"
    );
  }
}

export default new ScreenRepository();
