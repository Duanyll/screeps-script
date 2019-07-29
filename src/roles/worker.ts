import * as Config from "config";
import { takeEnergy, constructStructures, upgradeController, repairWall, refillTower, maintainRoad, refillSpawnOrExtension, refillStorge } from "./task";

export function runWorker(creep: Creep) {
    if (creep.carry.energy == 0) {
        creep.memory.working = false;
        creep.memory.workType = undefined;
    }
    if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
        creep.memory.working = true;
    }
    if (creep.memory.working) {
        switch (creep.memory.workType) {
            case 'build':
                if (!constructStructures(creep)) upgradeController(creep);
                break;
            case 'refill':
                if (!refillSpawnOrExtension(creep)) {
                    if (refillTower(creep)) return;
                    refillStorge(creep);
                }
                break;
            case 'upgrade':
            default:
                upgradeController(creep);
                break;
        }
    } else {
        takeEnergy(creep);
    }
}
