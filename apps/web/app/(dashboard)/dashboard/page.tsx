import { createClient } from '@/lib/supabase/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Calendar,
  Users,
  Ticket,
  TrendingUp,
  Building2,
  MessageSquare,
} from 'lucide-react'
import { formatNumber, calculatePercentageChange } from '@/lib/utils'

async function getDashboardData() {
  const supabase = createClient()

  // Get user's conferences
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get conferences where user is organizer
  const { data: conferences } = await supabase
    .from('conferences')
    .select('id, name, start_date, end_date')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  const conferenceIds = conferences?.map((c) => c.id) || []

  // Get stats
  const [
    { count: totalAttendees },
    { count: totalSessions },
    { count: totalTickets },
    { count: totalMessages },
  ] = await Promise.all([
    supabase
      .from('conference_members')
      .select('*', { count: 'exact', head: true })
      .in('conference_id', conferenceIds),
    supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .in('conference_id', conferenceIds),
    supabase
      .from('conference_members')
      .select('*', { count: 'exact', head: true })
      .in('conference_id', conferenceIds)
      .not('ticket_code', 'is', null),
    supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in(
        'room_id',
        supabase
          .from('chat_rooms')
          .select('id')
          .in('conference_id', conferenceIds)
      ),
  ])

  return {
    conferences: conferences || [],
    totalConferences: conferences?.length || 0,
    totalAttendees: totalAttendees || 0,
    totalSessions: totalSessions || 0,
    totalTickets: totalTickets || 0,
    totalMessages: totalMessages || 0,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  if (!data) {
    return <div>Loading...</div>
  }

  const stats = [
    {
      name: 'Total Conferences',
      value: data.totalConferences,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Calendar,
    },
    {
      name: 'Total Attendees',
      value: data.totalAttendees,
      change: '+23.1%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      name: 'Tickets Sold',
      value: data.totalTickets,
      change: '+18.2%',
      changeType: 'positive' as const,
      icon: Ticket,
    },
    {
      name: 'Messages Sent',
      value: data.totalMessages,
      change: '+32.8%',
      changeType: 'positive' as const,
      icon: MessageSquare,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your conferences.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stat.value)}</div>
              <p
                className={`text-xs ${
                  stat.changeType === 'positive'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Conferences */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Conferences</CardTitle>
          <CardDescription>
            Your most recently created conferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.conferences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-1 text-lg font-semibold">No conferences yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Get started by creating your first conference
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.conferences.slice(0, 5).map((conference) => (
                <div
                  key={conference.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <h4 className="font-semibold">{conference.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(conference.start_date).toLocaleDateString()} -{' '}
                      {new Date(conference.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      View details
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="cursor-pointer transition-colors hover:border-primary">
          <CardHeader>
            <Calendar className="mb-2 h-8 w-8 text-primary" />
            <CardTitle>Create Conference</CardTitle>
            <CardDescription>
              Set up a new conference event
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer transition-colors hover:border-primary">
          <CardHeader>
            <Building2 className="mb-2 h-8 w-8 text-primary" />
            <CardTitle>Add Sponsor</CardTitle>
            <CardDescription>
              Onboard a new sponsor or exhibitor
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer transition-colors hover:border-primary">
          <CardHeader>
            <TrendingUp className="mb-2 h-8 w-8 text-primary" />
            <CardTitle>View Analytics</CardTitle>
            <CardDescription>
              See detailed event metrics
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
