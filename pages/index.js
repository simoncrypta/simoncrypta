import Stories from '../components/stories'
import Intro from '../components/intro'
import Layout from '../components/layout'
import { getAllPosts } from '../lib/api'
import Head from 'next/head'


export default function Index({ allPosts }) {
  return (
    <>
      <Layout>
        <Head>
          <title>simoncrypta.dev</title>
        </Head>
          <Intro />
          {allPosts.length > 1 && <Stories posts={allPosts} />}
      </Layout>
    </>
  )
}

export async function getStaticProps() {
  const allPosts = getAllPosts([
    'title',
    'date',
    'slug',
    'coverImage',
    'excerpt',
  ])

  return {
    props: { allPosts },
  }
}
