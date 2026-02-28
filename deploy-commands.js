require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('request')
    .setDescription('Submit a flight request')
    .addStringOption(option =>
      option.setName('aircraft')
        .setDescription('Aircraft type')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('callsign')
        .setDescription('Your callsign')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('departure')
        .setDescription('Departure ICAO')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('arrival')
        .setDescription('Arrival ICAO')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('flighttime')
        .setDescription('Flight time (ex: 1h 30m)')
        .setRequired(true))
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

rest.put(
  Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
  { body: commands }
).then(() => console.log('Slash command registered.'));