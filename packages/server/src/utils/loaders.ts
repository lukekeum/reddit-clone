import { commentLoader, postLoader } from '@src/entities/post/PostRepository'

export const loaders = {
  comments: commentLoader(),
  posts: postLoader(),
}
