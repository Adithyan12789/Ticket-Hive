import ScreenRepository from '../Repositories/ScreenRepo';

class ScreenService {
    public async addScreenHandler(theaterOwnerId: string, ScreenData: { screenNumber: number; capacity: number; layout: any; showTimes: string[]; theater: string }) {
        return await ScreenRepository.createScreen(ScreenData);
    }
}

export default new ScreenService();
    