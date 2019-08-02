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
        const link = creep.pos.findInRange(FIND_MY_STRUCTURES, 5, {
            filter: (structure: Structure) =>
                structure.structureType == STRUCTURE_LINK && (structure as StructureLink).energy > 0
        });
        if (link.length > 0) {
            if (creep.withdraw(link[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(link[0]);
            }
            return;
        }
        takeEnergy(creep);
    }
}
