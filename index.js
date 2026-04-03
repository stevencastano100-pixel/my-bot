require('dotenv').config();
const express = require("express");
const app = express();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} = require('discord.js');

// Web server
app.get("/", (req, res) => res.send("Bot is running!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Web server ready"));

// Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Ready event
client.once(Events.ClientReady, () => {
  console.log(`${client.user.tag} is online.`);
});

// Interaction handler
client.on(Events.InteractionCreate, async interaction => {
  try {
    // Slash command: /request
    if (interaction.isChatInputCommand() && interaction.commandName === 'request') {
      await interaction.deferReply({ ephemeral: true });

      const aircraft = interaction.options.getString('aircraft');
      const callsign = interaction.options.getString('callsign');
      const departure = interaction.options.getString('departure');
      const arrival = interaction.options.getString('arrival');
      const flighttime = interaction.options.getString('flighttime');

      const embed = new EmbedBuilder()
        .setTitle('🛫 Flight Request')
        .setColor('Yellow')
        .addFields(
          { name: 'Submitted By', value: `${interaction.user}`, inline: false },
          { name: 'Aircraft', value: aircraft, inline: true },
          { name: 'Callsign', value: callsign, inline: true },
          { name: 'Departure', value: departure.toUpperCase(), inline: true },
          { name: 'Arrival', value: arrival.toUpperCase(), inline: true },
          { name: 'Flight Time', value: flighttime, inline: true }
        )
        .setFooter({ text: 'Status: Pending Approval' })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('approve')
          .setLabel('Approve')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('deny')
          .setLabel('Deny')
          .setStyle(ButtonStyle.Danger)
      );

      const channel = await client.channels.fetch(process.env.APPROVAL_CHANNEL_ID);
      if (!channel) throw new Error("Approval channel not found!");

      await channel.send({ embeds: [embed], components: [row] });
      await interaction.editReply('Your flight request has been submitted! ✈️');
    }

    // Button interactions
    if (interaction.isButton()) {
      const staffRoleId = process.env.STAFF_ROLE_ID;
      if (!interaction.member.roles.cache.has(staffRoleId)) {
        return interaction.reply({ content: 'You are not allowed to approve/deny.', ephemeral: true });
      }

      const embed = EmbedBuilder.from(interaction.message.embeds[0]);

      if (interaction.customId === 'approve') {
        embed.setColor('Green')
             .setFooter({ text: `Approved by ${interaction.user.tag}` });
        await interaction.update({ embeds: [embed], components: [] });
      }

      if (interaction.customId === 'deny') {
        embed.setColor('Red')
             .setFooter({ text: `Denied by ${interaction.user.tag}` });
        await interaction.update({ embeds: [embed], components: [] });
      }
    }
  } catch (error) {
    console.error(error);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply('There was an error processing this interaction.');
    } else {
      await interaction.reply({ content: 'There was an error processing this interaction.', ephemeral: true });
    }
  }
});

// Login
client.login(process.env.TOKEN);