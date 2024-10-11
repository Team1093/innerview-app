import { AxiosInstance } from "axios";
import { VideoData } from "./interface";

export class FileService {
  private instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  async uploadFile({ file, videoData }: { file: File; videoData: VideoData }) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("json", JSON.stringify(videoData));

    const res = await this.instance.post("/file/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data.url as string;
  }
}
