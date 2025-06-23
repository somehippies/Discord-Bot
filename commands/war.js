const djs = require('discord.js');
const settings = require('../settings.json');
module.exports.interaction = async (interaction, game) => {
	await interaction.deferReply();
	const country = interaction.options.getString('country');
	const p = game.getPlayer(interaction.user.id);
	const c = game.getCountry(country);
	if (!game.started) return interaction.editReply('The game has not started yet.');
	if (!p) return interaction.editReply('You have not claimed a country yet.');
	if (!c) return interaction.editReply('This country does not exist.');
	if (!p.active) return interaction.editReply('Your country is inactive.');
	//if (!c.active) return interaction.editReply('Target country is inactive.');
	//if (!c.pid) return interaction.editReply('This country is unclaimed.');
	if (c.pid === interaction.user.id) return interaction.editReply('You cannot declare war on yourself.');
	//Keep the comments if you want to allow players to fight unclaimed countries

	const result = p.constructor.getWarResult(p, c);
	const embed = new djs.EmbedBuilder()
		.setTimestamp()
		.setColor(settings.color)
		.setFooter({ text: `War started by ${interaction.member.displayName}`, iconURL: interaction.member.displayAvatarURL() })
		.setTitle(`War Result`)
		.setDescription(
			`The war between ${p.country} ${p.flag} and ${c.country} ${c.flag} has ended.\n\n${
				result.winner === p
					? `${p.country} ${p.flag} <@${p.pid}> has thrived against ${c.country} ${c.flag} <@${
							c.pid ? c.pid : 'unclaimed'
					  }> and won the war.`
					: `${c.country} ${c.flag} <@${c.pid ? c.pid : 'unclaimed'}> has successfully defended against ${p.country} ${
							p.flag
					  } <@${p.pid}> in the war.`
			}\n\n${p.country} ${p.flag} lost ${result.atkLoses} army.\n${c.country} ${c.flag} lost ${result.defLoses} army.`,
		);

	await interaction.editReply({ embeds: [embed] });
};
module.exports.button = async interaction => {};
module.exports.application_command = () => {
	return new djs.SlashCommandBuilder()
		.setName('war')
		.setDescription('Start a war with another country')
		.addStringOption(option =>
			option.setName('country').setDescription('The name or number of the country you want to declare war on.').setRequired(true),
		);
};
