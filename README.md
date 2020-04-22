# TaigaBot

Taiga bot is a bot that aims to provide interactive experiences to the users in a private-owned Discord server for fans of Taiga, who is a character from a yaoi visual novel Camp Buddy by BLits.

Taiga bot is based on and is a modified version of [yuuto-bot](https://github.com/Yuuto-Project/yuuto-bot), which is a community-driven project of Offical Camp Buddy Fan Server members, under GNU GPLv3 license. Yuuto bot's idea came from an increasing number of tech-oriented campers in the official fan server. While Yuuto is made by the community and for the community, the dialog choices and some design decisions are not meant for a specific character's fan server such as Taiga's fan server. Therefore, Taiga bot, while based on Yuuto bot and retains most features from Yuuto bot, aims to solve this problem and tailor to Taiga fan server's needs.

**Taiga bot is not the original version of Yuuto bot, but a modified version. Hence, if you are interested in the original version, please visit [yuuto-bot](https://github.com/Yuuto-Project/yuuto-bot) instead.**

*If you are interested in joining the project as a developer, please take time to check out Yuuto project's [website](https://iamdeja.github.io/yuuto-docs/).*

## Contents

- [Project Setup](#project-setup)
  - [Bot application](#bot-application)
  - [Why TypeScript](#why-typescript)
  - [Setup steps](#setup-steps)
- [Differences between Taiga Bot and Yuuto Bot](#differences-between-taiga-bot-and-yuuto-bot)
- [Disclaimer](#disclaimer)

## Project Setup

The Taiga bot is based on Yuuto bot, which is written in JavaScript and has a dedicated repository [here](https://github.com/Yuuto-Project/yuuto-bot). However, Taiga bot is ported and rewritten in TypeScript v3.8.3.

### Bot application

The bot is basically a port and a rewritten version of Yuuto bot in TypeScript. As such, it is run on Node.js v13+ and uses Discord.js v12.2.0 and TypeScript v3.8.3. Setup steps are described later.

### Why TypeScript

JavaScript, while being a de facto language choice when it comes to web development, is a weak-typed language. This makes it more challenging to track each variable and return value's types. As a result, it's not uncommon for the developer to manually track variable's types or assume the available methods and properties of a variable. Also, it's also more challenging for IDEs to provide static type checking and IntelliSense. Therefore, in order to ease the burden when rewriting parts of Yuuto bot's codes, TypeScript is chosen and actively used in as many circumstances as possible. You can read more about TypeScript [here](https://www.typescriptlang.org/).

`strictNullChecks` is enabled to ensure some required values are not and/or are not passed as `null` or `undefined` when developing.

### Setup steps

This repo doesn't include compiled `.js` files. Therefore, whether you are interested in hosting Taiga bot on your own or are just interested in the code, there are some required steps before you can compile the code.

1. [Install Node.js](https://nodejs.org/), which will also install npm on your machine (needs Node v13+).

2. Run:

   ```bash
   npm install -g typescript
   ```

   to install TypeScript globally.

3. Clone this repository with:

   ```bash
   git clone https://github.com/deadshot465/TaigaBot.git
   ```

4. Cd or switch to the cloned directory, and run:

   ```bash
   npm install
   ```

   to install required packages.

5. Run:

   ```bash
   tsc
   ```

   inside the directory where `tsconfig.json` is located.

6. Provided that you have created your own application on Discord, you can manually create a file named `.env` in the same location as `bot.ts`, as the program will read required tokens and environment variables from this file. An unmodified version of Taiga bot expects the following variables/tokens from `.env`:

   ```
   TOKEN = <Your Discord application token here>
   PREFIX = <The bot's command prefix>
   GENCHN = <The primary general channel's id>
   BOTCHN = <Dedicated bot commands channel's id>
   BOTMODCHN = <Dedicated bot commands channel's id that is only accessible by mods>
   TESTGENCHN = <Another personal test server's general channel id>
   TESTCHN = <Another personal test server's test channel id>
   VENTCHN = <Venting center channel id, as some channels are not meant for bot's random response>
   RDMCHANCE = <Random response's probability>
   UNSPLASH_TOKEN = <This bot uses Unsplash's API to acquire certain images. This is the token of your Unsplash application>
   ```

   **All placeholder texts should be replaced with your own content, without quotation marks (`"` and `'`) and greater than/less than (`<` and `>`) symbols.**
   
7. Once you set up, run:

   ```bash
   node bot.js
   ```

   to run the bot.

## Differences between Taiga Bot and Yuuto Bot

The main difference is, without a doubt, that Taiga bot is written in TypeScript, while Yuuto bot is written in JavaScript. More detailed descriptions include, but not limited to, the following:

1. All commands of Yuuto bot extend the `Command` class. While Taiga bot retains the `Command` class, it also implements the `ICommand` interface.
2. `route` command and `valentine` command also implement the `ICharacterRouter` interface.
3. `calcScore` function in `ship` command returns a `ShipData` interface.
4. Most parameters of functions, including those of methods inside classes, are typed.
5. Taiga bot uses the original Discord.js, while Yuuto bot uses a customized version of Discord.js.
6. `cvt` command directly queries a lookup table and doesn't convert to Kelvin first when calculating temperatures.
7. Commands, aliases and cooldowns are not properties of the client; instead, they are directly exported from `bot.ts`.
8. Certain dialogs and reactions are changed to add more flavors to Taiga.
9. `oracle` command is added, allowing users to draw Japanese oracles (fortune tellers).
10. `info` command shows a modified version of information to add disclaimers and other supporters during the porting and rewriting of Yuuto bot's code.

## Disclaimer

Taiga bot will not be possible without the code base of Yuuto bot. All credit for Yuuto bot's existing functionalities goes to the developers of Yuuto bot and the community. Please refer to the `info` command for more details.

- [Yuuto Project](https://iamdeja.github.io/yuuto-docs/)
- [Yuuto-bot Repository](https://github.com/Yuuto-Project/yuuto-bot)
- [Blits Games](https://www.blitsgames.com/)
- [Official Camp Buddy Fan Server](https://discord.gg/campbuddy) (on Discord)