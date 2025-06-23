'use client';

import { createContext, useContext } from 'react';
import { Post } from "@/components/forum/types";

const PostsContext = createContext({
  deletePostContext: (postId: string) => console.warn('deletePost function not provided'),
});

export const usePostsActions = () => {
  return useContext(PostsContext);
};

export default PostsContext;