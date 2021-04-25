/** Message that can be sent to the daemon to start a given test. */
export class StartTestMessage {
  readonly type = 'start-test';
  constructor(
      public url: string,
      public browserId: string,
      public testDescription: string) {}
}

/** Message that can be sent to the daemon if a test completed. */
export class EndTestMessage {
  readonly type = 'end-test';
}

/** Message being sent from the daemon if a request browser is not available. */
export class NoAvailableBrowserMessage {
  readonly type = 'browser-not-ready';
}

/** Type of messages the background service can receive. */
export type BackgroundServiceReceiveMessages = StartTestMessage|EndTestMessage;

/** Type of messages the background services can send to clients. */
export type BackgroundServiceSendMessages = NoAvailableBrowserMessage;
