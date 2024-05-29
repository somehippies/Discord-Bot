const djs = require('discord.js');
const settings = require('../settings.json');
module.exports.interaction = async (interaction, game) => {
	await interaction.deferReply();

	const interval = interaction.client.interval + settings.moneyIntervalInHours * 60 * 60 * 1000;

	if (!game.started) return interaction.editReply('The game has not started yet.');

	const embed = new djs.EmbedBuilder()
		.setTitle('Time left')
		.setTimestamp()
		.setColor(settings.color)
		.setFooter({ text: `Requested by ${interaction.member.displayName}`, iconURL: interaction.member.displayAvatarURL() })
		.setDescription(`Time left until the next paycheck: <t:${Math.floor(interval / 1000)}:R>`);

	await interaction.editReply({ embeds: [embed] });
};
module.exports.button = async interaction => {};
module.exports.application_command = () => {
	return new djs.SlashCommandBuilder().setName('money-cooldown').setDescription('Shows how much is left until the next paycheck.');
};
