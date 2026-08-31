export const getApiUrl = () => {
  let url = import.meta.env.VITE_API_URL || "/";
  if (!url || url === "/") return "/";

  // If accessing from mobile/tablet via local network IP (e.g. 192.168.x.x)
  // and VITE_API_URL points to localhost, dynamically swap localhost with current hostname
  if (
    typeof window !== "undefined" &&
    window.location &&
    window.location.hostname &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    url = url
      .replace("localhost", window.location.hostname)
      .replace("127.0.0.1", window.location.hostname);
  }

  return url.endsWith("/") ? url : url + "/";
};
