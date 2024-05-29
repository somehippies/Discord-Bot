const fs = require('fs');
const djs = require('discord.js');
module.exports.interaction = async (interaction, game, Country) => {
	const keep_players = interaction.options.getBoolean('load_players');
	const guildId = interaction.guild.id;
	if (!fs.existsSync(`./saves/${guildId}.json`)) return await interaction.reply('No save file found.');
	if (game.started) return await interaction.reply('Game already started. Please end the game before loading a save file.');
	await interaction.reply('Loading save file...');
	try {
		const saveData = fs.readFileSync(`./saves/${guildId}.json`, 'utf-8');
		const savedGame = JSON.parse(saveData);
		game.countries = savedGame.map(countryData => {
			const { country, industry, army, tank, money, type, flag } = countryData;
			const countryInstance = new Country(country, industry, army, tank, money, type, flag);
			countryInstance.active = true;
			if (!keep_players) {
				countryInstance.pid = '';
			} else {
				countryInstance.pid = countryData.pid;
			}
			return countryInstance;
		});
		game.started = true;
		await interaction.editReply('Game loaded and started successfully! Have fun!');
	} catch (error) {
		console.error(error);
		await interaction.editReply('Failed to load the game. Please try again later.');
	}
};

module.exports.application_command = () => {
	return new djs.SlashCommandBuilder()
		.setName('load')
		.setDescription("Load a game from the server's save file.")
		.setDefaultMemberPermissions(djs.PermissionsBitField.Flags.Administrator)
		.addBooleanOption(option =>
			option.setName('load_players').setDescription('Loads the players from the save file.').setRequired(true),
		);
};
