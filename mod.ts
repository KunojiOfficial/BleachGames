import * as slash from "https://raw.githubusercontent.com/harmonyland/harmony/main/deploy.ts";

// Pick up TOKEN and PUBLIC_KEY from ENV.
slash.init({ env: true });

const ACTIVITIES: {
  [name: string]: {
    id: string;
    name: string;
  };
} = {
  poker: {
    id: "755827207812677713",
    name: "Poker Night",
  },
  betrayal: {
    id: "773336526917861400",
    name: "Betrayal.io",
  },
  youtube: {
    id: "755600276941176913",
    name: "YouTube Together",
  },
  fishing: {
    id: "814288819477020702",
    name: "Fishington.io",
  },
  chess: {
    id: "832012586023256104",
    name: "CG 2 Dev",
  },
};

slash.commands.all().then((e) => {
  if (e.size !== 2) {
    slash.commands.bulkEdit([
      {
        name: "gra",
        description: "Wystartuj grę na kanale głosowym.",
        options: [
          {
            name: "kanał",
            type: slash.SlashCommandOptionType.CHANNEL,
            description: "Kanał, na którym chcesz wystartować.",
            required: true,
          },
          {
            name: "gra",
            type: slash.SlashCommandOptionType.STRING,
            description: "Gra do wystartowania.",
            required: true,
            choices: Object.entries(ACTIVITIES).map((e) => ({
              name: e[1].name,
              value: e[0],
            })),
          },
        ],
      },
    ]);
  }
});

slash.handle("gra", (d) => {
  if (!d.guild) return;
  const channel = d.option<slash.InteractionChannel>("kanał");
  const activity = ACTIVITIES[d.option<string>("gra")];
  if (!channel || !activity) {
    return d.reply("Zła interakcja.", { ephemeral: true });
  }
  if (channel.type !== slash.ChannelTypes.GUILD_VOICE) {
    return d.reply("Aktywności tylko na kanałach głosowych.", {
      ephemeral: true,
    });
  }

  slash.client.rest.api.channels[channel.id].invites
    .post({
      max_age: 604800,
      max_uses: 0,
      target_application_id: activity.id,
      target_type: 2,
      temporary: false,
    })
    .then((inv) => {
      d.reply(
        `[Kliknij tutaj, by zagrać w ${activity.name} na ${channel.name}.](<https://discord.gg/${inv.code}>)`
      );
    })
    .catch((e) => {
      console.log("Failed", e);
      d.reply("Bład.", { ephemeral: true });
    });
});

// Handle for any other commands received.
slash.handle("*", (d) => d.reply("Nieznana komenda", { ephemeral: true }));
// Log all errors.
slash.client.on("interactionError", console.log);
