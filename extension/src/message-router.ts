type MessageHandler = (payload: any, meta: { wf: any; selected: any }) => Promise<void>;

const handlers = new Map<string, MessageHandler>();

export function registerHandler(type: string, handler: MessageHandler) {
  handlers.set(type, handler);
}

export function createMessageRouter(wf: any) {
  return async (event: MessageEvent) => {
    if (!event.data || typeof event.data !== "object") return;

    const handler = handlers.get(event.data.type);
    if (!handler) return;

    try {
      const selected = await wf.getSelectedElement();
      await handler(event.data.payload, { wf, selected });
    } catch (err) {
      console.error(`Message error [${event.data.type}]:`, err);
    }
  };
}

