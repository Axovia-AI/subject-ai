export interface ContentScript {
  init(): void;
  destroy(): void;
}

export interface EmailPlatform {
  name: string;
  domain: string;
  selectors: {
    subjectField: string;
    composeWindow: string;
    sendButton?: string;
  };
}