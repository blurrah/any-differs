import { NotificationMessage } from "../types.d.ts";
import {
  snowflakeToBigint,
  startBot,
} from "https://deno.land/x/discordeno/mod.ts";

export const sendDiscord = (messages: NotificationMessage[]) => {
  const token = Deno.env.get("DISCORD_TOKEN");
  if (!token) return;

  startBot({
    token,
    intents: ["Guilds", "GuildMessages"],
    eventHandlers: {
      ready() {
        console.log("loaded discordeno");
      },
      guildAvailable(guild) {
        console.log("guild create called");
        for (const channel of guild.channels.values()) {
          console.log(channel);
          if (channel.id === snowflakeToBigint("903652445165604945")) {
            channel.send(
              messages
                .map(
                  ({ title, message }) => `**${title}** -> Delta is ${message}`
                )
                .join("\n")
            );
          }
        }
      },
    },
  });
};
