export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Living Theory of Change Platform</h1>
      
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">🎉 Demo Deployment Successful!</h2>
        <p className="text-gray-700 mb-4">
          This is a demo version of the LTOC platform. The full version includes:
        </p>
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>User authentication and multi-tenancy</li>
          <li>Content management with real-time collaboration</li>
          <li>AI-powered synthesis generation</li>
          <li>Advanced search and filtering</li>
          <li>Admin dashboard and analytics</li>
        </ul>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">📚 Features</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Collaborative theory editing</li>
            <li>✓ Version control & history</li>
            <li>✓ AI synthesis tools</li>
            <li>✓ Review workflows</li>
            <li>✓ Real-time notifications</li>
          </ul>
        </div>

        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">🛠️ Tech Stack</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Next.js 14 + TypeScript</li>
            <li>• Supabase (PostgreSQL)</li>
            <li>• Tailwind CSS</li>
            <li>• OpenAI/Anthropic APIs</li>
            <li>• Vercel deployment</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 p-6 bg-yellow-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-3">⚡ Next Steps</h3>
        <p className="text-gray-700 mb-3">To enable full functionality:</p>
        <ol className="list-decimal ml-6 space-y-2 text-gray-700">
          <li>Create a Supabase project</li>
          <li>Run the database migrations</li>
          <li>Add environment variables to Vercel</li>
          <li>Redeploy the application</li>
        </ol>
        <p className="mt-4 text-sm text-gray-600">
          See <code className="bg-gray-200 px-2 py-1 rounded">SUPABASE_SETUP.md</code> for detailed instructions.
        </p>
      </div>
    </main>
  )
}
