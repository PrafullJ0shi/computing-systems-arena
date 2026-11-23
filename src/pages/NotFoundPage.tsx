import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="panel p-6">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">404</p>
      <h1 className="mt-2 text-3xl font-semibold">This address is not on the map.</h1>
      <p className="mt-2 text-muted">The arena only has the thirteen worlds, the mock, and the rooms linked from the map.</p>
      <Link className="btn btn-primary mt-5" to="/">
        Return to the map
      </Link>
    </section>
  )
}
