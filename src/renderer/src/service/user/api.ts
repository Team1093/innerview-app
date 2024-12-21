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

  async deleteReservation(location: string, reservationId: number) {
    try {
      const res = await this.instance.delete(`/reservation/${location}/delete/${reservationId}`);
      console.log("Reservation deletion:" + String(res.data));
    } catch (error) {
      console.error('Reservation deletion failed:', error instanceof Error ? error.message : error);
      throw new Error('Could not delete reservation');
    }
  }
}
