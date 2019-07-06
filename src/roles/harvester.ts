import { getSource, arriveAtSource } from "./taskAllocator";

// 采集energy, 补充到extension或spawn
export function runHarvester(creep: Creep): void {
    // 简单的(采集->就近卸下)循环
    if (creep.carry.energy < creep.carryCapacity) {
        if (!creep.memory.targetSource) {
            creep.memory.targetSource = getSource(creep.room).id;
        }
        const source = Game.getObjectById(creep.memory.targetSource) as Source;
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        } else {
            arriveAtSource(source);
        }
    } else {
        creep.memory.targetSource = undefined;
        const targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure: Structure): boolean => {
                if (structure.structureType == STRUCTURE_EXTENSION) {
                    let extension = structure as StructureExtension;
                    return extension.energy < extension.energyCapacity;
                }
                if (structure.structureType == STRUCTURE_SPAWN) {
                    let extension = structure as StructureSpawn;
                    return extension.energy < extension.energyCapacity;
                }
                return false;
            }
        });
        if (targets.length > 0) {
            if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0]);
            }
        }
    }
}
