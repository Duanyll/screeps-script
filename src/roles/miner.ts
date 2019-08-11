import { refillSpawnOrExtension, constructStructures, repairWall, refillTower, refillStorge, upgradeController } from "./task";

export function runMiner(creep: Creep): void {
    const total = _.sum(creep.carry);
    if (total < creep.carryCapacity) {
        creep.memory.working = true;
    }
    if (creep.memory.working && total == creep.carryCapacity) {
        creep.memory.working = false;
    }
    if (creep.memory.working) {
        const dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 3);
        if (dropped.length > 0) {
            if (creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(dropped[0]);
            }
            return;
        }
        const tombStone = creep.room.find(FIND_TOMBSTONES, {
            filter: (tombStone: Tombstone) => _.sum(tombStone.store) - tombStone.store.energy > 0
        });
        if (tombStone.length > 0) {
            if (!creep.pos.isNearTo(tombStone[0])) {
                creep.moveTo(tombStone[0]);
            } else {
                for (const resourceType in tombStone[0].store) {
                    creep.withdraw(tombStone[0], resourceType as ResourceConstant);
                }
            }
            return;
        }
        const mineral = Game.getObjectById(creep.memory.targetSource) as Mineral;
        if (creep.harvest(mineral) == ERR_NOT_IN_RANGE) {
            creep.moveTo(mineral);
        }
    } else {
        const storge = creep.room.storage as StructureStorage;
        if (!creep.pos.isNearTo(storge)) {
            creep.moveTo(storge);
        } else {
            // transfer all resources
            for (const resourceType in creep.carry) {
                creep.transfer(storge, resourceType as ResourceConstant);
            }
        }
    }
    // creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
}
