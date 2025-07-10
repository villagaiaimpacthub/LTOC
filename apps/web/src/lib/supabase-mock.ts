// Mock Supabase client for demo purposes
export const createMockSupabaseClient = () => {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Demo mode - no auth' } }),
      signUp: async () => ({ data: null, error: { message: 'Demo mode - no auth' } }),
      signOut: async () => ({ error: null }),
    },
    from: (table: string) => ({
      select: () => ({
        data: [],
        error: null,
        eq: () => ({ data: [], error: null }),
        order: () => ({ data: [], error: null }),
        limit: () => ({ data: [], error: null }),
      }),
      insert: () => ({ data: null, error: { message: 'Demo mode - no database' } }),
      update: () => ({ data: null, error: { message: 'Demo mode - no database' } }),
      delete: () => ({ data: null, error: { message: 'Demo mode - no database' } }),
    }),
  }
}