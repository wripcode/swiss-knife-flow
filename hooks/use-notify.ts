import { postToExtension } from "@/lib/message-bus";

export type NotifyType = "Success" | "Error" | "Warning" | "Info";

interface NotifyOptions {
  type: NotifyType;
  message: string;
}

/**
 * Returns a function that calls webflow.notify() (or generic notifications) 
 * in the sidebar context. It sends a message via the message-bus to 
 * correctly run in the parent extension context.
 */
export function useNotify() {
  return ({ type, message }: NotifyOptions) => {
    postToExtension("NOTIFY", { type, message });
  };
}
