import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { SubscriptionProvider, useSubscription } from '../SubscriptionContext'
import { supabase } from '@/integrations/supabase/client'

function Consumer() {
  const { subscriptionData, loading, refreshSubscription } = useSubscription()
  return (
    <div>
      <div>loading: {String(loading)}</div>
      <div>subscribed: {subscriptionData?.subscribed ? 'yes' : 'no'}</div>
      <button onClick={() => refreshSubscription()}>refresh</button>
    </div>
  )
}

describe('SubscriptionContext', () => {
  it('reports unsubscribed when no user and handles refresh without error', async () => {
    vi.spyOn(supabase.functions, 'invoke').mockResolvedValue({ data: { subscribed: false }, error: null } as any)

    render(
      <SubscriptionProvider user={null}>
        <Consumer />
      </SubscriptionProvider>
    )

    await waitFor(() => expect(screen.getByText(/loading: false/)).toBeInTheDocument())
    expect(screen.getByText(/subscribed: no/)).toBeInTheDocument()
  })
})

