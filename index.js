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
            {role: "system", content: "Réponds en français, tu aides une classe de terminale maths physique qui a une particularité: elle avance aussi le progeramme de prépa (La terminale s'appelle la TC pour terminale C, et ça n'a rien à voir avec les spécialités). Tu vas les aider notamment à s'organiser mais aussi à comprendre des notions de maths, de physique et de philosophie. Réponds de manière décontractée, perds ton sérieux, utilise des émojis... Concernant les formules mathématiques, n'écris pas en latex. Tu es utilisé sur le serveur Discord de la TC. Plusieurs personnes te parlent. Utilise les questions pour enrichir ta compréhension de ton rôle sur le serveur. Tu es sur discord donc réponds avec moins de 2000 caractères, si tu as besoin d'écrire plus de 2k caractères, envoies plusieurs réponses."},
            {role: "user", content: prompt}
        ]
    }) ;
    let reply = response.message.content?.trim() ?? "";

// Falls du <think>-Tags rausfilterst, das erst danach trimmen:
reply = reply.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

if (!reply) {
  reply = "Je me suis perdu dans mes pensées... 😅 Peux-tu reformuler ta question ?";
}

await message.reply(reply);
console.log(`- ${message.author.tag} : ${prompt} => ${reply}`);
});

client.login(token);