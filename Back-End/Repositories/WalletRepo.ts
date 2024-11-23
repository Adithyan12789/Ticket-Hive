import Wallet, { IWallet } from "../Models/WalletModel";

class WalletRepo {
  public async findWalletByUserId(userId: string): Promise<IWallet | null> {
    return await Wallet.findOne({ user: userId });
  }
}

export default new WalletRepo();
