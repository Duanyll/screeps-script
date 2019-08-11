import * as Config from "config";
import { takeEnergy, constructStructures, upgradeController, repairWall, refillTower, maintainRoad, refillSpawnOrExtension, refillStorge, passEnergyToUpgrader } from "./task";

export function runClaimer(creep: Creep) {
    if (creep.carry.energy == 0) {
        creep.memory.working = false;
        creep.memory.workType = undefined;
    }
    if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
        creep.memory.working = true;
    }
    if (creep.memory.working) {
        if (creep.room.name != creep.memory.room) {
            // creep.moveTo(Game.rooms[creep.memory.room].controller as StructureController);
            const dir = creep.room.findExitTo(creep.memory.room) as FindConstant;
            creep.moveTo(creep.pos.findClosestByPath(dir) as RoomPosition);
        } else {
            if (creep.claimController(creep.room.controller as StructureController) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller as StructureController);
            }
        }
    } else {
        const storge = creep.room.storage as StructureStorage;
        if (creep.withdraw(storge, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(storge);
        }
    }
}
