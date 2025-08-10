import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../AuthContext'
import { supabase } from '@/integrations/supabase/client'

function Consumer() {
  const { loading, user, signOut } = useAuth()
  return (
    <div>
      <div>loading: {String(loading)}</div>
      <div>user: {user ? 'yes' : 'no'}</div>
      <button onClick={() => signOut()}>signout</button>
    </div>
  )
}

describe('AuthContext', () => {
  it('provides auth state and allows signOut', async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(supabase.auth, 'signOut').mockResolvedValue({ error: null } as any)

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    )

    await waitFor(() => expect(screen.getByText(/loading: false/)).toBeInTheDocument())
    expect(screen.getByText(/user: no/)).toBeInTheDocument()

    await user.click(screen.getByText('signout'))
    expect(spy).toHaveBeenCalled()
  })
})

