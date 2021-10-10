import { getCustomRepository } from 'typeorm'
import { PostRepository } from '../PostRepository'
import faker from 'faker'
import { User } from '@src/entities/user/User'
import { UserRepository } from '@src/entities/user/UserRepository'
import { Sub } from '@src/entities/sub/Sub'
import { SubRepository } from '@src/entities/sub/SubRepository'

describe('post 엔티티', () => {
  const userData = {
    email: faker.internet.email(),
    username: faker.internet.userName(),
    password: faker.internet.password(),
  }

  let user: User
  let sub: Sub

  const subData = {
    name: faker.name.title(),
    title: faker.name.title(),
  }

  beforeAll(async () => {
    user = await (
      await getCustomRepository(UserRepository).createAndValidate(userData)
    ).save()

    sub = await await getCustomRepository(SubRepository)
      .create({
        ...subData,
        owner: user,
      })
      .save()
  })

  it('포스트', async () => {
    const postRepository = getCustomRepository(PostRepository)
    const subRepository = getCustomRepository(SubRepository)

    const p = await postRepository
      .create({
        user,
        sub,
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraph(),
      })
      .save()

    sub.fk_posts_id = [p.id]

    await sub.save()

    const post = await postRepository.findOne(p.id, {
      relations: ['sub', 'user', 'sub.posts'],
    })

    const subject = await subRepository.findOne(sub.id, {
      relations: ['posts', 'posts.sub'],
    })

    expect(post).toBeDefined()
    expect(subject?.fk_posts_id).toContainEqual(post?.id)
    expect(subject?.id).toBe(post?.sub?.id)
  })

  it('댓글', async () => {
    const postRepository = getCustomRepository(PostRepository)

    const p = await postRepository
      .create({
        user,
        sub,
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraph(),
      })
      .save()

    sub.fk_posts_id = [p.id]

    await sub.save()

    const comment = await postRepository
      .create({
        user,
        is_comment: true,
        content: faker.lorem.paragraph(),
        parent: p,
        super_parent: p,
      })
      .save()

    const post = await postRepository.findOne(p.id)

    expect(comment.fk_parent_id).toBe(post?.id)
    expect(comment.is_comment).toBe(true)

    const comment2 = await postRepository
      .create({
        user,
        is_comment: true,
        content: faker.lorem.paragraph(),
        parent: comment,
        super_parent: p,
      })
      .save()

    expect(comment2.is_comment).toBe(true)
    expect(comment2.fk_parent_id).toBe(comment.id)
    expect(comment2.fk_super_parent_id).toBe(post?.id)

    const comments = await postRepository.find({
      where: {
        fk_super_parent_id: post?.id,
      },
    })

    expect(comments.length).toBe(2)

    comments.forEach((v, i) => {
      expect(v.id).toBe([comment, comment2][i].id)
    })
  })
})
