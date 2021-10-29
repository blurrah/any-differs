import { Notification } from "https://deno.land/x/deno_notify@1.0.1/ts/mod.ts";
import { NotificationMessage } from "../types.d.ts";

/**
 * Send notification using native notification solution (for MacOS/Windows/Linux)
 */
export const send = ({ title, message }: NotificationMessage) => {
  new Notification().title(title).body(message).show();
};
