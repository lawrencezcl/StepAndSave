import geohash from 'geohash';
import { getDistance, isPointWithinRadius } from 'geolib';
import { z } from 'zod';

// Location validation schema
const LocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  timestamp: z.number().optional(),
});

const GeofenceSchema = z.object({
  center: LocationSchema,
  radius: z.number().min(1).max(10000), // 1m to 10km
  geohash: z.string().min(3).max(12),
  name: z.string().optional(),
  merchantId: z.string().optional(),
});

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface Geofence {
  center: Location;
  radius: number;
  geohash: string;
  name?: string;
  merchantId?: string;
}

export interface GeofenceValidationResult {
  isValid: boolean;
  distance?: number;
  geohash: string;
  message: string;
}

export class GeofencingService {
  private geofences: Map<string, Geofence> = new Map();
  private isInitialized = false;

  async initialize(): Promise<void> {
    try {
      // Load default geofences for major areas
      await this.loadDefaultGeofences();
      
      this.isInitialized = true;
      console.log('✅ GeofencingService initialized successfully');
      console.log(`📍 Loaded ${this.geofences.size} geofences`);
      
    } catch (error) {
      console.error('❌ Failed to initialize GeofencingService:', error);
      throw error;
    }
  }

  private async loadDefaultGeofences(): Promise<void> {
    // Default geofences for major areas in Seoul (Gangnam focus)
    const defaultGeofences = [
      {
        center: { latitude: 37.5172, longitude: 127.0473 }, // Gangnam Station
        radius: 500,
        geohash: 'wydm6',
        name: 'Gangnam Station Area',
        merchantId: 'default',
      },
      {
        center: { latitude: 37.5048, longitude: 127.0491 }, // Sinnonhyeon
        radius: 300,
        geohash: 'wydm3',
        name: 'Sinnonhyeon Area',
        merchantId: 'default',
      },
      {
        center: { latitude: 37.5087, longitude: 127.0632 }, // Samsung Station
        radius: 400,
        geohash: 'wydmh',
        name: 'Samsung Station Area',
        merchantId: 'default',
      },
      {
        center: { latitude: 37.5220, longitude: 127.0532 }, // Apgujeong
        radius: 600,
        geohash: 'wydmk',
        name: 'Apgujeong Area',
        merchantId: 'default',
      },
      {
        center: { latitude: 37.5140, longitude: 127.0595 }, // Cheongdam
        radius: 450,
        geohash: 'wydmf',
        name: 'Cheongdam Area',
        merchantId: 'default',
      },
    ];

    for (const fence of defaultGeofences) {
      this.addGeofence(fence);
    }
  }

  addGeofence(geofence: Geofence): void {
    try {
      const validatedFence = GeofenceSchema.parse(geofence);
      this.geofences.set(validatedFence.geohash, validatedFence);
      console.log(`📍 Added geofence: ${validatedFence.name || validatedFence.geohash}`);
    } catch (error) {
      console.error('Failed to add geofence:', error);
      throw error;
    }
  }

  removeGeofence(geohashId: string): boolean {
    return this.geofences.delete(geohashId);
  }

  validateLocation(location: Location, targetGeohash: string): GeofenceValidationResult {
    if (!this.isInitialized) {
      throw new Error('GeofencingService not initialized');
    }

    try {
      const validatedLocation = LocationSchema.parse(location);
      const locationGeohash = this.encodeLocation(validatedLocation);

      // Check if the location is within the target geohash area
      const geofence = this.geofences.get(targetGeohash);
      
      if (!geofence) {
        // If no specific geofence exists, check if geohashes match at appropriate precision
        const isWithinArea = this.checkGeohashProximity(locationGeohash, targetGeohash);
        
        return {
          isValid: isWithinArea,
          geohash: locationGeohash,
          message: isWithinArea 
            ? 'Location is within the target area' 
            : 'Location is outside the target area',
        };
      }

      // Calculate distance to geofence center
      const distance = getDistance(
        { lat: validatedLocation.latitude, lon: validatedLocation.longitude },
        { lat: geofence.center.latitude, lon: geofence.center.longitude }
      );

      const isWithinRadius = distance <= geofence.radius;

      return {
        isValid: isWithinRadius,
        distance,
        geohash: locationGeohash,
        message: isWithinRadius
          ? `Location is within ${geofence.name || 'target area'} (${distance}m from center)`
          : `Location is ${distance}m away from ${geofence.name || 'target area'} (max: ${geofence.radius}m)`,
      };

    } catch (error) {
      console.error('Location validation failed:', error);
      return {
        isValid: false,
        geohash: '',
        message: 'Invalid location data',
      };
    }
  }

