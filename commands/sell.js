const djs = require('discord.js');
const settings = require('../settings.json');
module.exports.interaction = async (interaction, game) => {
	await interaction.deferReply();
	const subcommand = interaction.options.getSubcommand();
	let amount = interaction.options.getInteger('amount');
	const country = game.getPlayer(interaction.user.id);
	if (!game.started) return interaction.editReply('The game has not started yet.');
	if (!country) return interaction.editReply('You have not claimed a country yet.');
	if (!country.active) return interaction.editReply('Your country is inactive.');
	if (amount < 1) return interaction.editReply('You must sell at least 1.');
	let cost = 0;
	let resource = '';
	switch (subcommand) {
		case 'industry':
			cost = (amount * settings.industryCost * 2) / 3;
			resource = 'industry';
			amount *= 100;
			break;
		case 'army':
			cost = (amount * settings.armyCost * 2) / 3;
			resource = 'army';
			break;
		case 'tank':
			cost = (amount * interaction.client.tankCost[interaction.guild.id] * 2) / 3;
			resource = 'tank';
			break;
	}
	if (country[resource] < amount) return interaction.editReply('You do not have enough resources to sell.');
	country[resource] -= amount;
	country.money += cost;
	const embed = new djs.EmbedBuilder()
		.setTimestamp()
		.setColor(settings.color)
		.setFooter({ text: `Requested by ${interaction.member.displayName}`, iconURL: interaction.member.displayAvatarURL() })
		.setTitle(`${country.country} ${country.flag}`)
		.setDescription(`You have sold ${amount} ${resource == 'tank' ? 'tanks' : resource} for $${Math.floor(cost)}.`)
		.addFields(
			{ name: 'Industry', value: `${country.industry}`, inline: true },
			{ name: 'Army', value: `${country.army}`, inline: true },
			{ name: 'Tanks', value: `${country.tank}`, inline: true },
			{ name: 'War Score', value: `${country.army + Math.floor(country.army * (country.tank / 50))}`, inline: true },
			{ name: 'Money', value: `${Math.floor(country.money)}`, inline: true },
			{ name: 'Type', value: `${country.type.slice(0, -1)}`, inline: true },
		);
	await interaction.editReply({ embeds: [embed] });
};
module.exports.button = async interaction => {};
module.exports.application_command = () => {
	return new djs.SlashCommandBuilder()
		.setName('sell')
		.setDescription("Sell your resources for 2/3's of their original price.")
		.addSubcommand(subcommand =>
			subcommand
				.setName('industry')
				.setDescription('Sell industry.')
				.addIntegerOption(option => option.setName('amount').setDescription('The amount of industry to sell.').setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('army')
				.setDescription('Sell army')
				.addIntegerOption(option => option.setName('amount').setDescription('The amount of army to sell.').setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('tank')
				.setDescription('Sell tanks')
				.addIntegerOption(option => option.setName('amount').setDescription('The amount of tanks to sell.').setRequired(true)),
		);
};
