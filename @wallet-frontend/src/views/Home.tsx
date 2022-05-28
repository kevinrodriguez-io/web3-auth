import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useQuery, useMutation } from "react-query";
import { performAuthenticatedRequest } from "../lib/api/web3Posts";

type Post = {
  title: string;
  content: string;
  id: string;
  userId: string;
};

export const Home = () => {
  const { publicKey } = useWallet();

  if (!publicKey) {
    return <div>Connect your wallet to authenticate</div>;
  }

  return <HomeContents publicKey={publicKey!} />;
};

type HomeContentsProps = {
  publicKey: PublicKey;
};

const HomeContents = ({ publicKey }: HomeContentsProps) => {
  const wallet = useWallet();
  const { data, error, isLoading, refetch } = useQuery(
    "/",
    ({ queryKey }) => {
      const [url] = queryKey;
      return performAuthenticatedRequest<
        undefined,
        { data: { posts: Post[] } }
      >("GET", url, "posts:get-all", {
        publicKey,
        signMessage: wallet.signMessage!,
      });
    },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );
  const { mutate, isLoading: isAdding } = useMutation(
    ({ title, content }: { title: string; content: string }) => {
      return performAuthenticatedRequest(
        "POST",
        "/",
        "posts:post",
        { publicKey, signMessage: wallet.signMessage! },
        { title, content }
      );
    },
    {
      onSuccess: () => {
        refetch();
      },
    }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {(error as any).message}</div>;
  }

  const handleFormSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target as any);
    const { title, content } = Object.fromEntries(formData);
    mutate({
      title: title.valueOf() as string,
      content: content.valueOf() as string,
    });
  };

  return (
    <div>
      <form onSubmit={handleFormSubmit} className="w-56">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <div className="mt-1">
            <input
              type="title"
              name="title"
              id="title"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Hello World"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            Content
          </label>
          <div className="mt-1">
            <input
              type="content"
              name="content"
              id="content"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Some contents..."
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Submit
          </button>
        </div>
      </form>
      <div className="flow-root mt-6">
        <ul role="list" className="-my-5 divide-y divide-gray-200">
          {(data?.data.posts ?? []).map((post) => (
            <li key={post.id} className="py-5">
              <div className="relative focus-within:ring-2 focus-within:ring-indigo-500">
                <h3 className="text-sm font-semibold text-gray-800">
                  <a href="#" className="hover:underline focus:outline-none">
                    {/* Extend touch target to entire panel */}
                    <span className="absolute inset-0" aria-hidden="true" />
                    {post.title}
                  </a>
                </h3>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                  {post.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
