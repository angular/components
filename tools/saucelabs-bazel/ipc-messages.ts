export class StartTestMessage {
  readonly type = 'start-test';
  constructor(public url: string, public browserId: string) {}
}

export class EndTestMessage {
  readonly type = 'end-test';
}

export class NoAvailableBrowserMessage {
  readonly type = 'browser-not-ready';
}

export type BackgroundServiceReceiveMessages = StartTestMessage|EndTestMessage;
export type BackgroundServiceSendMessages = NoAvailableBrowserMessage;
