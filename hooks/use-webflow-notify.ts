export type WebflowNotifyType = "Success" | "Error" | "Warning" | "Info";

interface NotifyOptions {
  type: WebflowNotifyType;
  message: string;
}

/**
 * Returns a function that calls webflow.notify() in the Designer extension context.
 * Degrades gracefully (console warning) when called outside the extension iframe.
 */
export function useWebflowNotify() {
  return ({ type, message }: NotifyOptions) => {
    if (typeof webflow === "undefined" || typeof webflow.notify !== "function") {
      console.warn("[useWebflowNotify] Called outside the Webflow Designer extension context.", { type, message });
      return;
    }
    webflow.notify({ type, message });
  };
}
