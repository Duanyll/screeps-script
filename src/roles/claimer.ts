import * as Config from "config";
import { takeEnergy, constructStructures, upgradeController, repairWall, refillTower, maintainRoad, refillSpawnOrExtension, refillStorge, passEnergyToUpgrader } from "./task";

export function runClaimer(creep: Creep) {
    if (creep.room.name != creep.memory.room) {
        // creep.moveTo(Game.rooms[creep.memory.room].controller as StructureController);
        const dir = creep.room.findExitTo(creep.memory.room) as FindConstant;
        creep.moveTo(creep.pos.findClosestByPath(dir) as RoomPosition);
    } else {
        const controller = creep.room.controller as StructureController;
        if (creep.pos.inRangeTo(controller, 1)) {
            if (controller.owner && !controller.my) {
                creep.attackController(controller);
            } else {
                creep.claimController(controller);
            }
        } else {
            creep.moveTo(controller);
        }
    }
}
