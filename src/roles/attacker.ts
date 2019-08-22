import * as Config from "config";
import { takeEnergy, constructStructures, upgradeController, repairWall, refillTower, maintainRoad, refillSpawnOrExtension, refillStorge, passEnergyToUpgrader } from "./task";

export function runAttacker(creep: Creep) {
    if (creep.room.name != creep.memory.room) {
        // creep.moveTo(Game.rooms[creep.memory.room].controller as StructureController);
        // console.log("moving to target");
        const dir = creep.room.findExitTo(creep.memory.room) as FindConstant;
        creep.moveTo(creep.pos.findClosestByPath(dir) as RoomPosition);
    } else {
        const spawn = creep.room.find(FIND_HOSTILE_SPAWNS);
        if (spawn[0]) {
            // console.log(`Attacking spawn of ${spawn[0].owner.username}`);
            if (creep.attack(spawn[0]) != OK) {
                creep.moveTo(spawn[0]);
            }
            return;
        }
        const enemy = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (enemy) {
            if (creep.attack(enemy) == ERR_NOT_IN_RANGE) {
                creep.moveTo(enemy);
            }
            return;
        }
        const structure = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
        if (structure) {
            if (creep.attack(structure) == ERR_NOT_IN_RANGE) {
                creep.moveTo(structure);
            }
            return;
        }
    }
}
