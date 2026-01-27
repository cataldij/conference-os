import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Linkedin, Twitter, Globe, Calendar } from 'lucide-react'

async function getSpeakersData(slug: string) {
  const supabase = await createClient()

  const { data: conference } = await supabase
    .from('conferences')
    .select('id, name')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  if (!conference) return null

  // Get speaker profiles with their sessions
  const { data: speakerProfiles } = await supabase
    .from('speaker_profiles')
    .select(`
      user:profiles(
        id,
        full_name,
        avatar_url,
        linkedin_url,
        twitter_url,
        website_url
      ),
      company,
      title,
      bio,
      topics,
      headshot_url,
      is_featured
    `)
    .eq('conference_id', conference.id)
    .order('is_featured', { ascending: false })

  // Get session counts for each speaker
  const speakerIds = speakerProfiles?.map((sp) => sp.user?.id).filter(Boolean) || []

  const { data: sessionCounts } = await supabase
    .from('session_speakers')
    .select('speaker_id, session:sessions(id)')
    .in('speaker_id', speakerIds)

  // Count sessions per speaker
  const sessionsPerSpeaker = (sessionCounts || []).reduce(
    (acc, item) => {
      if (item.speaker_id) {
        acc[item.speaker_id] = (acc[item.speaker_id] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>
  )

  return {
    conference,
    speakers:
      speakerProfiles?.map((sp) => ({
        ...sp,
        sessionCount: sessionsPerSpeaker[sp.user?.id || ''] || 0,
      })) || [],
  }
}

export default async function PublicSpeakersPage({
  params,
}: {
  params: { slug: string }
}) {
  const data = await getSpeakersData(params.slug)

  if (!data) {
    notFound()
  }

  const { speakers } = data
  const featuredSpeakers = speakers.filter((s) => s.is_featured)
  const otherSpeakers = speakers.filter((s) => !s.is_featured)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Speakers</h2>
        <p className="text-muted-foreground">
          Meet the experts presenting at this conference
        </p>
      </div>

      {speakers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Speaker lineup coming soon!
        </div>
      ) : (
        <>
          {/* Featured Speakers */}
          {featuredSpeakers.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-4">Featured Speakers</h3>
              <div className="grid gap-6 md:grid-cols-2">
                {featuredSpeakers.map((speaker) => (
                  <Card key={speaker.user?.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
                          {(speaker.headshot_url || speaker.user?.avatar_url) ? (
                            <Image
                              src={speaker.headshot_url || speaker.user?.avatar_url || ''}
                              alt={speaker.user?.full_name || 'Speaker'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-muted-foreground">
                              {speaker.user?.full_name?.charAt(0) || 'S'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-lg">
                                {speaker.user?.full_name}
                              </h4>
                              {speaker.title && (
                                <p className="text-sm text-muted-foreground">
                                  {speaker.title}
                                </p>
                              )}
                              {speaker.company && (
                                <p className="text-sm text-muted-foreground">
                                  {speaker.company}
                                </p>
                              )}
                            </div>
                            <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                              Featured
                            </span>
                          </div>

                          {speaker.bio && (
                            <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                              {speaker.bio}
                            </p>
                          )}

                          <div className="mt-3 flex items-center gap-4">
                            {speaker.sessionCount > 0 && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {speaker.sessionCount} session
                                  {speaker.sessionCount !== 1 ? 's' : ''}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              {speaker.user?.linkedin_url && (
                                <a
                                  href={speaker.user.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <Linkedin className="h-4 w-4" />
                                </a>
                              )}
                              {speaker.user?.twitter_url && (
                                <a
                                  href={speaker.user.twitter_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <Twitter className="h-4 w-4" />
                                </a>
                              )}
                              {speaker.user?.website_url && (
                                <a
                                  href={speaker.user.website_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <Globe className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          </div>

                          {speaker.topics && speaker.topics.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {speaker.topics.slice(0, 3).map((topic, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* All Speakers */}
          {otherSpeakers.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-4">
                {featuredSpeakers.length > 0 ? 'All Speakers' : 'Speakers'}
              </h3>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {otherSpeakers.map((speaker) => (
                  <Card key={speaker.user?.id}>
                    <CardContent className="p-4 text-center">
                      <div className="relative w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-muted">
                        {(speaker.headshot_url || speaker.user?.avatar_url) ? (
                          <Image
                            src={speaker.headshot_url || speaker.user?.avatar_url || ''}
                            alt={speaker.user?.full_name || 'Speaker'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                            {speaker.user?.full_name?.charAt(0) || 'S'}
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold">{speaker.user?.full_name}</h4>
                      {speaker.title && (
                        <p className="text-sm text-muted-foreground truncate">
                          {speaker.title}
                        </p>
                      )}
                      {speaker.company && (
                        <p className="text-sm text-muted-foreground truncate">
                          {speaker.company}
                        </p>
                      )}

                      <div className="mt-2 flex justify-center gap-2">
                        {speaker.user?.linkedin_url && (
                          <a
                            href={speaker.user.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        {speaker.user?.twitter_url && (
                          <a
                            href={speaker.user.twitter_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Twitter className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
