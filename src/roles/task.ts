import * as Config from "config"

export function takeEnergy(creep: Creep) {
    const tombStone = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
        filter: (tombStone: Tombstone) => tombStone.store.energy > 0
    });
    if (tombStone && creep.room.findPath(creep.pos, tombStone.pos).length < tombStone.ticksToDecay) {
        if (creep.withdraw(tombStone, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(tombStone);
        }
        return;
    }
    const storge = creep.room.find(FIND_MY_STRUCTURES, {
        filter: (structure: Structure) => structure.structureType == STRUCTURE_CONTAINER
    });
    if (storge.length > 0) {
        if (creep.withdraw(storge[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(storge[0]);
        }
    } else {
        const source = creep.pos.findClosestByPath(FIND_SOURCES, {
            filter: (source: Source) => source.energy > 0
        }) as Source;
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
    }
}

export function refillSpawnOrExtension(creep: Creep) : boolean {
    const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure: Structure): boolean => {
            if (structure.structureType == STRUCTURE_EXTENSION) {
                const extension = structure as StructureExtension;
                return extension.energy < extension.energyCapacity;
            }
            if (structure.structureType == STRUCTURE_SPAWN) {
                const extension = structure as StructureSpawn;
                return extension.energy < extension.energyCapacity;
            }
            return false;
        }
    }) as Structure;
    if (target == undefined) { return false; }
    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
    }
    return true;
}

export function repairWall(creep: Creep): boolean {
    const repairableWalls = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure: Structure) => {
            return structure.structureType == STRUCTURE_WALL && structure.hits < Config.expectedWallStrength
                || structure.structureType == STRUCTURE_ROAD && (structure as StructureRoad).ticksToDecay < Config.expectedRoadStrength
                || structure.structureType == STRUCTURE_RAMPART && structure.hits < Config.expectedWallStrength;
        }
    });
    if (repairableWalls) {
        if (creep.repair(repairableWalls) == ERR_NOT_IN_RANGE) {
            creep.moveTo(repairableWalls);
        }
        return true;
    } else {
        return false;
    }
}

export function maintainRoad(creep: Creep): boolean {
    const road = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure: Structure) => {
            return structure.structureType == STRUCTURE_ROAD && (structure as StructureRoad).hits < Config.expectedRoadStrength
        }
    });
    if (road) {
        if (creep.repair(road) == ERR_NOT_IN_RANGE) {
            creep.moveTo(road);
        }
        return true;
    } else {
        return false;
    }
}

export function constructStructures(creep: Creep): boolean {
    const site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    if (site) {
        if (creep.build(site) == ERR_NOT_IN_RANGE) {
            creep.moveTo(site);
        }
        return true;
    } else {
        return false;
    }
}

export function upgradeController(creep: Creep) {
    const controller = creep.room.controller as StructureController;
    if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(controller);
    }
}

export function refillTower(creep: Creep) {
    const sites = creep.room.find(FIND_MY_STRUCTURES, {
        filter: (structure: Structure) => {
            return structure.structureType == STRUCTURE_TOWER && (structure as StructureTower).energy < (structure as StructureTower).energyCapacity;
        }
    });
    if (sites.length > 0) {
        if (creep.transfer(sites[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sites[0]);
        }
        return true;
    } else {
        return false;
    }
}

export function refillStorge(creep: Creep) {
    const storge = creep.room.find(FIND_MY_STRUCTURES, {
        filter: (structure: Structure) => { return structure.structureType == STRUCTURE_STORAGE }
    });
    if (storge.length > 0) {
        if (creep.transfer(storge[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(storge[0]);
        }
        return true;
    } else {
        return false;
    }
}

export function allocateTask() {
    for (const name in Game.rooms) {
        const room = Game.rooms[name];
        const creepWithoutWork = room.find(FIND_MY_CREEPS, {
            filter: (creep: Creep) => {
                return creep.memory.role == 'worker' && creep.memory.working && creep.memory.workType == undefined;
            }
        });

        // upgrade
        // const upgraderCount = room.find(FIND_MY_CREEPS, {
        //     filter: (creep: Creep) => {
        //         return creep.memory.role == 'worker' && creep.memory.working && creep.memory.workType == 'upgrade';
        //     }
        // }).length;
        let cur = 0;
        // for (; cur < 2 - upgraderCount && cur < creepWithoutWork.length; cur++) {
        //     creepWithoutWork[cur].memory.workType = 'upgrade';
        // }
        // if (cur == creepWithoutWork.length) { continue; }


        // refill
        const refillerCount = room.find(FIND_MY_CREEPS, {
            filter: (creep: Creep) => {
                return creep.memory.role == 'worker' && creep.memory.working && creep.memory.workType == 'refill';
            }
        }).length;
        if (refillerCount < 2 && cur < creepWithoutWork.length) {
            creepWithoutWork[cur++].memory.workType = 'refill';
        }

        // build
        const builderCount = room.find(FIND_MY_CREEPS, {
            filter: (creep: Creep) => {
                return creep.memory.role == 'worker' && creep.memory.working && creep.memory.workType == 'build';
            }
        }).length;
        if (builderCount < 2 && cur < creepWithoutWork.length) {
            creepWithoutWork[cur++].memory.workType = 'build';
        }
    }
}
