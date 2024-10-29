import ScreenRepository from '../Repositories/ScreenRepo';

class ScreenService {
    public async addScreenHandler(theaterOwnerId: string, ScreenData: { screenNumber: number; capacity: number; layout: any; showTimes: string[]; theater: string }) {
        return await ScreenRepository.createScreen(ScreenData);
    }

    public getScreenByIdHandler = async (screenId: string) => {
        try {
            const screen = await ScreenRepository.getScreenById(screenId);
            return screen;
        } catch (error: any) {
            throw new Error(error?.message || 'Failed to retrieve screen');
        }
    };   
    
    public getScreensByTheaterIdsService = async (id: string) => {
        try {
          return await ScreenRepository.getScreensByTheater(id);
        } catch (error) {
          throw new Error('Error fetching Screens');
        }
    };
}

export default new ScreenService();
    