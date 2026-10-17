export type Post = {
  _id: string
  body?: string
  image?: string
  isLiked?: boolean
  likes?: string[]
  user: {
    _id: string
    name: string
    photo: string
  }
}