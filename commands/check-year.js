const djs = require('discord.js');
const settings = require('../settings.json');

module.exports.interaction = async (interaction, game) => {
	await interaction.deferReply();

	if (!game.started) return interaction.editReply('The game has not started yet.');

	const startYear = parseInt(interaction.client.yearStart[interaction.guild.id]);
	const msDiff = Date.now() - interaction.client.gameStart[interaction.guild.id];
	const guildId = interaction.guild.id;
	const minutesPerMonth = interaction.client.minutesPerMonth[guildId]; 
	const hoursDiff = msDiff / (1000 * 60 * Number(minutesPerMonth));
	const yearsDiff = Math.floor(hoursDiff / 12);
	const monthsDiff = Math.floor(hoursDiff % 12);

	const currentYear = startYear + yearsDiff;
	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	];
	const currentMonth = monthNames[monthsDiff];

	await interaction.editReply({ content: `The current date is ${currentMonth} ${currentYear}.`, ephemeral: true });
};

module.exports.button = async interaction => {};
module.exports.application_command = () => {
	return new djs.SlashCommandBuilder().setName('check-year').setDescription('Check the current year in the game.');
};
