// Add OneSignal types
declare global {
  interface Window {
    OneSignalDeferred?: ((OneSignal: any) => void)[];
    OneSignal?: any;
  }
}

export {};