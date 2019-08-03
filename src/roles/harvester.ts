import { refillSpawnOrExtension, constructStructures, repairWall, refillTower, refillStorge, upgradeController } from "./task";

// 采集energy, 补充到extension或spawn
export function runHarvester(creep: Creep): void {
    // 简单的(采集->就近卸下)循环
    if (creep.carry.energy == 0) {
        creep.memory.working = false;
    }
    if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
        creep.memory.working = true;
    }
    if (!creep.memory.working) {
        const dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 3);
        if (dropped.length > 0) {
            if (creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(dropped[0]);
            }
            return;
        }
        const source = Game.getObjectById(creep.memory.targetSource) as Source;
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
    } else {
        const link = creep.pos.findInRange(FIND_MY_STRUCTURES, 5, {
            filter: (structure: Structure) =>
                structure.structureType == STRUCTURE_LINK && (structure as StructureLink).energy < LINK_CAPACITY
        });
        if (link.length > 0) {
            if (creep.transfer(link[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(link[0]);
            }
            return;
        }
        if (!refillSpawnOrExtension(creep)) {
            if (refillTower(creep)) return;
            if (refillStorge(creep)) return;
            if (constructStructures(creep)) return;
            upgradeController(creep);
        }
    }
    // creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
}
