/**
 * Zone Manager - Verwaltet Zonen und bestimmt aktuelle Zone anhand Position
 */

import type { Position } from './MovementSystem';

export interface Zone {
  id: number;
  name: string;
  nameDE: string;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  level: string;
  faction: 'Alliance' | 'Horde' | 'Contested';
  parentZone?: string;
}

export interface POI {
  id: number;
  name: string;
  nameDE: string;
  type: 'inn' | 'class-trainer' | 'profession-trainer' | 'vendor' | 'quest-giver' | 'flight-master' | 'bank';
  zone: string;
  position: Position;
  npcId?: number;
  npcName?: string;
}

/**
 * Wichtige Zonen für Allianz Starter-Gebiete
 */
const ZONES: Zone[] = [
  {
    id: 9,
    name: 'Northshire Valley',
    nameDE: 'Nordhain',
    bounds: { minX: -8960, maxX: -8640, minY: -240, maxY: 0 },
    level: '1-5',
    faction: 'Alliance',
    parentZone: 'Elwynn Forest',
  },
  {
    id: 12,
    name: 'Elwynn Forest',
    nameDE: 'Wald von Elwynn',
    bounds: { minX: -9530, maxX: -8970, minY: -1440, maxY: 960 },
    level: '1-10',
    faction: 'Alliance',
  },
  {
    id: 1519,
    name: 'Stormwind City',
    nameDE: 'Sturmwind',
    bounds: { minX: -9100, maxX: -8300, minY: 300, maxY: 1200 },
    level: '1-80',
    faction: 'Alliance',
  },
  {
    id: 85,
    name: 'Goldshire',
    nameDE: 'Goldhain',
    bounds: { minX: -9530, maxX: -9400, minY: 0, maxY: 150 },
    level: '5-10',
    faction: 'Alliance',
    parentZone: 'Elwynn Forest',
  },
];

/**
 * Points of Interest (NPCs, Gebäude)
 */
const POIS: POI[] = [
  // Northshire Valley
  {
    id: 1,
    name: 'Northshire Abbey',
    nameDE: 'Abtei von Nordhain',
    type: 'inn',
    zone: 'Northshire Valley',
    position: { x: -8914.55, y: -135.43, z: 81.87, map: 0 },
  },
  {
    id: 2,
    name: 'Warrior Trainer',
    nameDE: 'Kriegerlehrer',
    type: 'class-trainer',
    zone: 'Northshire Valley',
    position: { x: -8918.78, y: -121.23, z: 82.13, map: 0 },
    npcId: 913,
    npcName: 'Llane Beshere',
  },
  
  // Goldshire
  {
    id: 10,
    name: 'Lion\'s Pride Inn',
    nameDE: 'Gasthaus zum Stolz des Löwen',
    type: 'inn',
    zone: 'Goldshire',
    position: { x: -9466.62, y: 45.83, z: 56.95, map: 0 },
  },
  {
    id: 11,
    name: 'Goldshire Warrior Trainer',
    nameDE: 'Kriegerlehrer (Goldhain)',
    type: 'class-trainer',
    zone: 'Goldshire',
    position: { x: -9461.02, y: 109.05, z: 56.96, map: 0 },
    npcId: 5113,
    npcName: 'Lyria Du Lac',
  },
  {
    id: 12,
    name: 'Mining Trainer',
    nameDE: 'Bergbaulehrer',
    type: 'profession-trainer',
    zone: 'Goldshire',
    position: { x: -9456.31, y: 87.31, z: 56.96, map: 0 },
  },
  {
    id: 13,
    name: 'Blacksmithing Trainer',
    nameDE: 'Schmiedelehrer',
    type: 'profession-trainer',
    zone: 'Goldshire',
    position: { x: -9456.31, y: 87.31, z: 56.96, map: 0 },
  },
  {
    id: 14,
    name: 'General Goods Vendor',
    nameDE: 'Händler',
    type: 'vendor',
    zone: 'Goldshire',
    position: { x: -9460.05, y: 30.12, z: 56.96, map: 0 },
  },
];

export class ZoneManager {
  /**
   * Bestimme aktuelle Zone anhand Position
   */
  getCurrentZone(position: Position): Zone | null {
    // Check subzones first (like Northshire, Goldshire)
    for (const zone of ZONES) {
      if (this.isInZone(position, zone)) {
        return zone;
      }
    }
    return null;
  }

  /**
   * Prüfe ob Position in Zone liegt
   */
  private isInZone(position: Position, zone: Zone): boolean {
    return (
      position.x >= zone.bounds.minX &&
      position.x <= zone.bounds.maxX &&
      position.y >= zone.bounds.minY &&
      position.y <= zone.bounds.maxY
    );
  }

  /**
   * Hole alle POIs in einer Zone
   */
  getPOIsInZone(zoneName: string): POI[] {
    return POIS.filter(poi => poi.zone === zoneName);
  }

  /**
   * Hole POIs nach Typ
   */
  getPOIsByType(zoneName: string, type: POI['type']): POI[] {
    return POIS.filter(poi => poi.zone === zoneName && poi.type === type);
  }

  /**
   * Finde nächstes POI eines Typs
   */
  findNearestPOI(position: Position, type: POI['type']): POI | null {
    const currentZone = this.getCurrentZone(position);
    if (!currentZone) return null;

    const poisInZone = this.getPOIsByType(currentZone.name, type);
    if (poisInZone.length === 0) return null;

    // Find nearest
    let nearest: POI | null = null;
    let minDistance = Infinity;

    for (const poi of poisInZone) {
      const distance = Math.sqrt(
        Math.pow(poi.position.x - position.x, 2) +
        Math.pow(poi.position.y - position.y, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = poi;
      }
    }

    return nearest;
  }

  /**
   * Hole alle verfügbaren Aktionen in aktueller Zone
   */
  getAvailableActions(position: Position): string[] {
    const zone = this.getCurrentZone(position);
    if (!zone) return [];

    const actions: string[] = [];
    const pois = this.getPOIsInZone(zone.name);

    // Check which POI types are available
    const availableTypes = new Set(pois.map(p => p.type));

    if (availableTypes.has('inn')) actions.push('Zum Gasthaus gehen');
    if (availableTypes.has('class-trainer')) actions.push('Zum Klassenlehrer gehen');
    if (availableTypes.has('profession-trainer')) actions.push('Zum Berufslehrer gehen');
    if (availableTypes.has('vendor')) actions.push('Zum Händler gehen');
    if (availableTypes.has('flight-master')) actions.push('Zum Flugmeister gehen');
    if (availableTypes.has('bank')) actions.push('Zur Bank gehen');

    // Always available
    actions.push('Mobs in der Nähe farmen');
    actions.push('Quest annehmen/abgeben');

    return actions;
  }

  /**
   * Hole Zone Info als Text
   */
  getZoneInfo(position: Position): string {
    const zone = this.getCurrentZone(position);
    if (!zone) return 'Unbekannte Zone';

    return `${zone.nameDE} (${zone.level}) - ${zone.faction}`;
  }

  /**
   * Alle Zonen
   */
  getAllZones(): Zone[] {
    return ZONES;
  }

  /**
   * Alle POIs
   */
  getAllPOIs(): POI[] {
    return POIS;
  }
}

/**
 * Singleton Instance
 */
let zoneManagerInstance: ZoneManager | null = null;

export function getZoneManager(): ZoneManager {
  if (!zoneManagerInstance) {
    zoneManagerInstance = new ZoneManager();
  }
  return zoneManagerInstance;
}
