"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./helper");
const SPECIALIZED_CHANCE = 25;
const BACKGROUNDS = [
    "bath", "beach", "cabin", "camp",
    "cave", "forest", "messhall"
];
class ClientUtility {
    static randomMsgHandler(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = message.content.toLowerCase();
            if (content.includes('keitaro')) {
                if (this.isSpecialized()) {
                    message.channel.send(`What's your problem with my boyfriend?`);
                    return;
                }
            }
            //else if (content.includes('hiro')) {
            //    if (this.isSpecialized()) {
            //        const background = BACKGROUNDS[getRandomInt(0, BACKGROUNDS.length)];
            //        const response = await Axios.post('https://yuuto.dunctebot.com/dialog',
            //            { background, `hiro`, text }, {
            //            responseType: 'arraybuffer',
            //            headers: {
            //                'Accept': 'application/json',
            //                'Content-Type': 'application/json'
            //            }
            //        });
            //    }
            //}
        });
    }
    static isSpecialized() {
        return helper_1.getRandomInt(0, 100) < SPECIALIZED_CHANCE;
    }
}
exports.default = ClientUtility;
//# sourceMappingURL=clientUtility.js.map