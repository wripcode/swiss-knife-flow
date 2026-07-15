import { useState, useCallback, useEffect } from "react";

export function useCopyToClipboard(
  timeout = 1500
): {
  isCopied: boolean;
  copyToClipboard: (value: string) => void;
} {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (isCopied) {
      timeoutId = setTimeout(() => setIsCopied(false), timeout);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isCopied, timeout]);

  const copyToClipboard = useCallback((value: string) => {
    const done = () => {
      setIsCopied(true);
    };

    try {
      const el = document.createElement("textarea");
      el.value = value;
      el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      done();
    } catch {
      navigator.clipboard?.writeText(value).then(done).catch(() => {});
    }
  }, []);

  return { isCopied, copyToClipboard };
}
