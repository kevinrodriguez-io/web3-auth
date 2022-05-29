import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useQuery, useMutation } from "react-query";
import * as web3Posts from "../lib/api/web3Posts";
import { Layout } from "../components/Layout";
import { PostCard, PostCardSkeleton } from "../components/PostCard";

type Post = {
  title: string;
  content: string;
  id: string;
  userId: string;
};

export const Home = () => {
  const { publicKey } = useWallet();

  if (!publicKey) {
    return (
      <Layout title="Posts">
        <div className="flex flex-col items-center justify-center text-xl">
          Connect your wallet to authenticate
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Posts">
      <HomeContents publicKey={publicKey!} />
    </Layout>
  );
};

type HomeContentsProps = {
  publicKey: PublicKey;
};

const HomeContents = ({ publicKey }: HomeContentsProps) => {
  const wallet = useWallet();

  const posts = useQuery("/", ({ queryKey }) => {
    const [url] = queryKey;
    return web3Posts.req<undefined, { data: { posts: Post[] } }>(
      { method: "GET", url },
      "skip",
      { publicKey, signMessage: wallet.signMessage! }
    );
  });

  const addPost = useMutation(
    ({ title, content }: { title: string; content: string }) => {
      return web3Posts.req(
        { method: "POST", url: "/", data: { title, content } },
        "posts:post",
        { publicKey, signMessage: wallet.signMessage! }
      );
    },
    {
      onSuccess: () => {
        posts.refetch();
      },
    }
  );

  const deletePost = useMutation(
    ({ id }: { id: string }) => {
      return web3Posts.req(
        { method: "DELETE", url: `/${id}` },
        "posts:delete",
        { publicKey, signMessage: wallet.signMessage! }
      );
    },
    {
      onSuccess: () => {
        posts.refetch();
      },
    }
  );

  const handleFormSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target as any);
    const { title, content } = Object.fromEntries(formData);
    addPost.mutate({
      title: title.valueOf() as string,
      content: content.valueOf() as string,
    });
  };

  const handleDelete = (id: string) => {
    deletePost.mutate({ id });
  };

  return (
    <section className="text-gray-600 body-font relative">
      <div className="container px-5 py-24 mx-auto">
        <div className="flex flex-col text-center w-full mb-12">
          <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">
            New Post
          </h1>
          <p className="lg:w-2/3 mx-auto leading-relaxed text-base">
            Feel free to add any contents to your post.
          </p>
        </div>
        <form onSubmit={handleFormSubmit} className="lg:w-1/2 md:w-2/3 mx-auto">
          <div className="flex flex-wrap -m-2">
            <div className="p-2 w-full">
              <div className="relative">
                <label
                  htmlFor="title"
                  className="leading-7 text-sm text-gray-600"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                />
              </div>
            </div>
            <div className="p-2 w-full">
              <div className="relative">
                <label
                  htmlFor="content"
                  className="leading-7 text-sm text-gray-600"
                >
                  Contents
                </label>
                <textarea
                  id="content"
                  name="content"
                  className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"
                ></textarea>
              </div>
            </div>
            <div className="p-2 w-full">
              <button
                type="submit"
                className="flex mx-auto text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
              >
                Add
              </button>
            </div>
          </div>
        </form>
        <section className="mt-16">
          <h3 className="text-center font-medium title-font text-2xl mb-8">
            Posts
          </h3>
          {posts.isLoading || addPost.isLoading || deletePost.isLoading ? (
            <>
              <PostCardSkeleton />
              <PostCardSkeleton className="mt-4" />
              <PostCardSkeleton className="mt-4" />
              <PostCardSkeleton className="mt-4" />
            </>
          ) : posts.data?.data.posts.length === 0 ? (
            <div className="text-center">No posts</div>
          ) : (
            posts.data?.data.posts.map((post, i) => (
              <PostCard
                className={i !== 0 ? "mt-4" : ""}
                key={post.id}
                title={post.title}
                content={post.content}
                onDelete={() => handleDelete(post.id)}
              />
            ))
          )}
        </section>
      </div>
    </section>
  );
};
