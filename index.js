const {Client, GatewayIntentBits} = require("discord.js") ;
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers] }) ;
const {token} = require("./json/config.json") ;
const {role} = require("./json/role.json") ;
const {CPhilo1} = require("./cours/philo.json") ;
const {Ollama} = require("ollama") ;
const ollama = new Ollama();

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
    if (message.author.bot) return;
    const prompt = message.content;
    if (!message.mentions.has(client.user)) return;
    if (!prompt) return message.reply("Oui ?");
    await message.channel.sendTyping();

    const messages = [
        {role: "system", content: "Tu aides une classe de terminale/prépa.Réponds en français et en strictement moins de 2000 caractères car tu es sur discord. Sois sérieux et précis lorsqu'il s'agit de cours, sinon sois agréable et fun tout en restant dans la modération."},
    ];

    if (message.attachments.size > 0) {
        const attachment = message.attachments.first();

        const imageRes = await fetch(attachment.url);
        const imageBuffer = await imageRes.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString("base64");

        messages.push({role: "user", content: prompt, images: [base64Image]});
    }else if (message.content.includes("CPhilo1")){
        messages.push({role: "user", content: prompt + "Voici le chapitre 1 de philosophie duquel tu dois sortir les infos:" + CPhilo1});
    } else {
        messages.push({role: "user", content: prompt});
    }

    const response = await ollama.chat({
        model: "qwen3.5:latest",
        messages: messages,
    });

    let reply = response.message.content?.trim() ?? "";
    reply = reply.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    if (!reply) reply = "Je me suis perdu dans mes pensées... 😅 Peux-tu reformuler ta question ?";

    await message.reply(reply);
    console.log(`- ${message.author.tag} : ${prompt}`);
});

client.login(token);