import { expectedWallStrength, expectedRoadStrength } from "config";

export function manageTower(): void {
    for (const name in Game.rooms) {
        const room = Game.rooms[name];
        const towers = room.find(FIND_MY_STRUCTURES, {
            filter: (structure: Structure) => { return structure.structureType == STRUCTURE_TOWER }
        });
        towers.forEach((structure: AnyOwnedStructure) => {
            const tower = structure as StructureTower;
            const cloestEnemy = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (cloestEnemy) {
                tower.attack(cloestEnemy);
                return;
            }
            const closestDamagedStructure = tower.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (structure: Structure) => { return (structure.structureType != STRUCTURE_RAMPART && structure.structureType != STRUCTURE_WALL) && structure.hits < structure.hitsMax }
            });
            if (closestDamagedStructure) {
                tower.repair(closestDamagedStructure);
                return;
            }
            const cloestRepairable = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    return /*(structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) &&*/ structure.hits < expectedWallStrength
                        || (structure.structureType == STRUCTURE_ROAD && structure.hits < expectedRoadStrength);
                }
            });
            if (cloestRepairable) {
                tower.repair(cloestRepairable);
            }
        });
    }
}
