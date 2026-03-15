/** Minimal ambient type for the Webflow Designer Extension global. */
declare const webflow: {
  notify: (options: { type: "Success" | "Error" | "Warning" | "Info"; message: string }) => void;
};
