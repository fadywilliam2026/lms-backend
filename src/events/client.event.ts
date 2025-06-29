export class ClientEvent {
  clientId: number;
}

export class ClientApprovedEvent extends ClientEvent {}
export class ClientRejectedEvent extends ClientEvent {}
export class ClientCreatedEvent extends ClientEvent {}
