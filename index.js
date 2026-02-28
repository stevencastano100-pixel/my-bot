require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
  console.log(`${client.user.tag} is online.`);
});

client.on('interactionCreate', async interaction => {

  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'request') {

      const aircraft = interaction.options.getString('aircraft');
      const callsign = interaction.options.getString('callsign');
      const departure = interaction.options.getString('departure');
      const arrival = interaction.options.getString('arrival');
      const flighttime = interaction.options.getString('flighttime');

      const embed = new EmbedBuilder()
        .setTitle('🛫 Flight Request')
        .setColor('Yellow')
        .addFields(
          { name: 'Submitted By', value: `${interaction.user}` },
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
      await channel.send({ embeds: [embed], components: [row] });

      await interaction.reply({ content: 'Your flight request has been submitted!', ephemeral: true });
    }
  }

  if (interaction.isButton()) {

    if (!interaction.member.roles.cache.has(process.env.STAFF_ROLE_ID)) {
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
});

client.login(process.env.TOKEN);