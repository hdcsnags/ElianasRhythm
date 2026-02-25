import { useState, useEffect, useCallback } from 'react'
import type { Profile, ProfileUpdate } from '../lib/types'
import { getProfile, updateProfile } from '../services/sessions'
import { useAuth } from './useAuth'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await getProfile(user.id)
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const update = useCallback(async (updates: ProfileUpdate) => {
    if (!user) return
    try {
      const updated = await updateProfile(user.id, updates)
      setProfile(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      throw err
    }
  }, [user])

  return { profile, loading, error, update, refetch: fetchProfile }
}
