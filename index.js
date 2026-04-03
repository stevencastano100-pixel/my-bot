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
  InteractionResponseFlags
} = require('discord.js');

app.get("/", (req, res) => res.send("Bot is running!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Web server ready"));

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => console.log(`${client.user.tag} is online.`));

client.on('interactionCreate', async interaction => {

  // SLASH COMMAND
  if (interaction.isChatInputCommand() && interaction.commandName === 'request') {
    await interaction.deferReply({ flags: InteractionResponseFlags.Ephemeral });

    try {
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

    } catch (error) {
      console.error(error);
      await interaction.editReply('There was an error submitting your request.');
    }
  }

  // BUTTON INTERACTIONS
  if (interaction.isButton()) {
    const staffRoleId = process.env.STAFF_ROLE_ID;
    if (!interaction.member.roles.cache.has(staffRoleId)) {
      return interaction.reply({ content: 'You are not allowed to approve/deny.', flags: InteractionResponseFlags.Ephemeral });
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
});

client.login(process.env.TOKEN);