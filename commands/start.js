const djs = require('discord.js');
const settings = require('../settings.json');
module.exports.interaction = async (interaction, game) => {
	await interaction.deferReply();

	if (game.started) return interaction.editReply('The game has already started.');
	game.start();

	const embed = new djs.EmbedBuilder().setColor(settings.color);
	let description = '';
	for (let i = 0; i < game.countries.length; i++) {
		const country = game.countries[i];
		if (country.type !== game.countries[i - 1]?.type) description += `\n**${country.type}**\n`;
		description += `${i + 1}. ${country.country} ${country.flag}${country.pid ? ` <@${country.pid}>` : ''}${
			country.active ? '' : ' (abandoned)'
		}\n`;
	}
	const splitted = description.match(/[\s\S]{1,3800}(?=\n|$)/g);
	for (let i = 0; i < splitted.length; i++) {
		const split = splitted[i];
		switch (i) {
			case 0:
				embed.setTitle('Countries').setDescription(split);
				await interaction.editReply({ content: `The game has started, have fun!`, embeds: [embed] });
				embed.setTitle(null);
				break;
			case splitted.length - 1:
				embed
					.setDescription(split)
					.setTimestamp()
					.setFooter({ text: `Requested by ${interaction.member.displayName}`, iconURL: interaction.member.displayAvatarURL() });
				await interaction.followUp({ embeds: [embed] });
				break;
			default:
				embed.setDescription(split);
				await interaction.followUp({ embeds: [embed] });
		}
	}
};
module.exports.button = async interaction => {};
module.exports.application_command = () => {
	return new djs.SlashCommandBuilder()
		.setName('start')
		.setDescription('Starts a new game.')
		.setDefaultMemberPermissions(djs.PermissionsBitField.Flags.Administrator);
};