  encodeLocation(location: Location, precision: number = 6): string {
    return geohash.encode(location.latitude, location.longitude, precision);
  }

  decodeGeohash(hash: string): { latitude: number; longitude: number; error: { latitude: number; longitude: number } } {
    return geohash.decode(hash);
  }

  private checkGeohashProximity(locationHash: string, targetHash: string): boolean {
    // Check if geohashes match at different precision levels
    const minPrecision = Math.min(locationHash.length, targetHash.length, 3);
    
    for (let i = minPrecision; i <= Math.max(locationHash.length, targetHash.length); i++) {
      const locPrefix = locationHash.substring(0, i);
      const targetPrefix = targetHash.substring(0, i);
      
      if (locPrefix === targetPrefix) {
        return true;
      }
    }
    
    return false;
  }

  findNearbyGeofences(location: Location, maxDistance: number = 1000): Geofence[] {
    if (!this.isInitialized) {
      throw new Error('GeofencingService not initialized');
    }

    const nearbyFences: Geofence[] = [];

    for (const geofence of this.geofences.values()) {
      const distance = getDistance(
        { lat: location.latitude, lon: location.longitude },
        { lat: geofence.center.latitude, lon: geofence.center.longitude }
      );

      if (distance <= maxDistance) {
        nearbyFences.push(geofence);
      }
    }

    // Sort by distance
    return nearbyFences.sort((a, b) => {
      const distanceA = getDistance(
        { lat: location.latitude, lon: location.longitude },
        { lat: a.center.latitude, lon: a.center.longitude }
      );
      const distanceB = getDistance(
        { lat: location.latitude, lon: location.longitude },
        { lat: b.center.latitude, lon: b.center.longitude }
      );
      return distanceA - distanceB;
    });
  }

  getGeofencesByMerchant(merchantId: string): Geofence[] {
    const merchantFences: Geofence[] = [];
    
    for (const geofence of this.geofences.values()) {
      if (geofence.merchantId === merchantId) {
        merchantFences.push(geofence);
      }
    }
    
    return merchantFences;
  }

  createMerchantGeofence(
    merchantId: string,
    center: Location,
    radius: number,
    name?: string
  ): string {
    const geohashId = this.encodeLocation(center, 7);
    
    const geofence: Geofence = {
      center,
      radius,
      geohash: geohashId,
      name: name || `${merchantId} - ${geohashId}`,
      merchantId,
    };

    this.addGeofence(geofence);
    return geohashId;
  }

  getGeofenceInfo(geohashId: string): Geofence | undefined {
    return this.geofences.get(geohashId);
  }

  getAllGeofences(): Geofence[] {
    return Array.from(this.geofences.values());
  }

  calculateGeohashNeighbors(hash: string): string[] {
    try {
      return geohash.neighbors(hash);
    } catch (error) {
      console.error('Failed to calculate geohash neighbors:', error);
      return [];
    }
  }

  isLocationWithinBounds(location: Location, bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }): boolean {
    return (
      location.latitude >= bounds.south &&
      location.latitude <= bounds.north &&
      location.longitude >= bounds.west &&
      location.longitude <= bounds.east
    );
  }

  getGeofenceStats(): {
    totalGeofences: number;
    merchantGeofences: number;
    defaultGeofences: number;
    averageRadius: number;
  } {
    const total = this.geofences.size;
    let merchantCount = 0;
    let totalRadius = 0;

    for (const geofence of this.geofences.values()) {
      if (geofence.merchantId && geofence.merchantId !== 'default') {
        merchantCount++;
      }
      totalRadius += geofence.radius;
    }

    return {
      totalGeofences: total,
      merchantGeofences: merchantCount,
      defaultGeofences: total - merchantCount,
      averageRadius: total > 0 ? Math.round(totalRadius / total) : 0,
    };
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}