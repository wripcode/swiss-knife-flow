export type MessageType =
  | "GET_ATTRIBUTES"
  | "SET_ATTRIBUTE"
  | "REMOVE_ATTRIBUTE"
  | "SELECT_ELEMENT"
  | "ATTRIBUTES_UPDATED"
  | "ELEMENT_DESELECTED";

const VALID_TYPES = new Set<string>([
  "GET_ATTRIBUTES",
  "SET_ATTRIBUTE",
  "REMOVE_ATTRIBUTE",
  "SELECT_ELEMENT",
  "ATTRIBUTES_UPDATED",
  "ELEMENT_DESELECTED",
]);

export interface BusMessage<T = unknown> {
  type: MessageType;
  payload?: T;
}

function isKnownMessage(data: unknown): data is BusMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    VALID_TYPES.has((data as any).type)
  );
}

export function postToExtension<T = unknown>(type: MessageType, payload?: T) {
  if (typeof window === "undefined" || !window.parent) return;
  window.parent.postMessage({ type, payload } satisfies BusMessage<T>, "*");
}

type MessageHandler<T = unknown> = (payload: T) => void;

export function onExtensionMessage<T = unknown>(
  type: MessageType,
  handler: MessageHandler<T>
): () => void {
  const listener = (event: MessageEvent) => {
    if (!isKnownMessage(event.data)) return;
    if (event.data.type === type) handler(event.data.payload as T);
  };

  window.addEventListener("message", listener);
  return () => window.removeEventListener("message", listener);
}
