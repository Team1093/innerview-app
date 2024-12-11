import { AxiosInstance } from "axios";
import { ResponseToDesktop } from "./interface";

export class UserService {
  private instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  async checkVerification(location: string) {
    const res = await this.instance.get(`/user/check/${location}`);
    console.log(`/user/check/${location}:`+res);
    return res.data as ResponseToDesktop;
  }
}
