import { graphql } from "react-relay";

export const forumApiThreadDetailQuery = graphql`
  query ForumApiThreadDetailQuery($id: UUID!) {
    thread(id: $id) {
      id
      title
      creatorId

      ... on InfoThread {
        info {
          id
          content
          downvotedByUsers
          upvotedByUsers
          creationTime
        }
      }

      ... on QuestionThread {
        question {
          id
          content
          downvotedByUsers
          upvotedByUsers
          creationTime
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
      }
    }
  }
`;


export const forumApiThreadListQuery = graphql`
  query ForumApiThreadListQuery($id: UUID!) {
    forumByCourseId(id: $id) {
      id
      threads {
        id
        title
        creationTime
        creatorId
        ... on InfoThread {
          info {
            id
            content
            downvotedByUsers
            upvotedByUsers
          }
        }
        ... on QuestionThread{
          question {
            id
            content
            downvotedByUsers
            upvotedByUsers
          }
          selectedAnswer{
            id
          }
        }
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
