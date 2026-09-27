const {Client, GatewayIntentBits, GuildMember} = require("discord.js") ;
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers] }) ;
const {token} = require("./json/config.json") ;
const role = require("./json/role.json") ;
const {Ollama} = require("ollama") ;
const ollama = new Ollama() ;

client.on("clientReady", () => {
    console.log(`Logged in as ${client.user.tag}`) ;
});
client.on("guildMemberAdd", (member) => {
    const channel = member.guild.channels.cache.find(ch => ch.name === "général") ;
    if (!channel) return ;
    channel.send(`${member} vient d'arriver. Bienvenue, camarade ! 🫡`);
    member.roles.add(role.camarade) ;
    console.log(`+ ${member.user.tag}`)
}) ;

client.on("messageCreate", async (message) => {
    if (message.author.bot) return ;
    const prompt = message.content ;
    if (!message.mentions.has(client.user)) return;
    if (!prompt) return message.reply("Oui ?") ;
    await message.channel.sendTyping() ;
    const response = await ollama.chat({
        model: "qwen3.5:2b",
        messages: [
            {role: "system", content: "Réponds en français, tu aides une classe de terminale spé maths physique qui a une particularité: elle avance aussi le progeramme de prépa. Tu vas les aider notamment à s'organiser mais aussi à comprendre des notions de maths, de physique et de philosophie. Réponds de manière décontractée, perds ton sérieux, utilise des émojis..."},
            {role: "user", content: prompt}
        ]
    }) ;
    let reply = response.message.content?.trim() ?? "";

// Falls du <think>-Tags rausfilterst, das erst danach trimmen:
reply = reply.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

if (!reply) {
  reply = " Bro je sais pas, reformule stp";
}

await message.reply(reply);
});

client.login(token);