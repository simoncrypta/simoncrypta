import Link from 'next/link'

export default function Header() {
  return (
    <h2 className="text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight mb-20 mt-8">
      <div className="flex items-center">
        <img src="/assets/blog/dynamic-routing/cover.jpg" className="w-12 h-12 rounded-full mr-4" alt="Simon Gagnon" />
        <div className="text-xl font-bold">      <Link href="/">Simon       </Link></div>
      </div>
    </h2>
  )
}
