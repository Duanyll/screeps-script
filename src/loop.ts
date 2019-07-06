import "roles/builder";
import "roles/harvester";
import "roles/upgrader";
import { runBuilder } from "roles/builder";
import { runHarvester } from "roles/harvester";
import { runUpgrader } from "roles/upgrader";
import { spawnCreep } from "./spawnManager";
import { manageTower } from "./towerManager";

export function runLoop(): void {
    releaseMemory();
    manageTower();
    manageCreep();
    spawnCreep();
    setUpConstruction();
}

// Automatically delete memory of missing creeps
function releaseMemory(): void {
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }
}

function manageCreep(): void {
    for (const name in Game.creeps) {
        let creep = Game.getObjectById(name) as Creep;
        switch (creep.memory.role) {
            case CreepRole.Build:
                runBuilder(creep);
                break;
            case CreepRole.Harvest:
                runHarvester(creep);
                break;
            case CreepRole.Upgarde:
                runUpgrader(creep);
                break;
            default:
                console.log(`Unknown creep role: ${name}`);
                break;
        }
    }
}

function setUpConstruction(): void {

}
