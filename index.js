const {Client, GatewayIntentBits, GuildMember} = require("discord.js") ;
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers] }) ;
const {token} = require("./json/config.json") ;
const role = require("./json/role.json") ;

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`) ;
});
client.on("guildMemberAdd", (member) => {
    const channel = member.guild.channels.cache.find(ch => ch.name === "général") ;
    if (!channel) return ;
    channel.send(`${member} vient d'arriver. Bienvenue, camarade !`);
    member.roles.add(role.camarade) ;
}) ;
client.login(token);