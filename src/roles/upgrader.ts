// 采集energy并升级controller
export function runUpgrader(creep: Creep): void {
    if (creep.carry.energy == 0) {
        const sources = creep.room.find(FIND_SOURCES);
        if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0]);
        }
    } else {
        const controller = creep.room.controller as StructureController;
        if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(controller);
        }
    }
}
