import * as Config from "config";
import { takeEnergy, constructStructures, upgradeController, repairWall, refillTower, maintainRoad } from "./task";

export function runUpgrader(creep: Creep) {
    if (creep.carry.energy == 0) {
        creep.memory.working = false;
        creep.memory.workType = undefined;
    }
    if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
        creep.memory.working = true;
    }
    if (creep.memory.working) {
        upgradeController(creep);
    } else {
        takeEnergy(creep, true);
    }
}
