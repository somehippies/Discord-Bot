const djs = require('discord.js');
const fs = require('fs');
const client = new djs.Client({
	intents: ['Guilds', 'GuildMessages', 'GuildMembers', 'MessageContent'].map(r => djs.IntentsBitField.Flags[r]),
});
const settings = require('./settings.json');

class Country {
	constructor(country, industry, army, tank, money, type, flag) {
		this.country = country;
		this.pid = '';
		this.industry = industry;
		this.army = army;
		this.tank = tank;
		this.money = money;
		this.type = type;
		this.flag = flag || '🏳️';
		this.active = true;
	}

	getWarScore() {
		return this.army + Math.floor(this.army * (this.tank / 50));
	}

	/**
	 * Calculates the result of a war between an attacker and a defender.
	 * @param {Attacker} attacker - The attacking entity.
	 * @param {Defender} defender - The defending entity.
	 * @returns {Object} - An object containing the winner, loser, and casualties of the war.
	 */
	static getWarResult(attacker, defender) {
		const attackerScore = attacker.getWarScore();
		const defenderScore = defender.getWarScore() * 1.2;
		const totalScore = attackerScore + defenderScore;
		const rng = Math.floor(Math.random() * totalScore);
		const atkLoses = attacker.applyWarCasualties();
		const defLoses = defender.applyWarCasualties();
		return {
			winner: rng < attackerScore ? attacker : defender,
			loser: rng < attackerScore ? defender : attacker,
			atkLoses,
			defLoses,
		};
	}

	applyWarCasualties() {
		const casualties = Math.floor(Math.random() * 0.03 * this.army + 0.1 * this.army);
		this.army -= casualties;
		return casualties;
	}
}

class Game {
    constructor() {
        this.countries = require('./countries/countries-1933.js').countries.map(c => new Country(...c));
        this.started = false;
    }

    start(countriesFile) {
        this.countries = require(`./countries/${countriesFile}`).countries.map(c => new Country(...c));
        this.started = true;
    }

    end() {
        this.started = false;
        this.countries = require('./countries/countries-1933.js').countries.map(c => new Country(...c));
    }

	assignCountry(pid, country) {
		const c = this.countries.find(c => c.country === country);
		if (c) {
			c.pid = pid;
			c.active = true;
			return c;
		}
	}

	getCountry(country) {
		if (!isNaN(country)) return this.countries[country - 1];
		return this.countries.find(c => c.country.toLowerCase() === country.toLowerCase());
	}

	abandonCountry(pid) {
		const c = this.countries.find(c => c.pid === pid && c.active);
		if (c) {
			c.pid = '';
			return c;
		}
	}

	getPlayer(id) {
		return this.countries.find(c => c.pid === id && c.active);
	}
}

const games = {};

//Money Interval Manager
setInterval(async () => {
	for (const guild of Object.keys(games)) {
		const game = games[guild];
		if (game.started)
			game.countries.forEach(c => {
				if (/*c.pid &&*/ c.active) {
					c.money += c.industry / 20;
					//console.log(`${c.country} has gained $${c.industry / 20}`);
				}
			});
		else console.log(`Game not started in this server!`);
	}
	client.interval = Date.now();
}, 1000 * 60 * 60 * settings.moneyIntervalInHours);

//SaveGame Manager
setInterval(async () => {
	for (const guild of Object.keys(games)) {
		const game = games[guild];
		if (game.started) {
			const saveObj = { others: {}, game: [] };
			saveObj.game = game.countries;
			saveObj.others = { started: client.gameStart[guild], yearStart: client.yearStart[guild], tankCost: client.tankCost[guild] };
			//!! Please create the folder saves or this will error
			fs.writeFileSync(`./saves/${guild}.json`, JSON.stringify(saveObj));
			console.log(`Saved game in ${guild}`);
		}
	}
}, 1000 * 60 * settings.saveGameInMinutes);

//Commands handler
const files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = {};
files.forEach(file => {
	commands[file.slice(0, -3)] = require(`./commands/${file}`);
});

client.once('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	await require('./deploy-commands.js')(client);
	client.interval = Date.now();
	client.gameStart = {};
	client.yearStart = {};
	client.tankCost = {};
});

client.on('interactionCreate', async interaction => {
	if (!interaction.member) return;
	try {
		if (!games[interaction.guild.id]) games[interaction.guild.id] = new Game();
		const game = games[interaction.guild.id];
		if (interaction.isCommand()) {
			const command = commands[interaction.commandName];
			if (command?.interaction) {
				await command.interaction(interaction, game, Country);
			}
		} else if (interaction.isButton()) {
			const command = commands[interaction.customId.split('-')[0]];
			if (command?.button) {
				await command.button(interaction);
			}
		}
	} catch (err) {
		const err_payload = { content: `There was an error while executing this command!\n${err}`, ephemeral: true };
		console.log(err);
		if (interaction.replied || interaction.deferred) interaction.followUp(err_payload);
		else await interaction.reply(err_payload);
	}
});

client.on('messageCreate', async msg => {
	if (!msg.member) return;
	if (msg.author.bot) return;
	try {
	} catch (err) {
		console.log(err);
		await msg.reply({ content: `There was an error while executing this command!\n${err}` });
	}
});

client.login(settings.token);
