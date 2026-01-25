import { useState, useEffect } from 'react'
import * as Location from 'expo-location'

export interface LocationCoords {
  latitude: number
  longitude: number
  accuracy: number | null
}

export interface UseLocationReturn {
  location: LocationCoords | null
  error: string | null
  isLoading: boolean
  requestPermission: () => Promise<boolean>
  hasPermission: boolean
  startWatching: () => void
  stopWatching: () => void
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationCoords | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [watchSubscription, setWatchSubscription] = useState<Location.LocationSubscription | null>(null)

  // Check permission on mount
  useEffect(() => {
    checkPermission()
  }, [])

  const checkPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync()
      setHasPermission(status === 'granted')
    } catch (err) {
      console.error('Error checking location permission:', err)
    }
  }

  const requestPermission = async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      const { status } = await Location.requestForegroundPermissionsAsync()
      const granted = status === 'granted'
      setHasPermission(granted)

      if (granted) {
        // Get initial location
        await getCurrentLocation()
      } else {
        setError('Location permission denied')
      }

      return granted
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request location permission'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      setLocation({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
        accuracy: locationData.coords.accuracy,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location'
      setError(errorMessage)
      console.error('Location error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const startWatching = async () => {
    if (!hasPermission) {
      const granted = await requestPermission()
      if (!granted) return
    }

    if (watchSubscription) {
      console.log('Already watching location')
      return
    }

    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (locationData) => {
          setLocation({
            latitude: locationData.coords.latitude,
            longitude: locationData.coords.longitude,
            accuracy: locationData.coords.accuracy,
          })
        }
      )

      setWatchSubscription(subscription)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to watch location'
      setError(errorMessage)
      console.error('Location watching error:', err)
    }
  }

  const stopWatching = () => {
    if (watchSubscription) {
      watchSubscription.remove()
      setWatchSubscription(null)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatching()
    }
  }, [])

  return {
    location,
    error,
    isLoading,
    requestPermission,
    hasPermission,
    startWatching,
    stopWatching,
  }
}

// Utility function to calculate distance between two coordinates
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

// Format distance for display
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}
