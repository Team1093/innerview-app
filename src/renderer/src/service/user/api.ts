import { AxiosInstance } from "axios";
import { user, reservation } from "./interface";
import { SCHEMA } from '../../assets/constants';

export class TopicService {
  private instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  async getUsersAndReservations() {
    const res = await this.instance.get(`/users/${SCHEMA}/`);
    console.log(res.data);

    return res.data as [user, reservation];
  }
}
