import { GameDatabase } from '../src/data/sqlite_loader';

console.log('🔍 Teste Quest-Abfragen...\n');

const db = new GameDatabase();

// Test 1: Eine spezifische Quest holen
console.log('📜 Test 1: Quest "The Fargodeep Mine" (ID 62)');
const quest = db.getQuest(62);
if (quest) {
  console.log(`   Titel: ${quest.Title}`);
  console.log(`   Level: ${quest.QuestLevel} (Min: ${quest.MinLevel})`);
  console.log(`   Beschreibung: ${quest.QuestDescription?.substring(0, 100)}...`);
  console.log(`   Ziel: ${quest.Objectives?.substring(0, 100)}...`);
  console.log('');
}

// Test 2: Alle Quests für Level 1-5
console.log('📋 Test 2: Alle Quests für Level 1-5');
const lowLevelQuests = db.getQuestsByLevel(1, 5);
console.log(`   Gefunden: ${lowLevelQuests.length} Quests`);
lowLevelQuests.slice(0, 5).forEach(q => {
  console.log(`   - [${q.entry}] ${q.Title} (Level ${q.QuestLevel})`);
});
console.log('');

// Test 3: Wer gibt Quest 62?
console.log('💬 Test 3: Quest Giver für Quest 62');
const givers = db.getQuestGivers(62);
givers.forEach(g => {
  console.log(`   - ${g.Name} (NPC ${g.id})`);
  
  // Hole Position des NPCs
  const spawns = db.getCreatureSpawns(g.id);
  if (spawns.length > 0) {
    const s = spawns[0];
    console.log(`     Position: Map ${s.map}, (${s.position_x.toFixed(2)}, ${s.position_y.toFixed(2)}, ${s.position_z.toFixed(2)})`);
  }
});
console.log('');

// Test 4: Bei wem wird Quest 62 abgegeben?
console.log('✅ Test 4: Quest Ender für Quest 62');
const enders = db.getQuestEnders(62);
enders.forEach(e => {
  console.log(`   - ${e.Name} (NPC ${e.id})`);
});
console.log('');

// Test 5: Alle Quests von einem NPC
console.log('📝 Test 5: Alle Quests von "Marshal McBride" (NPC 823)');
const npcQuests = db.getQuestsFromNPC(823);
console.log(`   Gibt ${npcQuests.length} Quests:`);
npcQuests.forEach(qId => {
  const q = db.getQuest(qId);
  if (q) {
    console.log(`   - [${qId}] ${q.Title}`);
  }
});
console.log('');

// Test 6: Quest mit allen Details
console.log('🔎 Test 6: Volle Quest-Details für Quest 783 (A Threat Within)');
const fullQuest = db.getQuest(783);
if (fullQuest) {
  console.log(`   Titel: ${fullQuest.Title}`);
  console.log(`   Level: ${fullQuest.QuestLevel} (Min: ${fullQuest.MinLevel})`);
  console.log(`   Type: ${fullQuest.Type}`);
  console.log(`   Required Races: ${fullQuest.RequiredRaces}`);
  console.log(`   Required Classes: ${fullQuest.RequiredClasses}`);
  console.log(`   Rewards:`);
  console.log(`     - XP: ${fullQuest.RewXP}`);
  console.log(`     - Money: ${fullQuest.RewMoney} copper`);
  if (fullQuest.RewChoiceItemId1) {
    console.log(`     - Choice Item 1: ${fullQuest.RewChoiceItemId1} x${fullQuest.RewChoiceItemCount1}`);
  }
  if (fullQuest.RewItemId1) {
    console.log(`     - Item 1: ${fullQuest.RewItemId1} x${fullQuest.RewItemCount1}`);
  }
  
  // Hole Quest Giver
  const qGivers = db.getQuestGivers(783);
  if (qGivers.length > 0) {
    console.log(`   Quest Giver: ${qGivers[0].Name}`);
  }
  
  // Hole Quest Ender
  const qEnders = db.getQuestEnders(783);
  if (qEnders.length > 0) {
    console.log(`   Quest Ender: ${qEnders[0].Name}`);
  }
}

db.close();
console.log('\n✅ Tests abgeschlossen!');
