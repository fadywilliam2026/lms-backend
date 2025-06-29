import { DownloadResponse, Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageFile } from './types/storage-file.type';

@Injectable()
export class GoogleCloudStorageService {
  private storage: Storage;
  private bucket: string;

  constructor(private readonly configService: ConfigService) {
    const serviceAccountJson = JSON.parse(configService.get('GOOGLE_CLOUD_STORAGE_SERVICE_ACCOUNT'));
    this.storage = new Storage({
      projectId: serviceAccountJson['project_id'],
      credentials: {
        client_email: serviceAccountJson['client_email'],
        private_key: serviceAccountJson['private_key'],
      },
    });
    this.bucket = this.configService.get('GOOGLE_CLOUD_STORAGE_BUCKET');
  }

  async save(path: string, buffer: Buffer) {
    const file = this.storage.bucket(this.bucket).file(path);
    const stream = file.createWriteStream();
    stream.end(buffer);
  }

  async file(path: string): Promise<StorageFile> {
    const fileResponse: DownloadResponse = await this.storage.bucket(this.bucket).file(path).download();
    const [buffer] = fileResponse;
    return {
      buffer: buffer,
    };
  }

  async getSignedUrl(path: string) {
    const [url] = await this.storage
      .bucket(this.bucket)
      .file(path)
      .getSignedUrl({
        action: 'read',
        expires: Date.now() + 1000 * 60 * 60,
      });
    return url;
  }

  rename(oldPath: string, newPath: string) {
    return this.storage.bucket(this.bucket).file(oldPath).rename(newPath);
  }

  delete(path: string) {
    return this.storage.bucket(this.bucket).file(path).delete({ ignoreNotFound: true });
  }
}
