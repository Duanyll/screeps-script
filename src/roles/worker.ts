import * as Config from "config";
import { takeEnergy, constructStructures, upgradeController, repairWall, refillTower, maintainRoad, refillSpawnOrExtension, refillStorge, passEnergyToUpgrader } from "./task";

export function runWorker(creep: Creep) {
    if (creep.carry.energy == 0) {
        creep.memory.working = false;
        creep.memory.workType = undefined;
    }
    if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
        creep.memory.working = true;
    }
    if (creep.memory.working) {
        if (creep.room.name != creep.memory.room) {
            creep.moveTo(Game.rooms[creep.memory.room].controller as StructureController);
            return;
        }

        if ((creep.room.controller as StructureController).level < 2) {
            upgradeController(creep);
            return;
        }

        switch (creep.memory.workType) {
            case 'build':
                if (!constructStructures(creep)) passEnergyToUpgrader(creep);
                break;
            case 'refill':
                if (!refillSpawnOrExtension(creep)) {
                    if (refillTower(creep)) return;
                    if (refillStorge(creep)) return;
                    if (constructStructures(creep)) return;
                    upgradeController(creep);
                }
                break;
            case 'refill-tower':
                if (!refillTower(creep)) {
                    if (refillSpawnOrExtension(creep)) return;
                    if (refillStorge(creep)) return;
                    constructStructures(creep);
                }
                break;
            case 'upgrade':
            default:
                passEnergyToUpgrader(creep);
                break;
        }
    } else {
        takeEnergy(creep);
    }
}
