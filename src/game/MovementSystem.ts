/**
 * Movement System - Berechnet Bewegungen und Reisezeiten
 */

export interface Position {
  x: number;
  y: number;
  z?: number;
  map?: number;
}

export interface TravelInfo {
  distance: number;
  travelTimeSeconds: number;
  speedYardsPerSec: number;
  fromCoords: Position;
  toCoords: Position;
}

/**
 * WoW Classic Bewegungsgeschwindigkeiten (in yards/sec)
 */
export const MOVEMENT_SPEEDS = {
  WALK: 2.5,           // Normal walking
  RUN: 7.0,            // Running (default)
  MOUNT_60: 14.0,      // 60% mount
  MOUNT_100: 21.0,     // 100% mount (Epic)
  SWIM: 4.72,          // Swimming
  FLIGHT: 32.5,        // Flight path
} as const;

/**
 * Berechne Distanz zwischen zwei Punkten (2D)
 */
export function calculateDistance(from: Position, to: Position): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Berechne Distanz zwischen zwei Punkten (3D)
 */
export function calculateDistance3D(from: Position, to: Position): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = (to.z || 0) - (from.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Berechne Reisezeit basierend auf Distanz und Geschwindigkeit
 */
export function calculateTravelTime(
  from: Position,
  to: Position,
  speedYardsPerSec: number = MOVEMENT_SPEEDS.RUN
): TravelInfo {
  const distance = calculateDistance(from, to);
  const travelTimeSeconds = distance / speedYardsPerSec;

  return {
    distance,
    travelTimeSeconds,
    speedYardsPerSec,
    fromCoords: from,
    toCoords: to,
  };
}

/**
 * Formatiere Reisezeit in lesbarer Form
 */
export function formatTravelTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Berechne Position nach X Sekunden Bewegung
 */
export function calculatePositionAtTime(
  from: Position,
  to: Position,
  elapsedSeconds: number,
  speedYardsPerSec: number = MOVEMENT_SPEEDS.RUN
): Position {
  const totalDistance = calculateDistance(from, to);
  const totalTime = totalDistance / speedYardsPerSec;
  
  // Clamp auf 0-1
  const progress = Math.min(1, Math.max(0, elapsedSeconds / totalTime));
  
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
    z: from.z !== undefined && to.z !== undefined 
      ? from.z + (to.z - from.z) * progress 
      : undefined,
    map: from.map,
  };
}

/**
 * Travel Simulation für Echtzeit-Bewegung
 */
export class TravelSimulation {
  private startTime: number;
  private from: Position;
  private to: Position;
  private speed: number;
  private travelInfo: TravelInfo;
  private completed: boolean = false;

  constructor(from: Position, to: Position, speed: number = MOVEMENT_SPEEDS.RUN) {
    this.startTime = Date.now();
    this.from = from;
    this.to = to;
    this.speed = speed;
    this.travelInfo = calculateTravelTime(from, to, speed);
  }

  /**
   * Hole aktuelle Position
   */
  getCurrentPosition(): Position {
    const elapsed = (Date.now() - this.startTime) / 1000;
    return calculatePositionAtTime(this.from, this.to, elapsed, this.speed);
  }

  /**
   * Ist die Reise abgeschlossen?
   */
  isCompleted(): boolean {
    if (this.completed) return true;
    
    const elapsed = (Date.now() - this.startTime) / 1000;
    this.completed = elapsed >= this.travelInfo.travelTimeSeconds;
    return this.completed;
  }

  /**
   * Hole Fortschritt (0-1)
   */
  getProgress(): number {
    const elapsed = (Date.now() - this.startTime) / 1000;
    return Math.min(1, elapsed / this.travelInfo.travelTimeSeconds);
  }

  /**
   * Verbleibende Zeit
   */
  getRemainingTime(): number {
    const elapsed = (Date.now() - this.startTime) / 1000;
    return Math.max(0, this.travelInfo.travelTimeSeconds - elapsed);
  }

  /**
   * Travel Info
   */
  getTravelInfo(): TravelInfo {
    return this.travelInfo;
  }
}
