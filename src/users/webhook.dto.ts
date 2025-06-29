import { IsUrl } from 'class-validator';

export class WebhookDto {
  @IsUrl({ require_tld: false })
  url: string;
}
