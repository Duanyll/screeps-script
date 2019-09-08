import * as Config from "config";

function getWorkerCreepPart(energy: number, total: number): boolean | BodyPartConstant[] {
    if ((energy < 1800 && energy / total < 0.5) || energy < 300) return false;
    energy = Math.min(energy, 2200);
    let ret: BodyPartConstant[] = [];
    let groupOfPart = Math.floor((energy - 50) / 250);
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

function getHarvesterCreepPart(energy: number, total: number): boolean | BodyPartConstant[] {
    if ((energy < 3000 && energy / total < 0.8) || energy < 300) return false;
    energy = Math.min(energy, 2000)
    let ret: BodyPartConstant[] = [];
    let groupOfPart = Math.floor((energy - 50) / 150);
    for (let i = 0; i < groupOfPart; i++) {
        ret.push(WORK);
    }
    ret.push(CARRY);
    for (let i = 0; i < groupOfPart; i++) {
        ret.push(MOVE);
    }
    return ret;
}

function getUpgraderCreepPart(energy: number, total: number): boolean | BodyPartConstant[] {
    if ((energy < 2400 && energy / total < 0.5) || energy < 300) return false;
    energy = Math.min(energy, 2000)
    let ret: BodyPartConstant[] = [];
    let groupOfPart = Math.floor((energy - 50) / 150);
    for (let i = 0; i < groupOfPart; i++) {
        ret.push(WORK);
    }
    ret.push(CARRY);
    for (let i = 0; i < groupOfPart; i++) {
        ret.push(MOVE);
    }
    return ret;
}

function getAttackerCreepPart(energy: number): boolean | BodyPartConstant[] {
    if (energy < 2670) return false;
    let ret: BodyPartConstant[] = [];
    for (let i = 1; i <= 9; i++) {
        ret.push(TOUGH);
    }
    for (let i = 1; i <= 25; i++) {
        ret.push(MOVE);
    }
    for (let i = 1; i <= 15; i++) {
        ret.push(ATTACK);
    }
    ret.push(MOVE);
    return ret;
}

function getClaimerCreepPart(energy: number): boolean | BodyPartConstant[] {
    if (energy < 1350) return false;
    let ret: BodyPartConstant[] = [];
    let groupOfPart = Math.floor((energy - 50) / 650);
    // ret.push(CLAIM);
    for (let i = 0; i < groupOfPart; i++) {
        ret.push(MOVE);
    }
    for (let i = 0; i < groupOfPart; i++) {
        ret.push(CLAIM);
    }
    ret.push(MOVE);
    return ret;
}


function spawnHarvest(source: Source, spawn: StructureSpawn, energy: number, total: number): boolean {
    if (spawn.spawning) return false;
    const bodyPart = getHarvesterCreepPart(energy, total);
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

function spawnRemoteHarvest(id: string, spawn: StructureSpawn, energy: number, total: number): boolean {
    if (spawn.spawning) return false;
    const bodyPart = getWorkerCreepPart(energy, total);
    const sourceid = id.split("|")[0];
    const room = id.split("|")[1];
    if (bodyPart != false) {
        const creepName = `rhrv-${Game.time}-${sourceid}`;
        const creepMemory: CreepMemory = {
            role: 'remoteHarvest', working: true, targetSource: sourceid, room: spawn.room.name, workType: undefined, sourceRoom: room
        };
        spawn.spawnCreep(bodyPart as BodyPartConstant[], creepName, { memory: creepMemory });
        Memory.hervesterForSource[id] = creepName;
        console.log(`Spawning creep ${creepName}`);
        return true;
    }
    return false;
}

function spawnWorker(spawn: StructureSpawn, energy: number, total: number, room: string = ""): boolean {
    if (spawn.spawning) return false;
    const bodyPart = getWorkerCreepPart(energy, total);
    if (bodyPart != false) {
        const creepName = `work-${Game.time}-${spawn.id}`;
        const creepMemory: CreepMemory = {
            role: 'worker', working: false, targetSource: undefined, room: (room != "") ? room : spawn.room.name, workType: undefined
        };
        spawn.spawnCreep(bodyPart as BodyPartConstant[], creepName, { memory: creepMemory });
        console.log(`Spawning creep ${creepName}`);
        return true;
    }
    return false;
}

function spawnUpgrader(spawn: StructureSpawn, energy: number, total: number, hasLink: boolean): boolean {
    if (spawn.spawning) return false;
    const bodyPart = hasLink ? getUpgraderCreepPart(energy, total) : getWorkerCreepPart(energy, total);
    if (bodyPart != false) {
        const creepName = `upgr-${Game.time}-${spawn.id}`;
        const creepMemory: CreepMemory = {
            role: 'upgrader', working: false, targetSource: undefined, room: spawn.room.name, workType: undefined
        };
        spawn.spawnCreep(bodyPart as BodyPartConstant[], creepName, { memory: creepMemory });
        console.log(`Spawning creep ${creepName}`);
        return true;
    }
    return false;
}

function spawnAttacker(spawn: StructureSpawn, energy: number): boolean {
    if (spawn.spawning) return false;
    const bodyPart = getAttackerCreepPart(energy);
    if (bodyPart != false) {
        const creepName = `atck-${Game.time}-${Memory['attackTarget'].name}`;
        const creepMemory: CreepMemory = {
            role: 'attacker', working: false, targetSource: undefined, room: Memory['attackTarget'].name, workType: undefined
        };
        spawn.spawnCreep(bodyPart as BodyPartConstant[], creepName, { memory: creepMemory });
        console.log(`Spawning creep ${creepName}`);
        Memory['attackTarget'].count--;
        return true;
    }
    // console.log('attacker energy not enough' + energy.toString());
    return false;
}

function spawnClaimer(spawn: StructureSpawn, energy: number): boolean {
    if (spawn.spawning) return false;
    const bodyPart = getClaimerCreepPart(energy);
    if (bodyPart != false) {
        const creepName = `claim-${Game.time}-${Memory['claimTarget']}`;
        const creepMemory: CreepMemory = {
            role: 'claimer', working: false, targetSource: undefined, room: Memory['claimTarget'], workType: undefined
        };
        spawn.spawnCreep(bodyPart as BodyPartConstant[], creepName, { memory: creepMemory });
        console.log(`Spawning creep ${creepName}`);
        Memory['claimTarget'] = undefined;
        return true;
    }
    return false;
}

function spawnMiner(mineral: Mineral, spawn: StructureSpawn, energy: number, total: number): boolean {
    if (spawn.spawning) return false;
    const bodyPart = getWorkerCreepPart(energy, total);
    if (bodyPart != false) {
        const creepName = `mine-${Game.time}-${mineral.id}`;
        const creepMemory: CreepMemory = {
            role: 'miner', working: true, targetSource: mineral.id, room: spawn.room.name, workType: undefined
        };
        spawn.spawnCreep(bodyPart as BodyPartConstant[], creepName, { memory: creepMemory });
        Memory.hervesterForSource[mineral.id] = creepName;
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
        if (spawns.length > 0) {
            const energy = room.energyAvailable;
            console.log(`Energy in room ${roomName}: ${energy}`)
            const total = room.energyCapacityAvailable;
            // 暂时只考虑1个spawn的情况
            const spawn = spawns[0];
            if (spawn.spawning) continue;
            let spawnedThisTick = false;

            const creepCount = room.find(FIND_MY_CREEPS).length;
            // Emergency mode
            if (creepCount < 4) {
                Memory['emergency'][roomName] = true;
                spawnWorker(spawn, energy, 300);
                return;
            }
            if (Memory['emergency'][roomName] && energy / total > 0.5) Memory['emergency'][roomName] = false;

            // 补充harvest
            const sources = room.find(FIND_SOURCES);
            sources.forEach((source: Source) => {
                let hasLink = source.pos.findInRange(FIND_MY_STRUCTURES, 5, { filter: (structure: Structure) => { return structure.structureType == STRUCTURE_LINK; } }).length > 0;
                if (!hasLink) return;
                const harvID: string | undefined = Memory.hervesterForSource[source.id];
                if (harvID == undefined) {
                    if (spawnHarvest(source, spawn, energy, total)) { spawnedThisTick = true; return; }
                } else {
                    const creep = Game.creeps[harvID];
                    if (creep == undefined || (creep.ticksToLive != undefined && creep.ticksToLive < 100)) {
                        // need to spawn a new creep
                        if (spawnHarvest(source, spawn, energy, total)) { spawnedThisTick = true; return; }
                    }
                }
            });

            if (spawnedThisTick) continue;
            // 补充upgrader
            const upgraders = room.find(FIND_MY_CREEPS, {
                filter: (creep: Creep) => { return creep.memory.role == 'upgrader' }
            });
            const hasLink = (room.controller as StructureController).pos.findInRange(FIND_MY_STRUCTURES, 5, {
                filter: (struct: Structure) => struct.structureType == STRUCTURE_LINK
            }).length > 0;
            if (upgraders.length < 2) {
                if (spawnUpgrader(spawn, energy, total, hasLink)) return;
            }

            const workersExpected = ((room.controller as StructureController).level < 6 || room.find(FIND_CONSTRUCTION_SITES).length > 5) ? 6 : 3;
            // 补充worker
            const workers = room.find(FIND_MY_CREEPS, {
                filter: (creep: Creep) => { return creep.memory.role == 'worker' }
            });
            if (workers.length < workersExpected) {
                spawnWorker(spawn, energy, total);
                return;
            }

            if (Memory['remoteSources'][roomName] == undefined) {
                Memory['remoteSources'][roomName] = [];
            }
            const remoteSources = Memory['remoteSources'][roomName] as string[];
            remoteSources.forEach((id: string) => {
                const harvID: string | undefined = Memory.hervesterForSource[id];
                if (harvID == undefined) {
                    if (spawnRemoteHarvest(id, spawn, energy, total)) { spawnedThisTick = true; return; }
                } else {
                    const creep = Game.creeps[harvID];
                    if (creep == undefined || (creep.ticksToLive != undefined && creep.ticksToLive < 100)) {
                        // need to spawn a new creep
                        if (spawnRemoteHarvest(id, spawn, energy, total)) { spawnedThisTick = true; return; }
                    }
                }
            });
            if (spawnedThisTick) continue;

            if (room.find(FIND_MY_STRUCTURES, { filter: (struct: Structure) => struct.structureType == STRUCTURE_EXTRACTOR }).length > 0) {
                const mineral = room.find(FIND_MINERALS);
                mineral.forEach((mineral: Mineral) => {
                    if (mineral.mineralAmount == 0) return;
                    const harvID: string | undefined = Memory.hervesterForSource[mineral.id];
                    if (harvID == undefined) {
                        if (spawnMiner(mineral, spawn, energy, total)) { spawnedThisTick = true; return; }
                    } else {
                        const creep = Game.creeps[harvID];
                        if (creep == undefined || (creep.ticksToLive != undefined && creep.ticksToLive < 100)) {
                            // need to spawn a new creep
                            if (spawnMiner(mineral, spawn, energy, total)) { spawnedThisTick = true; return; }
                        }
                    }
                });
            }
            if (spawnedThisTick) continue;

            if (Memory['attackTarget'].count > 0) {
                // console.log('Trying spawn attacker');
                spawnAttacker(spawn, energy);
                continue;
            }

            if (Memory['claimTarget']) {
                spawnClaimer(spawn, energy);
                continue;
            }

            if (Memory['roomWithoutSpawn']) {
                const creeps = Game.rooms[Memory['roomWithoutSpawn']].find(FIND_MY_CREEPS);
                if (creeps.length < 2) {
                    spawnWorker(spawn, energy, total, Memory['roomWithoutSpawn']);
                }
            }
        }
    }
}
