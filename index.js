const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { token, serversToCheck } = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'verification') {
        try {
            const guild = client.guilds.cache.get(interaction.guildId);
            const member = guild.members.cache.get(interaction.user.id);

            const isMembreServeurInterdit = serversToCheck.some(serverId => {
                const server = client.guilds.cache.get(serverId);
                return server && server.members.cache.has(interaction.user.id);
            });

            if (isMembreServeurInterdit) {
                await interaction.user.send(
                    "Vous avez été expulsé car vous appartenez déjà à un ou plusieurs serveurs interdits pour la double appartenance."
                );
                await member.kick("Appartenance à un ou plusieurs serveurs interdits");
                await interaction.reply({ content: "Utilisateur expulsé avec succès.", ephemeral: true });
            } else {
                const verifiedRole = guild.roles.cache.find(role => role.name === "Vérifié");
                if (verifiedRole) {
                    await member.roles.add(verifiedRole);

                    const embed = new EmbedBuilder()
                        .setColor(0x00ff00)
                        .setTitle("Vérification réussie")
                        .setDescription("Vous avez été vérifié avec succès et le rôle 'Vérifié' vous a été attribué.");

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } else {
                    await interaction.reply({
                        content: "Vérification réussie, mais le rôle 'Vérifié' n'a pas été trouvé.",
                        ephemeral: true
                    });
                }
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "Une erreur est survenue lors de la vérification.",
                ephemeral: true
            });
        }
    }
});

client.on('messageCreate', async message => {
    console.log(`Message reçu : ${message.content}`);
    if (message.content === '!verif') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('verification')
                .setLabel('Vérification')
                .setStyle(ButtonStyle.Primary)
        );

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("Vérification nécessaire")
            .setDescription("Cliquez sur le bouton ci-dessous pour vérifier votre compte.");

        await message.channel.send({
            embeds: [embed],
            components: [row]
        });
    }
});

client.login(token);
