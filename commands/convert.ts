// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import * as Discord from 'discord.js';
import { format } from 'util';
import { PREFIX } from '../bot';
import { CVT_PATTERN } from '../utility/patterns';
import Command from './base/command';
import { LOOKUP_LENGTH, LOOKUP_TEMPERATURE } from './lookupTables';

const LENGTHS = ['km', 'm', 'cm', 'in', 'ft', 'mi', 'au'];
const TEMPS = ['c', 'f', 'k'];
const VALID_UNITS = [...TEMPS, ...LENGTHS];

export default class Convert extends Command {
    constructor() {
        super('cvt', 'util', 'Helps converting stuff',
            `Run \`cvt <target unit> <value><origin unit>\` to convert \`<value>\` from \`<origin unit>\` to \`<target unit>\`.\nTemperature units to convert to are \`${TEMPS.join(
                ", "
            )}\` from those values.
Height units to convert to are \`${LENGTHS.join(
                ", "
            )}\` from those same values as well.`.trim(), ['convert']);
    }

    run(client: Discord.Client, message: Discord.Message, args: string[]): void {
        const { channel } = message;
        const deleteOps = { timeout: 15 * 1000 };

        message.delete(deleteOps).catch(() => { });

        if (args.length < 2) {
            channel
                .send(`Temperature units to convert to are \`${TEMPS.join(
                    ", "
                )}\` from those values.
Height units to convert to are \`${LENGTHS.join(
                    ", "
                )}\` from those same values as well.
The syntax is \`${PREFIX}cvt <unit-to-convert-to> <value>\``.trim())
                .then(m => m.delete(deleteOps));
            return;
        }

        const targetUnit = args[0].toLowerCase();

        if (!VALID_UNITS.includes(targetUnit)) {
            channel.send(`<:Spray:701105694761418774> Valid units are \`${VALID_UNITS.join(
                ", "
            )}\`.`)
                .then(m => m.delete(deleteOps));
            return;
        }

        const input = args[1].toLowerCase();

        if (!CVT_PATTERN.test(input)) {
            channel.send(`<:TaigaUneasy2:700006812673638500> Not sure what you mean by \`${input}\`.`)
                .then(m => m.delete(deleteOps));
            return;
        }

        channel.send(this.convert(targetUnit, input)).then(m => m.delete(deleteOps));
    }

    private convert(targetUnit: string, input: string) {
        const [, sourceValue, sourceUnit] = CVT_PATTERN.exec(input)!;

        if (!this.areCompatible(targetUnit, sourceUnit)) {
            return `<:TaigaAck2:700006264507465778> That's not possible, you dummy.`;
        }

        const tables = [LOOKUP_LENGTH, LOOKUP_TEMPERATURE];

        let numberToConvert = Number.parseFloat(sourceValue);
        if (Number.isNaN(numberToConvert))
            return `<:TaigaAck2:700006264507465778> Even Lee would be unable to calculate that.`;

        for (const type of tables) {
            if (!type[targetUnit]) continue;
            if (!type[targetUnit][sourceUnit]) continue;

            let result: number;

            switch (targetUnit) {
                case 'c':
                    if (sourceUnit === 'f')
                        numberToConvert -= 32;
                    else if (sourceUnit === 'k')
                        numberToConvert -= 273.15;
                    result = type[targetUnit][sourceUnit] * numberToConvert;
                    break;
                case 'f':
                    result = type[targetUnit][sourceUnit] * numberToConvert;
                    if (sourceUnit === 'c')
                        result += 32;
                    else if (sourceUnit === 'k')
                        result -= 459.67;
                    break;
                case 'k':
                    if (sourceUnit === 'c')
                        numberToConvert += 273.15;
                    else if (sourceUnit === 'f') {
                        numberToConvert += 459.67;
                    }
                    result = type[targetUnit][sourceUnit] * numberToConvert;
                    break;
                default:
                    result = type[targetUnit][sourceUnit] * numberToConvert;
                    break;
            }

            return format(`<:chibitaiga:697893400891883531> According to Lee's calculations, %s is %d%s`,
                sourceValue + this.unitToDisplay(sourceUnit),
                Math.round(result * 100000) / 100000,
                this.unitToDisplay(targetUnit));
        }

        return `<:TaigaAck2:700006264507465778> Guess something just went wrong.`;
    }

    private areCompatible(target: string, src: string) {
        return (TEMPS.includes(target) && TEMPS.includes(src)) ||
            (LENGTHS.includes(target) && LENGTHS.includes(src));
    }

    private unitToDisplay(unit: string) {
        switch (unit) {
            case 'c':
                return '\u2103';
            case 'f':
                return '\u00B0\u0046';
            case 'k':
                return 'K';
            default:
                return unit;
        }
    }
}