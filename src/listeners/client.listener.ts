import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Events } from '../common/types/event';
import { ClientApprovedEvent, ClientCreatedEvent, ClientRejectedEvent } from '../events/client.event';
import { PrismaService } from 'nestjs-prisma';
import { NotifyClientService } from './notify-client.service';
@Injectable()
export class ClientsListener {
  constructor(private readonly prisma: PrismaService, private readonly notifyClientService: NotifyClientService) {}

  @OnEvent(Events.ClientCreated)
  async handleClientCreatedEvent(event: ClientCreatedEvent) {
    const client = await this.prisma.client.findUnique({
      where: { id: event.clientId },
    });

    await this.notifyClientService.notifyClient(Events.ClientCreated, client);
  }

  @OnEvent(Events.ClientApproved)
  async handleClientApprovedEvent(event: ClientApprovedEvent) {
    const client = await this.prisma.client.findUnique({
      where: { id: event.clientId },
    });

    await this.notifyClientService.notifyClient(Events.ClientApproved, client);
  }

  @OnEvent(Events.ClientRejected)
  async handleClientActivityEvent(event: ClientRejectedEvent) {
    const client = await this.prisma.client.findUnique({
      where: { id: event.clientId },
    });

    await this.notifyClientService.notifyClient(Events.ClientRejected, client);
  }
}
