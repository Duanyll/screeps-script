import { refillSpawnOrExtension, constructStructures, repairWallOrRoad } from "./task";

// 采集energy, 补充到extension或spawn
export function runHarvester(creep: Creep): void {
    // 简单的(采集->就近卸下)循环
    if (creep.carry.energy < creep.carryCapacity) {
        const source = Game.getObjectById(creep.memory.targetSource) as Source;
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
    } else {
        const storge = creep.room.find(FIND_MY_STRUCTURES, {
            filter: (structure: Structure) => { return structure.structureType == STRUCTURE_CONTAINER }
        });
        if (storge.length > 0) {
            if (creep.transfer(storge[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(storge[0]);
            }
            return;
        }
        if (!refillSpawnOrExtension(creep)) {
            if (!constructStructures(creep)) repairWallOrRoad(creep);
        }
    }
}
