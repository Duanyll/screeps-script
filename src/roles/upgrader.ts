import { getSource, arriveAtSource } from "./taskAllocator";

// 采集energy并升级controller
export function runUpgrader(creep: Creep): void {
    if (creep.memory.working && creep.carry.energy == 0) {
        creep.memory.working = false;
    }
    if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
        creep.memory.working = true;
    }
    if (creep.memory.working) {
        creep.memory.targetSource = undefined;
        const sites = creep.room.find(FIND_CONSTRUCTION_SITES);
        const controller = creep.room.controller as StructureController;
        if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(controller);
        }
    } else {
        if (!creep.memory.targetSource) {
            creep.memory.targetSource = (creep.pos.findClosestByPath(FIND_SOURCES) as Source).id;
        }
        const source = Game.getObjectById(creep.memory.targetSource) as Source;
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        } else {
            arriveAtSource(source);
        }
    }
}
