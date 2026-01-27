import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { ExternalLink, MapPin } from 'lucide-react'

async function getSponsorsData(slug: string) {
  const supabase = await createClient()

  const { data: conference } = await supabase
    .from('conferences')
    .select('id, name')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  if (!conference) return null

  const { data: sponsors } = await supabase
    .from('sponsors')
    .select('*')
    .eq('conference_id', conference.id)
    .order('created_at', { ascending: true })

  return {
    conference,
    sponsors: sponsors || [],
  }
}

const tierOrder = ['platinum', 'gold', 'silver', 'bronze', 'exhibitor']
const tierLabels: Record<string, string> = {
  platinum: 'Platinum Sponsors',
  gold: 'Gold Sponsors',
  silver: 'Silver Sponsors',
  bronze: 'Bronze Sponsors',
  exhibitor: 'Exhibitors',
}
const tierSizes: Record<string, { logo: number; card: string }> = {
  platinum: { logo: 200, card: 'md:col-span-2' },
  gold: { logo: 160, card: '' },
  silver: { logo: 120, card: '' },
  bronze: { logo: 100, card: '' },
  exhibitor: { logo: 80, card: '' },
}

export default async function PublicSponsorsPage({
  params,
}: {
  params: { slug: string }
}) {
  const data = await getSponsorsData(params.slug)

  if (!data) {
    notFound()
  }

  const { sponsors } = data

  // Group sponsors by tier
  const sponsorsByTier = tierOrder.reduce(
    (acc, tier) => {
      acc[tier] = sponsors.filter((s) => s.tier === tier)
      return acc
    },
    {} as Record<string, typeof sponsors>
  )

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Sponsors & Exhibitors</h2>
        <p className="text-muted-foreground">
          Thank you to our sponsors for making this event possible
        </p>
      </div>

      {sponsors.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Sponsor information coming soon!
        </div>
      ) : (
        <div className="space-y-12">
          {tierOrder.map((tier) => {
            const tierSponsors = sponsorsByTier[tier]
            if (tierSponsors.length === 0) return null

            return (
              <section key={tier}>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-6">
                  {tierLabels[tier]}
                </h3>
                <div
                  className={`grid gap-6 ${
                    tier === 'platinum'
                      ? 'md:grid-cols-2'
                      : tier === 'gold'
                        ? 'md:grid-cols-2 lg:grid-cols-3'
                        : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  }`}
                >
                  {tierSponsors.map((sponsor) => (
                    <Card
                      key={sponsor.id}
                      className={`overflow-hidden ${tierSizes[tier].card}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                          {sponsor.logo_url ? (
                            <div className="relative mb-4" style={{ height: tierSizes[tier].logo / 2 }}>
                              <Image
                                src={sponsor.logo_url}
                                alt={sponsor.name}
                                width={tierSizes[tier].logo}
                                height={tierSizes[tier].logo / 2}
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <div
                              className="flex items-center justify-center mb-4 bg-muted rounded-lg font-semibold text-muted-foreground"
                              style={{
                                width: tierSizes[tier].logo,
                                height: tierSizes[tier].logo / 2,
                              }}
                            >
                              {sponsor.name}
                            </div>
                          )}

                          <h4 className="font-semibold">{sponsor.name}</h4>

                          {sponsor.description && (
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                              {sponsor.description}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap justify-center gap-3 text-sm">
                            {sponsor.booth_number && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>Booth {sponsor.booth_number}</span>
                              </div>
                            )}
                            {sponsor.website_url && (
                              <a
                                href={sponsor.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span>Visit website</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
