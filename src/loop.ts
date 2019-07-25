import { runHarvester } from "./roles/harvester";
import { spawnCreep } from "./spawnManager";
import { manageTower } from "./towerManager";
import * as Config from "config";
import { runWorker } from "roles/worker";
import { allocateTask } from "roles/task";

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
    allocateTask();
    for (const name in Game.creeps) {
        let creep = Game.creeps[name];
        switch (creep.memory.role) {
            case 'harvest':
                runHarvester(creep);
                break;
            case 'worker':
                runWorker(creep);
                break;
            default:
                console.log(`Unknown creep role ${creep.memory.role}, creep: ${name}`);
                break;
        }
    }
}

function setUpConstruction(): void {

}
