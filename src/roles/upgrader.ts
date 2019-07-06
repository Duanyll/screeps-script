// 采集energy并升级controller
export function runUpgrader(creep: Creep): void {
    if (creep.memory.working && creep.carry.energy == 0) {
        creep.memory.working = false;
    }
    if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
        creep.memory.working = true;
    }
    if (creep.memory.working) {
        const sites = creep.room.find(FIND_CONSTRUCTION_SITES);
        const controller = creep.room.controller as StructureController;
        if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(controller);
        }
    } else {
        const sources = creep.room.find(FIND_SOURCES);
        if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0]);
        }
    }
}
