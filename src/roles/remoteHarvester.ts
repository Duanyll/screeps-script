import { refillSpawnOrExtension, constructStructures, repairWall, refillTower, refillStorge, upgradeController } from "./task";

export function runRemoteHarvester(creep: Creep): void {
    // 简单的(采集->就近卸下)循环
    const carrySum = _.sum(creep.carry);
    if (creep.carry.energy == 0) {
        creep.memory.working = false;
    }
    if (!creep.memory.working && carrySum == creep.carryCapacity) {
        creep.memory.working = true;
    }
    if (!creep.memory.working) {
        const dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 3, { filter: (resource: Resource) => resource.resourceType == RESOURCE_ENERGY });
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
        if (creep.room.name != creep.memory.room) {
            const dir = creep.room.findExitTo(creep.memory.room) as FindConstant;
            creep.moveTo(creep.pos.findClosestByPath(dir) as RoomPosition);
            return;
        } else {
            const link = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: (structure: Structure) => structure.structureType == STRUCTURE_LINK });
            if (link) {
                if (!creep.pos.isNearTo(link)) {
                    creep.moveTo(link);
                } else {
                    creep.transfer(link, RESOURCE_ENERGY);
                }
            }
        }
    }
    // creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
}
