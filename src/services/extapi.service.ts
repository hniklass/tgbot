import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErrorService } from './error.service';

/*
  Service determines types of messages and commands send.
*/

@Injectable()
export class ExtApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly errorService: ErrorService,
  ) { }

  async getFirebaseData(endPoint: string): Promise<any> {
    try {
      const apiUri = this.configService.get<string>('api.FIREBASE_URL');
      const response = await this.httpService.get(`${apiUri}/${endPoint}.json`);

      return (await response.toPromise()).data;
    } catch (error) {
      this.errorService.handleError(error);
    }
  }

  async getYoutubeLink(searchParam: string): Promise<string> {
    const videoId = (
      await this.httpService.get(
        `https://www.googleapis.com/youtube/v3/search` +
        `?part=snippet` +
        `&maxResults=1` +
        `&q=${searchParam}` +
        `&fields=items%2Fid%2FvideoId` +
        `&key=${this.configService.get<string>('api.YT_API_KEY')}`,
      ).toPromise()
    ).data?.items[0]?.id?.videoId;

    if (!videoId) {
      return null;
    }

    // Won't wrap it in an <a> tag. Telegram client will do that automatically.
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
}
