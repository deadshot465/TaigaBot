import { LOOKUP_LENGTH, LOOKUP_TEMPERATURE } from './lookupTables';
import { format } from 'util';

const ERROR_MESSAGE: string = `Correct usage for this command is \`>cvt <unit-to-convert-to> <value>\`\n` +
    `Available length units are: km, m, cm, in, ft, mi, au\n` +
    `Available temperature units are: c, f, k\n` +
    `Some examples of this are: \`>cvt f 30c\`\n` +
    `\`>cvt c 100f\``;

function convert(convertUnit?: string, amount?: string): string {

    if (convertUnit == null || amount == null) return ERROR_MESSAGE;

    let regex = /([0-9.]+)(\D{1,2})/;
    let parseResult = regex.exec(amount.toLowerCase());
    convertUnit = convertUnit.toLowerCase();

    let tables = [LOOKUP_LENGTH, LOOKUP_TEMPERATURE];

    for (let type of tables) {

        if (type[convertUnit] == null)
            continue;
        if (parseResult == null)
            continue;

        let numberToBeCalculated = Number.parseFloat(parseResult[1]);
        if (Number.isNaN(numberToBeCalculated))
            continue;
        if (type[convertUnit][parseResult[2]] == null)
            continue;

        let calculatedResult: number;

        switch (convertUnit) {
            case 'c':
                if (parseResult[2] === 'f')
                    numberToBeCalculated -= 32;
                else if (parseResult[2] === 'k')
                    numberToBeCalculated -= 273.15;
                calculatedResult = type[convertUnit][parseResult[2]] * numberToBeCalculated;
                break;
            case 'f':
                calculatedResult = type[convertUnit][parseResult[2]] * numberToBeCalculated;
                if (parseResult[2] === 'c')
                    calculatedResult += 32;
                else if (parseResult[2] === 'k')
                    calculatedResult -= 459.67;
                break;
            case 'k':
                if (parseResult[2] === 'c')
                    numberToBeCalculated += 273.15;
                else if (parseResult[2] === 'f') {
                    numberToBeCalculated += 459.67;
                }
                calculatedResult = type[convertUnit][parseResult[2]] * numberToBeCalculated;
                break;
            default:
                calculatedResult = type[convertUnit][parseResult[2]] * numberToBeCalculated;
                break;
        }

        return format('%s is %d%s', amount, Math.round(calculatedResult * 100000) / 100000,
            convertUnit);
    }

    return ERROR_MESSAGE;
}

export default convert;