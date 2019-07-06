export function manageTower(): void {
    for (const name in Game.rooms) {
        const room = Game.rooms[name];
        const towers = room.find(FIND_MY_STRUCTURES, {
            filter: (structure: Structure) => { return structure.structureType == STRUCTURE_TOWER }
        });
        towers.forEach((structure: AnyOwnedStructure) => {
            const tower = structure as StructureTower;
            const closestDamagedStructure = tower.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (structure: Structure) => { return structure.hits < structure.hitsMax }
            });
            if (closestDamagedStructure) {
                tower.repair(closestDamagedStructure);
            }
            const cloestEnemy = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (cloestEnemy) {
                tower.attack(cloestEnemy);
            }
        });
    }
}
