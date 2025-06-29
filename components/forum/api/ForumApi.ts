import { graphql } from "react-relay";

export const forumApiThreadDetailQuery = graphql`
  query ForumApiThreadDetailQuery($id: UUID!) {
    thread(id: $id) {
      id
      title
      creatorId
      creationTime
      numberOfPosts
      ... on InfoThread {
        info {
          id
          content
          downvotedByUsers
          upvotedByUsers
          authorId
        }
      }

      ... on QuestionThread {
        question {
          id
          content
          downvotedByUsers
          upvotedByUsers
          authorId
        }
        selectedAnswer {
          id
        }
      }

      posts {
        id
        content
        creationTime
        authorId
        downvotedByUsers
        upvotedByUsers
        edited
      }
    }
  }
`;

export const forumApiForumIdQuery = graphql`
  query ForumApiForumIdQuery($id: UUID!) {
    forumByCourseId(id: $id) {
      id
    }
  }
`;

export const forumApiCreateQuestionThreadMutation = graphql`
  mutation ForumApiCreateQuestionThreadMutation($thread: InputQuestionThread!) {
    createQuestionThread(thread: $thread) {
      id
    }
  }
`;

export const forumApiAddPostMutation = graphql`
mutation ForumApiAddPostMutation($post: InputPost!) {
  addPost(post: $post) {
    id
    content
    creationTime
    authorId
    downvotedByUsers
    upvotedByUsers
  }
}`

export const forumApiCreateInfoThreadMutation = graphql`
  mutation ForumApiCreateInfoThreadMutation($thread: InputInfoThread!) {
    createInfoThread(thread: $thread) {
      id
    }
  }
`;


export const forumApiUserInfoQuery = graphql`
    query ForumApiUserInfoQuery {
        currentUserInfo {
            id
            firstName
            lastName
        }
    }
`;

export const forumApiUpvotePostMutation = graphql`
    mutation ForumApiUpvotePostMutation($postId: UUID!) {
        upvotePost(postId: $postId) {
            id
        }
    }
`;

export const forumApiDownvotePostMutation = graphql`
    mutation ForumApiDownvotePostMutation($postId: UUID!) {
        downvotePost(postId: $postId) {
            id
        }
    }
`;

export const forumApiUserInfoByIdQuery = graphql`
    query ForumApiUserInfoByIdQuery($id: UUID!) {
        findUserInfos(ids: [$id]) {
            id
            userName
        }
    }
`;

export const forumApiSelectBestAnswerMutation = graphql`
    mutation ForumApiSelectBestAnswerMutation($postId: UUID!) {
      selectAnswer(postId: $postId) {
          id
        }
}`

export const forumApiUpdatePostMutation =   graphql`
  mutation ForumApiUpdatePostMutation($post: InputPost!) {
    updatePost(post: $post) {
      id
    }
  }
`
export const forumApiDeletePostMutation =   graphql`
  mutation ForumApiDeletePostMutation($postId: UUID!) {
    deletePost(postId: $postId) {
      id
    }
  }
`

export const forumApiThreadByMediaRecordQuery = graphql`
    query ForumApiThreadsCombinedQuery($courseId: UUID!, $contentId: UUID!, $hasContentId: Boolean!) {
      threadsByContentId(id: $contentId) @include(if: $hasContentId) {
      id
      title
      creationTime
      creatorId
      numberOfPosts
      __typename
      ... on InfoThread {
        info {
          id
          content
          downvotedByUsers
          upvotedByUsers
        }
      }
      ... on QuestionThread {
        question {
          id
          content
          downvotedByUsers
          upvotedByUsers
        }
        selectedAnswer {
          id
        }
      }
    }
      forumByCourseId(id: $courseId) @skip(if: $hasContentId) {
      id
      threads {
        id
        title
        creationTime
        creatorId
        numberOfPosts
        __typename
        ... on InfoThread {
          info {
            id
            content
            downvotedByUsers
            upvotedByUsers
          }
        }
        ... on QuestionThread {
          question {
            id
            content
            downvotedByUsers
            upvotedByUsers
          }
          selectedAnswer {
            id
          }
        }
      }
    }
  }
`