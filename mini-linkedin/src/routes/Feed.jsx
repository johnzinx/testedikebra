import PostBox from '../components/PostBox'
import PostList from '../components/PostList'

export default function Feed() {
  return (
    <div className="max-w-2xl mx-auto">
      <PostBox />
      <PostList />
    </div>
  )
}
