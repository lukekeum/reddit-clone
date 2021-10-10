import { Post } from '@src/entities/post/Post'
import { PostRepository } from '@src/entities/post/PostRepository'
import { Sub } from '@src/entities/sub/Sub'
import { SubRepository } from '@src/entities/sub/SubRepository'
import { User } from '@src/entities/user/User'
import { UserRepository } from '@src/entities/user/UserRepository'
import { getCustomRepository } from 'typeorm'
import { VoteRepository } from '../VoteRepository'
import faker from 'faker'

describe('vote 엔티티', () => {
  const postRepository = () => getCustomRepository(PostRepository)
  const userRepository = () => getCustomRepository(UserRepository)
  const subRepository = () => getCustomRepository(SubRepository)
  const voteRepository = () => getCustomRepository(VoteRepository)

  const userData = (): Partial<User> => ({
    email: faker.internet.email(),
    username: faker.internet.userName(),
    password: faker.internet.password(),
  })

  const subData = {
    name: faker.name.title(),
    title: faker.name.title(),
  }

  const postData = {
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph(),
  }

  let usrData: Partial<User>

  let user: User
  let sub: Sub
  let post: Post

  beforeEach(async () => {
    usrData = userData()

    user = await userRepository().create(usrData).save()
    sub = await subRepository()
      .create({ ...subData, owner: user })
      .save()
    post = await postRepository()
      .create({ ...postData, sub, user })
      .save()
  })

  afterEach(async () => {
    await userRepository().delete({ id: user.id })
    await subRepository().delete({ id: sub.id })
  })

  it('투표수 증가', async () => {
    const vote = await voteRepository().create({ post, user, value: 1 }).save()

    expect(vote.fk_post_id).toBe(post.id)
    expect(vote.fk_user_id).toBe(user.id)

    const voteNum = await voteRepository().getVoteNumber(post.id)

    expect(voteNum).toBe(1)
  })

  it('투표수 감소', async () => {
    const vote = await voteRepository().create({ post, user, value: -1 }).save()

    expect(vote.fk_post_id).toBe(post.id)
    expect(vote.fk_user_id).toBe(user.id)

    const voteNum = await voteRepository().getVoteNumber(post.id)

    expect(voteNum).toBe(-1)
  })

  it('중복된 유저 투표', async () => {
    try {
      await voteRepository().create({ post, user, value: 1 }).save()
      await voteRepository().create({ post, user, value: -1 }).save()
    } catch (err) {
      expect(err).toBeDefined()
    }
  })

  it('두 사람의 투표 (+1, -1)', async () => {
    const user2 = await userRepository().create(userData()).save()

    await voteRepository().create({ post, user, value: 1 }).save()
    await voteRepository().create({ post, user: user2, value: -1 }).save()

    const voteNum = await voteRepository().getVoteNumber(post.id)

    expect(voteNum).toBe(0)
  })

  it('두 사람의 투표 (+1, +1)', async () => {
    const user2 = await userRepository().create(userData()).save()

    await voteRepository().create({ post, user, value: 1 }).save()
    await voteRepository().create({ post, user: user2, value: 1 }).save()

    const voteNum = await voteRepository().getVoteNumber(post.id)

    expect(voteNum).toBe(2)
  })
})
