import * as Config from "config";
import { getSource, arriveAtSource } from "./taskAllocator";

// 采集energy并就近建设
export function runBuilder(creep: Creep): void {
    if (creep.memory.working && creep.carry.energy == 0) {
        creep.memory.working = false;
    }
    if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
        creep.memory.working = true;
    }
    if (creep.memory.working) {
        creep.memory.targetSource = undefined;
        const sites = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (sites.length > 0) {
            if (creep.build(sites[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sites[0]);
            }
            return;
        }
        const repairableWalls = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType == STRUCTURE_WALL && structure.hits < Config.expectedWallStrength
                    || structure.structureType == STRUCTURE_ROAD && structure.hits < Config.expectedWallStrength;
            }
        });
        if (repairableWalls) {
            if (creep.repair(repairableWalls) == ERR_NOT_IN_RANGE) {
                creep.moveTo(repairableWalls);
            }
            return;
        }
    } else {
        if (!creep.memory.targetSource) {
            creep.memory.targetSource = getSource(creep.room).id;
        }
        const source = Game.getObjectById(creep.memory.targetSource) as Source;
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        } else {
            arriveAtSource(source);
        }
    }
}
