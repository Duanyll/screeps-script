import { runHarvester } from "./roles/harvester";
import { spawnCreep } from "./spawnManager";
import { manageTower } from "./towerManager";
import * as Config from "config";
import { runWorker } from "roles/worker";
import { allocateTask } from "roles/task";
import { runUpgrader } from "roles/upgrader";
import { runClaimer } from "roles/claimer";
import { runMiner } from "roles/miner";
import { runRemoteHarvester } from "roles/remoteHarvester";

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
            case 'claimer':
                runClaimer(creep);
                break;
            case 'miner':
                runMiner(creep);
                break;
            case 'remoteHarvest':
                runRemoteHarvester(creep);
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
        const links = room.find(FIND_MY_STRUCTURES, { filter: (struct: Structure) => struct.structureType == STRUCTURE_LINK }) as StructureLink[];
        const controller = room.controller as StructureController;
        const targetLink = controller.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (struct: Structure) => struct.structureType == STRUCTURE_LINK }) as StructureLink;
        links.forEach(link => {
            if (link.id == targetLink.id) return;
            if (targetLink.energy < 50) {
                link.transferEnergy(targetLink);
            }
        });
    }
}

function setUpConstruction(): void {

}
