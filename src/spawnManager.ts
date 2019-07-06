import * as Config from "config";

// 目前策略: 按照固定数量补充
export function spawnCreep(): void {
    let roleCount = new Map<string, Map<string, number>>();
    for (const name in Game.rooms) {
        roleCount.set(name, new Map<string, number>());
    }
    for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        if (roleCount.get(creep.room.name) == undefined) {
            roleCount.set(creep.room.name, new Map<string, number>());
        }
        if ((roleCount.get(creep.room.name) as Map<string, number>).get(creep.memory.role) == undefined) {
            (roleCount.get(creep.room.name) as Map<string, number>).set(creep.memory.role, 0);
        }
        (roleCount.get(creep.room.name) as Map<string, number>).set(creep.memory.role,
            (roleCount.get(creep.room.name) as Map<string, number>).get(creep.memory.role) as number + 1);
    }
    let SpawnID = 0;
    roleCount.forEach((count: Map<string, number>, roomName: string): void => {
        const spawns = Game.rooms[roomName].find(FIND_MY_SPAWNS);
        spawns.forEach((spawn: StructureSpawn) => {
            if (spawn.spawning) return;
            if (count.get('harvest') == undefined || count.get('harvest') as number < Config.expectedHarvesterCount) {
                const newName = `harv${Game.time}${SpawnID++}`;
                console.log(`Spawning new creep ${newName} at ${spawn.name}`);
                spawn.spawnCreep([WORK, CARRY, MOVE, MOVE], newName, {
                    memory: {
                        role: 'harvest', working: true, room: roomName, targetSource: undefined
                    }
                });
                return;
            }
            if (count.get('upgrade') == undefined || count.get('upgrade') as number < Config.expectedUpgraderCount) {
                const newName = `upgr${Game.time}${SpawnID++}`;
                console.log(`Spawning new creep ${newName} at ${spawn.name}`);
                spawn.spawnCreep([WORK, CARRY, MOVE, MOVE], newName, {
                    memory: {
                        role: 'upgrade', working: true, room: roomName, targetSource: undefined
                    }
                });
                return;
            }
            if (count.get('build') == undefined || count.get('build') as number < Config.expectedBuilderCount) {
                const newName = `build${Game.time}${SpawnID++}`;
                console.log(`Spawning new creep ${newName} at ${spawn.name}`);
                spawn.spawnCreep([WORK, CARRY, MOVE, MOVE], newName, {
                    memory: {
                        role: 'build', working: false, room: roomName, targetSource: undefined
                    }
                });
                return;
            }
        });
    });
}
