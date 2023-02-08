import { registerPlugin, Plugin } from "@capacitor/core";

// we can take advantage of TypeScript here!
interface ThredPluginInterface extends Plugin {
  getWallet: () => Promise<string>;
  setWallet: (wallet: any) => Promise<void>;
  openApp: (app: any) => Promise<void>;
  confirmTransaction: (data: any) => Promise<string>;
  sendResponse: (data: any) => Promise<void>;
};

// it's important that both Android and iOS plugins have the same name
export const ThredMobilePlugin = registerPlugin<ThredPluginInterface>(
  "ThredMobileCore"
);