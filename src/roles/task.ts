import * as Config from "config"
import { version } from "punycode";

export function takeEnergy(creep: Creep) {
    if (Memory['emergency'][creep.room.name]) {
        const storge = creep.room.storage;
        if (storge) {
            if (creep.withdraw(storge, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(storge);
            }
            return false;
        }
    }
    const tombStone = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
        filter: (tombStone: Tombstone) => tombStone.store.energy > 0
    });
    if (tombStone && creep.room.findPath(creep.pos, tombStone.pos).length < tombStone.ticksToDecay) {
        if (creep.withdraw(tombStone, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(tombStone);
        }
        return true;
    }
    const dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 5, {
        filter: (dropped: Resource) => dropped.amount > 50 && dropped.resourceType == RESOURCE_ENERGY
    });
    if (dropped.length > 0) {
        if (creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(dropped[0]);
        }
        return true;
    }
    const source = creep.pos.findClosestByPath(FIND_SOURCES, {
        filter: (source: Source) => source.energy > 0
    });
    if (source) {
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
        return true;
    }
    if (creep.memory.workType != 'refill') return false;
    const storge = creep.room.storage;
    if (storge) {
        if (creep.withdraw(storge, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(storge);
        }
    }
    return false;
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

export function passEnergyToUpgrader(creep: Creep) {
    const upgrader = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (creep: Creep) => creep.memory.role == 'upgrader' && creep.carry.energy < creep.carryCapacity });
    if (upgrader) {
        if (creep.transfer(upgrader, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(upgrader);
        }
    } else {
        upgradeController(creep);
    }
}

export function refillTower(creep: Creep) {
    const sites = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: (structure: Structure) => {
            return structure.structureType == STRUCTURE_TOWER && (structure as StructureTower).energy < (structure as StructureTower).energyCapacity;
        }
    });
    if (sites) {
        if (creep.transfer(sites, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sites);
        }
        return true;
    } else {
        return false;
    }
}

export function refillStorge(creep: Creep) {
    const storge = creep.room.storage;
    if (storge && storge.store.energy < 100000) {
        if (creep.transfer(storge, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(storge);
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
                return creep.memory.role == 'worker' && creep.memory.working && creep.memory.workType == undefined && creep.memory.room == name;
            }
        });

        if (Memory['emergency'][name]) {
            creepWithoutWork.forEach(creep => {
                creep.memory.workType = 'refill';
            });
        }
        let cur = 0;

        // refill
        const refillerCount = room.find(FIND_MY_CREEPS, {
            filter: (creep: Creep) => {
                return creep.memory.role == 'worker' && creep.memory.working && creep.memory.workType == 'refill';
            }
        }).length;
        if (room.find(FIND_MY_SPAWNS).length > 0 && refillerCount < 1 && cur < creepWithoutWork.length) {
            creepWithoutWork[cur++].memory.workType = 'refill';
        }

        const towerRefillerCount = room.find(FIND_MY_CREEPS, {
            filter: (creep: Creep) => {
                return creep.memory.role == 'worker' && creep.memory.working && creep.memory.workType == 'refill-tower';
            }
        }).length;
        if (towerRefillerCount < 1 && cur < creepWithoutWork.length) {
            creepWithoutWork[cur++].memory.workType = 'refill-tower';
        }

        // build
        const builderCount = room.find(FIND_MY_CREEPS, {
            filter: (creep: Creep) => {
                return creep.memory.role == 'worker' && creep.memory.working && creep.memory.workType == 'build';
            }
        }).length;
        if (room.find(FIND_MY_CONSTRUCTION_SITES).length > 0 && builderCount < 2 && cur < creepWithoutWork.length) {
            creepWithoutWork[cur++].memory.workType = 'build';
        }
    }
}
