import { useState, useEffect } from 'react'
import { Platform, PermissionsAndroid } from 'react-native'
import * as Location from 'expo-location'

export interface Beacon {
  uuid: string
  major: number
  minor: number
  proximity: 'immediate' | 'near' | 'far' | 'unknown'
  accuracy: number
  rssi: number
  locationId?: string
  locationType?: string
  locationName?: string
}

export interface UseBeaconsReturn {
  beacons: Beacon[]
  nearestBeacon: Beacon | null
  isScanning: boolean
  error: string | null
  startScanning: () => Promise<void>
  stopScanning: () => void
  hasPermission: boolean
  requestPermission: () => Promise<boolean>
}

// Mock beacon data for development
// In production, this would use react-native-ble-plx or similar BLE library
const mockBeacons: Beacon[] = [
  {
    uuid: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0',
    major: 1,
    minor: 1,
    proximity: 'near',
    accuracy: 2.5,
    rssi: -65,
    locationId: '1',
    locationType: 'room',
    locationName: 'Grand Ballroom A',
  },
  {
    uuid: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0',
    major: 1,
    minor: 2,
    proximity: 'far',
    accuracy: 8.3,
    rssi: -85,
    locationId: '3',
    locationType: 'booth',
    locationName: 'Sponsor Booth - TechCorp',
  },
]

export function useBeacons(): UseBeaconsReturn {
  const [beacons, setBeacons] = useState<Beacon[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState(false)
  const [scanInterval, setScanInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    checkPermissions()
    return () => {
      stopScanning()
    }
  }, [])

  const checkPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        // Android requires both location and Bluetooth permissions
        const locationStatus = await Location.getForegroundPermissionsAsync()
        const bluetoothGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
        )

        setHasPermission(
          locationStatus.status === 'granted' && bluetoothGranted
        )
      } else {
        // iOS uses location permission for BLE beacon scanning
        const { status } = await Location.getForegroundPermissionsAsync()
        setHasPermission(status === 'granted')
      }
    } catch (err) {
      console.error('Error checking beacon permissions:', err)
      setHasPermission(false)
    }
  }

  const requestPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        // Request location permission
        const locationStatus = await Location.requestForegroundPermissionsAsync()

        // Request Bluetooth permissions (Android 12+)
        let bluetoothGranted = true
        if (Platform.Version >= 31) {
          const result = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          ])
          bluetoothGranted =
            result['android.permission.BLUETOOTH_SCAN'] === 'granted' &&
            result['android.permission.BLUETOOTH_CONNECT'] === 'granted'
        }

        const granted = locationStatus.status === 'granted' && bluetoothGranted
        setHasPermission(granted)
        return granted
      } else {
        // iOS
        const { status } = await Location.requestForegroundPermissionsAsync()
        const granted = status === 'granted'
        setHasPermission(granted)
        return granted
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permissions'
      setError(errorMessage)
      return false
    }
  }

  const startScanning = async () => {
    if (!hasPermission) {
      const granted = await requestPermission()
      if (!granted) {
        setError('Bluetooth and location permissions required for beacon detection')
        return
      }
    }

    if (isScanning) {
      console.log('Already scanning for beacons')
      return
    }

    setIsScanning(true)
    setError(null)

    // In production, initialize BLE manager and start ranging beacons
    // For now, simulate beacon detection with mock data
    const interval = setInterval(() => {
      // Simulate beacon signal strength changes
      const updatedBeacons = mockBeacons.map((beacon) => {
        // Randomly vary RSSI to simulate movement
        const rssiVariation = Math.floor(Math.random() * 10) - 5
        const newRssi = beacon.rssi + rssiVariation

        // Update proximity based on RSSI
        let proximity: Beacon['proximity'] = 'unknown'
        let accuracy = 0

        if (newRssi > -60) {
          proximity = 'immediate'
          accuracy = Math.random() * 1
        } else if (newRssi > -75) {
          proximity = 'near'
          accuracy = 1 + Math.random() * 2
        } else if (newRssi > -90) {
          proximity = 'far'
          accuracy = 3 + Math.random() * 7
        }

        return {
          ...beacon,
          rssi: newRssi,
          proximity,
          accuracy,
        }
      })

      setBeacons(updatedBeacons)
    }, 2000) // Update every 2 seconds

    setScanInterval(interval)
  }

  const stopScanning = () => {
    if (scanInterval) {
      clearInterval(scanInterval)
      setScanInterval(null)
    }
    setIsScanning(false)
    setBeacons([])
  }

  // Find nearest beacon
  const nearestBeacon = beacons.length > 0
    ? beacons.reduce((nearest, current) =>
        current.accuracy < nearest.accuracy ? current : nearest
      )
    : null

  return {
    beacons,
    nearestBeacon,
    isScanning,
    error,
    startScanning,
    stopScanning,
    hasPermission,
    requestPermission,
  }
}

// Helper function to get proximity description
export function getProximityDescription(proximity: Beacon['proximity']): string {
  switch (proximity) {
    case 'immediate':
      return 'Very close (< 1m)'
    case 'near':
      return 'Nearby (1-3m)'
    case 'far':
      return 'Far (3-10m)'
    default:
      return 'Unknown distance'
  }
}

// Helper function to get location from beacon
export function getBeaconLocation(beacon: Beacon): string {
  if (beacon.locationName) {
    return beacon.locationName
  }
  return `Beacon ${beacon.major}.${beacon.minor}`
}
