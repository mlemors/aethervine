# Quest Item Flow Documentation

## Overview
Complete implementation of quest item collection, tracking, and turn-in validation in Aethervine.

## System Architecture

### Components
1. **QuestExecutor** - Manages quest objectives and progress
2. **LootSystem** - Generates quest-aware loot from mobs
3. **InventorySystem** - Stores and manages quest items
4. **GameEngine** - Orchestrates the complete flow

---

## Flow Stages

### 1. Quest Acceptance
```typescript
QuestExecutor.acceptQuest(questId)
```

**What Happens:**
- Loads quest data from database (quest_template)
- Creates collection objectives for all ReqItemId1-6 fields
- Initializes objective tracking: `{ type: 'collect', itemId, required, current: 0 }`

**Example:** Quest 11 - Riverpaw Gnoll Bounty
```
Objective: Collect 8x Painted Gnoll Armband (item 782)
Initial State: current=0, required=8, completed=false
```

---

### 2. Quest-Aware Loot Generation
```typescript
LootSystem.generateMobLoot(creatureId, playerLevel, activeQuestIds)
```

**What Happens:**
- Checks creature_loot_template for the killed mob
- For each loot entry with negative ChanceOrQuestChance:
  - Validates item is needed via `playerNeedsQuestItem(itemId, activeQuestIds)`
  - Checks all 6 ReqItemId slots in each active quest
  - Only generates drop if player has the quest active
- Regular loot (positive chance) always drops normally

**Database Structure:**
```sql
-- Quest items have negative chance
entry=97 (Riverpaw Runt), item=782 (Painted Gnoll Armband)
ChanceOrQuestChance = -40.0  -- 40% drop rate, ONLY when quest active
```

