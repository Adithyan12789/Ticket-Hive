import ScreenRepository from "../Repositories/ScreenRepo";
import Screens, { IScreen } from "../Models/ScreensModel";

class ScreenService {
  public async addScreenHandler(
    theaterOwnerId: string,
    ScreenData: {
      screenNumber: number;
      capacity: number;
      showTimes: { time: string; movie: string; layout: any }[];
      theater: string;
    }
  ) {
    return await ScreenRepository.createScreen(ScreenData);
  }

  public async editScreenHandler(
    theaterOwnerId: string,
    screenId: string,
    updateData: {
      screenNumber?: number;
      capacity?: number;
      showTimes: { time: string; movie: string; layout: any }[];
    }
  ) {
    const screen: IScreen | null = await ScreenRepository.getScreenById(
      screenId
    );
    console.log("Retrieved Screen: ", screen);

    const updatedScreen = await ScreenRepository.updateScreen(
      screenId,
      updateData
    );
    console.log("Updated Screen: ", updatedScreen);
    return updatedScreen;
  }

  public async deleteScreenHandler(screenId: string): Promise<IScreen | null> {
    const deletedScreen = await Screens.findByIdAndDelete(screenId);
    return deletedScreen;
  }

  public getScreenByIdHandler = async (screenId: string) => {
    try {
      const screen = await ScreenRepository.getScreenById(screenId);
      return screen;
    } catch (error: any) {
      throw new Error(error?.message || "Failed to retrieve screen");
    }
  };

  public getScreensByTheaterIdsService = async (id: string) => {
    try {
      return await ScreenRepository.getScreensByTheater(id);
    } catch (error) {
      throw new Error("Error fetching Screens");
    }
  };

  public getScreensByIdService = async (screenId: string) => {
    try {
      return await ScreenRepository.getScreenById(screenId);
    } catch (error) {
      throw new Error("Error fetching Screens");
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
    screenId: string,
    selectedSeats: string[],
    holdSeat: boolean,
    showTime: string
  ): Promise<any> => {
    const screen = await Screens.findById(screenId);

    if (!screen) {
      throw new Error("Screen not found.");
    }

    const targetShowTime = screen.showTimes.find(
      (st) => String(st.time) === showTime
    );

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

    // Save the updated screen
    await screen.save();

    return screen;
  };
}

export default new ScreenService();
