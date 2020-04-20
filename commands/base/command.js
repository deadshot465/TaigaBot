"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Command {
    constructor(name, category, description, usage, alias, cooldown) {
        this.Name = name;
        this.Category = category;
        this.Description = description;
        this.Usage = usage;
        this.Cooldown = cooldown || 3;
        this.Alias = alias;
    }
    run(client, message, args) {
        throw new Error(`Run function not overridden in ${this.constructor.name}`);
    }
}
exports.default = Command;
//# sourceMappingURL=command.js.map