**Drop Rates:**
- Unique quest items (like Garrick's Head): -100.0 = 100% guaranteed
- Collection items (like Painted Gnoll Armband): -40.0 = 40% drop rate
- Without active quest: 0% drop rate (filtered out)

---

### 3. Item Collection & Progress Tracking
```typescript
// GameEngine.updateLooting()
inventorySystem.addItem(inventory, item, count)
executor.updateCollectionProgress(itemCounts)
```

**What Happens:**
1. Quest items added to inventory bags
2. InventorySystem.getItemCounts() creates Map of all item quantities
3. QuestExecutor.updateCollectionProgress() syncs objectives with inventory
4. For each collection objective:
   - `current = min(inventoryCount, required)`
   - `completed = current >= required`
5. If all objectives completed → `quest.status = 'completed'`

**Example Progress:**
```
Kill 3: Armband drops → Inventory: 1, Objective: 1/8
Kill 4: Armband drops → Inventory: 2, Objective: 2/8
...
Kill 23: Armband drops → Inventory: 8, Objective: 8/8 ✅ COMPLETED
```

---

### 4. Quest Completion Validation
```typescript
QuestExecutor.isQuestComplete()
```

**What Happens:**
- Returns true if `quest.status === 'completed'`
- Status set when all objectives (kill + collect) are completed
- GameEngine checks this before allowing turn-in travel

**Validation:**
- Collection objectives automatically validated via inventory sync
- No additional checks needed at turn-in time

---

### 5. Quest Turn-In & Item Removal
```typescript
// GameEngine.updateQuestTurnIn()
executor.turnInQuest(questId)
inventorySystem.removeItem(inventory, itemId, count)
```

**What Happens:**
1. Quest marked as 'turned-in'
2. **Quest items removed first** (before rewards)
3. For each ReqItemId1-6 in quest:
   - Remove exact count from inventory
   - Log removal with ↪️ emoji
4. Award quest rewards (XP, gold, items)

**Example Turn-In:**
```
✓ Quest completed: Riverpaw Gnoll Bounty
  ↪️ Turned in: Painted Gnoll Armband x8
  🌟 +340 XP (Quest: Riverpaw Gnoll Bounty)
  🎁 Received: Canvas Cloak x1
```

---

## Database Schema

### quest_template
```sql
ReqItemId1, ReqItemId2, ..., ReqItemId6      -- Item IDs to collect
ReqItemCount1, ReqItemCount2, ..., ReqItemCount6  -- Quantities required
```

### creature_loot_template
```sql
entry          -- Creature ID
item           -- Item ID
ChanceOrQuestChance  -- Negative = quest item, value = drop %
```

### Example Data
```sql
-- Quest 11: Riverpaw Gnoll Bounty
ReqItemId1 = 782 (Painted Gnoll Armband)
ReqItemCount1 = 8

-- Loot Table
entry = 97 (Riverpaw Runt)
item = 782
ChanceOrQuestChance = -40.0  -- 40% when quest active
```

---

## Code Flow Diagram

```
[Quest Accept]
    ↓
QuestExecutor creates collection objectives
    ↓
[Kill Mob]
    ↓
LootSystem.generateMobLoot(activeQuestIds)
    ↓
Check: playerNeedsQuestItem() → Quest active?
    ↓ YES
Quest item drops (40% chance)
    ↓ NO
Quest item skipped (0% chance)
    ↓
[Add to Inventory]
    ↓
InventorySystem.addItem()
    ↓
QuestExecutor.updateCollectionProgress(itemCounts)
    ↓
Sync: objective.current = inventory count
    ↓
Check: current >= required?
    ↓ YES
quest.status = 'completed'
    ↓
[Turn In Quest]
    ↓
Remove quest items from inventory
    ↓
Award XP + Gold + Item Rewards
    ↓
[Quest Complete]
```

---

## Testing

### Test Coverage
All tests in `tests/test_quest_turnin.ts`:

1. **Quest Item Drops** ✅
   - Items only drop when quest active
   - Drop rates match database values (40%)

2. **Collection Progress** ✅
   - Objectives update when items looted
   - Current count matches inventory count

3. **Quest Completion** ✅
   - Status changes to 'completed' when items collected
   - All objectives validated

4. **Item Removal** ✅
   - Quest items removed on turn-in
   - Inventory count drops to 0

### Test Results
```
Kill 23 Riverpaw Runts → 8 armbands collected (35% actual rate)
Quest Status: completed ✅
Inventory after turn-in: 0 armbands ✅
```

---

## Key Features

### Quest Awareness
- Loot system knows about active quests
- Quest items **only drop when quest is active**
- Prevents farming quest items before accepting quest

### Automatic Tracking
- Collection objectives sync with inventory automatically
- No manual "collect" action needed
- Progress updates in real-time as items are looted

### Inventory Integration
- Quest items stored in bags like normal items
- Stackable (8 armbands = 1 bag slot)
- Automatically removed on turn-in

### Authentic WoW Behavior
- Drop rates from WoW Classic 1.12.1 database
- Quest item logic matches original game
- Negative ChanceOrQuestChance system preserved

---

## Implementation Files

### Core Systems
- `src/game/QuestExecutor.ts` - Quest objective management
- `src/game/LootSystem.ts` - Quest-aware loot generation
- `src/game/InventorySystem.ts` - Item storage and tracking
- `src/game/GameEngine.ts` - Flow orchestration

### Tests
- `tests/test_quest_items.ts` - Quest item drop validation
- `tests/test_quest_turnin.ts` - Complete turn-in flow

### Commits
- `703a5ef` - Quest-aware loot system
- `fdf78c3` - Quest turn-in validation and item removal

---

## Future Enhancements

### Potential Improvements
1. **Quest Log UI** - Show collection progress visually
2. **Item Tooltips** - Mark quest items in inventory
3. **Auto-Turn-In** - Detect quest completion and auto-travel
4. **Multiple Quests** - Track collection for multiple active quests
5. **Quest Item Deletion** - Prevent accidental deletion of needed items

### Edge Cases to Handle
- Abandoning quest with collected items (should remove items)
- Inventory full when quest item drops (should still drop)
- Quest chains with shared items (already supported)
- Quest items that are also vendor items (needs special handling)
