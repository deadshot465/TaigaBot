// Copyright(C) 2020 Tetsuki Syu
// See bot.ts for the full notice.

import * as Discord from 'discord.js';
import { format } from 'util';
import { PREFIX } from '../bot';
import * as localizedStrings from '../storage/localizedStrings.json';
import { CVT_PATTERN } from '../utility/patterns';
import Command from './base/command';
import { LOOKUP_LENGTH, LOOKUP_TEMPERATURE } from './lookupTables';

const LENGTHS = ['km', 'm', 'cm', 'in', 'ft', 'mi', 'au'];
const TEMPS = ['c', 'f', 'k'];
const VALID_UNITS = [...TEMPS, ...LENGTHS];

const enStrings = localizedStrings.find(val => val.lang === 'en')!;
const cvtStrings = enStrings.texts.cvt;

export default class Convert extends Command {
    constructor() {

        let usage = cvtStrings.usage.replace('{temps}', TEMPS.join(', '));
        usage = usage.replace('{heights}', LENGTHS.join(', '));

        super('cvt', 'util', cvtStrings.description, usage.trim(), ['convert']);
    }

    run(client: Discord.Client, message: Discord.Message, args: string[]): void {
        const { channel } = message;
        const deleteOps = { timeout: 15 * 1000 };

        message.delete(deleteOps).catch(() => { });

        const errorMsgs = cvtStrings.errors;
        const lengthTooShort = errorMsgs.length_too_short
            .replace('{temps}', TEMPS.join(', '))
            .replace('{heights}', LENGTHS.join(', '))
            .replace('{prefix}', PREFIX);

        if (args.length < 2) {
            channel
                .send(lengthTooShort.trim())
                .then(m => m.delete(deleteOps));
            return;
        }

        const targetUnit = args[0].toLowerCase();

        const invalidUnit = errorMsgs.invalid_unit
            .replace('{units}', VALID_UNITS.join(', '));

        if (!VALID_UNITS.includes(targetUnit)) {
            channel.send(invalidUnit)
                .then(m => m.delete(deleteOps));
            return;
        }

        const input = args[1].toLowerCase();

        const wrongPattern = errorMsgs.wrong_pattern
            .replace('{input}', input);

        if (!CVT_PATTERN.test(input)) {
            channel.send(wrongPattern)
                .then(m => m.delete(deleteOps));
            return;
        }

        channel.send(this.convert(targetUnit, input)).then(m => m.delete(deleteOps));
    }

    private convert(targetUnit: string, input: string) {
        const [, sourceValue, sourceUnit] = CVT_PATTERN.exec(input)!;
        const errorMsgs = cvtStrings.errors;

        if (!this.areCompatible(targetUnit, sourceUnit)) {
            return errorMsgs.operation_not_possible;
        }

        const tables = [LOOKUP_LENGTH, LOOKUP_TEMPERATURE];

        let numberToConvert = Number.parseFloat(sourceValue);
        if (Number.isNaN(numberToConvert))
            return errorMsgs.is_nan;

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

            return format(cvtStrings.result,
                sourceValue + this.unitToDisplay(sourceUnit),
                Math.round(result * 100000) / 100000,
                this.unitToDisplay(targetUnit));
        }

        return errorMsgs.generic;
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