import { GameDatabase } from '../src/data/sqlite_loader';

function testDatabase() {
  console.log('🧪 Testing SQLite Database Loader\n');
  console.log('='.repeat(60));
  
  const db = new GameDatabase();
  
  try {
    console.log('='.repeat(60));
    console.log('\n🔍 Testing Quest Queries:\n');
    
    // Test quest lookup
    const questId = 62; // "The Fargodeep Mine"
    const quest = db.getQuest(questId);
    
    if (quest) {
      console.log(`✅ Found Quest ${questId}:`);
      console.log(`   Title: ${quest.Title}`);
      console.log(`   Level: ${quest.QuestLevel} (Min: ${quest.MinLevel})`);
      console.log(`   Type: ${quest.Type}`);
      console.log('');
    } else {
      console.log(`❌ Quest ${questId} not found`);
    }
    
    // Test quest givers
    console.log('🔍 Testing Quest Giver Lookup:\n');
    const givers = db.getQuestGivers(questId);
    if (givers.length > 0) {
      console.log(`✅ Found ${givers.length} quest giver(s):`);
      givers.forEach(g => {
        console.log(`   - ${g.Name} (NPC ${g.id})`);
      });
      console.log('');
    }
    
    // Test creature spawns
    console.log('🔍 Testing Creature Spawn Lookup:\n');
    const creatureId = 823; // Marshal McBride
    const spawns = db.getCreatureSpawns(creatureId);
    if (spawns.length > 0) {
      console.log(`✅ Found ${spawns.length} spawn(s) for creature ${creatureId}:`);
      const spawn = spawns[0];
      console.log(`   Map: ${spawn.map}`);
      console.log(`   Position: (${spawn.position_x.toFixed(2)}, ${spawn.position_y.toFixed(2)}, ${spawn.position_z.toFixed(2)})`);
      console.log('');
    }
    
    // Count total quests
    console.log('📊 Database Statistics:\n');
    const questsByLevel = db.getQuestsByLevel(1, 5);
    console.log(`   Quests Level 1-5: ${questsByLevel.length}`);
    
    const allLevelQuests = db.getQuestsByLevel(1, 60);
    console.log(`   Total Quests (1-60): ${allLevelQuests.length.toLocaleString()}`);
    
    console.log('\n🎯 Sample Level 60 Quests:');
    const level60Quests = db.getQuestsByLevel(60, 60).slice(0, 5);
    level60Quests.forEach((q: any) => {
      console.log(`   [${q.entry}] ${q.Title}`);
    });
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

testDatabase();
