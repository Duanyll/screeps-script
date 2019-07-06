const expectedHarvesterCount = 3;
const expectedUpgraderCount = 2;
const expectedBuilderCount = 2;

// 目前策略: 按照固定数量补充
export function spawnCreep(): void {
    let roleCount = new Map<string, Map<CreepRole, number>>();
    for (const name in Game.creeps) {
        const creep = Game.getObjectById(name) as Creep;
        if (roleCount.get(creep.room.name) == undefined) {
            roleCount.set(creep.room.name, new Map<CreepRole, number>());
        }
        if ((roleCount.get(creep.room.name) as Map<CreepRole, number>).get(creep.memory.role) == undefined) {
            (roleCount.get(creep.room.name) as Map<CreepRole, number>).set(creep.memory.role, 0);
        }
        (roleCount.get(creep.room.name) as Map<CreepRole, number>).set(creep.memory.role,
            (roleCount.get(creep.room.name) as Map<CreepRole, number>).get(creep.memory.role) as number + 1);
    }
    let SpawnID = 0;
    roleCount.forEach((count: Map<CreepRole, number>, roomName: string): void => {
        const spawns = Game.rooms[roomName].find(FIND_MY_SPAWNS);
        spawns.forEach((spawn: StructureSpawn) => {
            if (spawn.spawning) return;
            if (count.get(CreepRole.Harvest) as number < expectedHarvesterCount) {
                const newName = `harv${Game.time}${SpawnID++}`;
                console.log(`Spawning new creep ${newName} at ${spawn.name}`);
                spawn.spawnCreep([WORK, CARRY, MOVE], newName, { memory: { role: CreepRole.Harvest, working: true, room: roomName } });
                return;
            }
            if (count.get(CreepRole.Upgarde) as number < expectedUpgraderCount) {
                const newName = `upgr${Game.time}${SpawnID++}`;
                console.log(`Spawning new creep ${newName} at ${spawn.name}`);
                spawn.spawnCreep([WORK, CARRY, MOVE], newName, { memory: { role: CreepRole.Upgarde, working: true, room: roomName } });
                return;
            }
            if (count.get(CreepRole.Build) as number < expectedBuilderCount) {
                const newName = `build${Game.time}${SpawnID++}`;
                console.log(`Spawning new creep ${newName} at ${spawn.name}`);
                spawn.spawnCreep([WORK, CARRY, MOVE], newName, { memory: { role: CreepRole.Build, working: false, room: roomName } });
                return;
            }
        });
    });
}
