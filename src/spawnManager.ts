import * as Config from "config";

function getSpawnEnergy(room: Room): number {
    let ans = 0;
    const spawns = room.find(FIND_MY_SPAWNS);
    spawns.forEach((spawn: StructureSpawn) => {
        ans += spawn.energy;
    });
    const extensions = room.find(FIND_MY_STRUCTURES, { filter: (structure: Structure) => { return structure.structureType == STRUCTURE_EXTENSION } });
    extensions.forEach((structure: Structure) => {
        ans += (structure as StructureExtension).energy;
    });
    return ans;
}

function getWorkerCreepPart(energy: number): boolean | BodyPartConstant[] {
    if (energy < 300) return false;
    let ret: BodyPartConstant[] = [];
    let groupOfPart = Math.floor(energy / 250);
    for (let i = 0; i < groupOfPart; i++) {
        ret.push(WORK);
    }
    ret.push(CARRY);
    for (let i = 0; i < groupOfPart; i++) {
        ret.push(CARRY);
    }
    for (let i = 0; i < groupOfPart; i++) {
        ret.push(MOVE);
        ret.push(MOVE);
    }
    return ret;
}

function spawnHarvest(source: Source, spawn: StructureSpawn, energy: number): boolean {
    if (spawn.spawning) return false;
    const bodyPart = getWorkerCreepPart(energy);
    if (bodyPart != false) {
        const creepName = `harv-${Game.time}-${source.id}`;
        const creepMemory: CreepMemory = {
            role: 'harvest', working: true, targetSource: source.id, room: spawn.room.name, workType: undefined
        };
        spawn.spawnCreep(bodyPart as BodyPartConstant[], creepName, { memory: creepMemory });
        Memory.hervesterForSource[source.id] = creepName;
        console.log(`Spawning creep ${creepName}`);
        return true;
    }
    return false;
}

function spawnWorker(spawn: StructureSpawn, energy: number): boolean {
    if (spawn.spawning) return false;
    const bodyPart = getWorkerCreepPart(energy);
    if (bodyPart != false) {
        const creepName = `work-${Game.time}-${spawn.id}`;
        const creepMemory: CreepMemory = {
            role: 'worker', working: false, targetSource: undefined, room: spawn.room.name, workType: undefined
        };
        spawn.spawnCreep(bodyPart as BodyPartConstant[], creepName, { memory: creepMemory });
        console.log(`Spawning creep ${creepName}`);
        return true;
    }
    return false;
}

export function spawnCreep(): void {
    if (Memory.hervesterForSource == undefined) {
        Memory.hervesterForSource = new Object();
    }
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        const spawns = room.find(FIND_MY_SPAWNS);
        const energy = getSpawnEnergy(room);
        if (spawns.length > 0) {
            // 暂时只考虑1个spawn的情况
            const spawn = spawns[0];
            if (spawn.spawning) continue;
            let spawnedThisTick = false;

            // 补充harvest
            const sources = room.find(FIND_SOURCES);
            sources.forEach((source: Source) => {
                console.log(`Checking source ${source.id}`);
                const harvID: string | undefined = Memory.hervesterForSource[source.id];
                if (harvID == undefined) {
                    if (spawnHarvest(source, spawn, energy)) { spawnedThisTick = true; return; }
                } else {
                    const creep = Game.creeps[harvID];
                    if (creep == undefined || (creep.ticksToLive != undefined && creep.ticksToLive < 100)) {
                        // need to spawn a new creep
                        if (spawnHarvest(source, spawn, energy)) { spawnedThisTick = true; return; }
                    } else {
                        console.log(`No need to spawn creep.`);
                    }
                }
            });

            if (spawnedThisTick) continue;
            // 补充worker
            const workers = room.find(FIND_MY_CREEPS, {
                filter: (creep: Creep) => { return creep.memory.role == 'worker' }
            });
            if (workers.length < 8) {
                spawnWorker(spawn, energy);
            }
        }
    }
}
