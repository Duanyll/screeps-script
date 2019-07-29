import { runHarvester } from "./roles/harvester";
import { spawnCreep } from "./spawnManager";
import { manageTower } from "./towerManager";
import * as Config from "config";
import { runWorker } from "roles/worker";
import { allocateTask } from "roles/task";
import { runUpgrader } from "roles/upgrader";

export function runLoop(): void {
    releaseMemory();
    manageTower();
    manageCreep();
    spawnCreep();
    manageLink();
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
            case 'upgrader':
                runUpgrader(creep);
                break;
            default:
                console.log(`Unknown creep role ${creep.memory.role}, creep: ${name}`);
                break;
        }
    }
}

function manageLink() {
    for (const name in Game.rooms) {
        const room = Game.rooms[name];
        const sources = room.find(FIND_SOURCES);
        sources.forEach(source => {
            const link = source.pos.findInRange(FIND_MY_STRUCTURES, 5, { filter: (structure: Structure) => { return structure.structureType == STRUCTURE_LINK; } }) as StructureLink[];
            if (link.length > 0) {
                if (link[0].energy == link[0].energyCapacity) {
                    link[0].transferEnergy(((room.controller as StructureController).pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (structure: Structure) => structure.structureType == STRUCTURE_LINK }) as StructureLink));
                }
            }
        });
    }
}

function setUpConstruction(): void {

}
