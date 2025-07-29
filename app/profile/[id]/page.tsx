
"use client"

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, BookOpen, GraduationCap, Link as LinkIcon } from 'lucide-react'
import { useRealtimeTable } from '@/hooks/useRealtimeTable'
import { createClient } from '@/utils/supabase/client'
import { professorLoading } from '@/components/ui/professor-loading'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  user_type: string
  department: string | null
  research_area: string | null
  bio: string | null
  lattes_url: string | null
  student_id: string | null
  avatar_url: string | null
  is_profile_complete: boolean
  has_completed_onboarding: boolean
  created_at: string
  updated_at: string
}

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { id } = params
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // Use useRealtimeTable to get real-time updates for user_profiles
  const [allProfiles] = useRealtimeTable<UserProfile>('user_profiles', [])

  useEffect(() => {
    if (allProfiles.length > 0) {
      const foundProfile = allProfiles.find((p) => p.id === id)
      if (foundProfile) {
        setProfile(foundProfile)
        setIsLoading(false)
      } else {
        setIsError(true) // Profile not found in real-time data
        setIsLoading(false)
      }
    } else if (!isLoading && !profile) {
      // If no real-time data yet, try to fetch once
      const fetchInitialProfile = async () => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', id)
          .single()

        if (error || !data) {
          setIsError(true)
        } else {
          setProfile(data)
        }
        setIsLoading(false)
      }
      fetchInitialProfile()
    }
  }, [allProfiles, id, isLoading, profile])

  if (isLoading) {
    return professorLoading()
  }

  if (isError || !profile) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="flex flex-col items-center text-center pt-8 pb-4">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || profile.email} />
            <AvatarFallback className="text-4xl">
              {profile.full_name?.charAt(0) || profile.email.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold">{profile.full_name || 'Usuário'}</CardTitle>
          <p className="text-muted-foreground">{profile.user_type}</p>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-5 h-5" />
              <span>{profile.email}</span>
            </div>
            {profile.department && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <GraduationCap className="w-5 h-5" />
                <span>{profile.department}</span>
              </div>
            )}
            {profile.research_area && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="w-5 h-5" />
                <span>{profile.research_area}</span>
              </div>
            )}
            {profile.lattes_url && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <LinkIcon className="w-5 h-5" />
                <a href={profile.lattes_url} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                  Currículo Lattes
                </a>
              </div>
            )}
          </div>

          {profile.bio && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Sobre Mim</h3>
              <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
