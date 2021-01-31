import Meta from '../components/meta'
import Container from '../components/container'
import Header from '../components/header'


export default function Layout({ preview, children }) {
  return (
    <>
      <Meta />
      <div className="min-h-screen">
        <main>
        <Container>
        <Header />
        {children}
        </Container>
        </main>
      </div>
    </>
  )
}
