// 采集energy并就近建设
export function runBuilder(creep: Creep): void {
    if (creep.memory.working && creep.carry.energy == 0) {
        creep.memory.working = false;
    }
    if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
        creep.memory.working = true;
    }
    if (creep.memory.working) {
        const sites = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (sites.length > 0) {
            if (creep.build(sites[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sites[0]);
            }
        }
    } else {
        const sources = creep.room.find(FIND_SOURCES);
        if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0]);
        }
    }
}
