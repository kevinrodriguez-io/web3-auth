import cx from "classnames";
import { TrashIcon } from "@heroicons/react/solid";
import { useMutation } from "react-query";

export const PostCard = ({
  title,
  content,
  className,
  onDelete,
}: {
  title: string;
  content: string;
  className?: string;
  onDelete?: () => void;
}) => {
  return (
    <div
      className={cx(
        "relative max-w-md px-8 py-4 mx-auto bg-white rounded-lg shadow-lg dark:bg-gray-800",
        className
      )}
    >
      {onDelete ? (
        <button onClick={onDelete} className="absolute top-0 right-0 w-8 h-8 ">
          <TrashIcon className="fill-red-300 w-4 h-4" />
        </button>
      ) : null}
      <h2 className="mt-2 text-xl font-semibold text-gray-800 dark:text-white md:mt-0 md:text-2xl">
        {title}
      </h2>
      <p className="mt-2 text-gray-600 dark:text-gray-200">{content}</p>
    </div>
  );
};

export const PostCardSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={cx(
        "max-w-md px-8 py-4 mx-auto bg-white rounded-lg shadow-lg dark:bg-gray-800",
        className
      )}
    >
      <div className="animate-pulse mt-2 text-xl font-semibold text-gray-800 dark:text-white md:mt-0 md:text-2xl w-1/4 bg-gray-500 h-7 rounded-sm" />
      <div className="animate-pulse mt-2 text-gray-600 dark:text-gray-200 w-full bg-gray-500 h-4 rounded-sm " />
      <div className="animate-pulse mt-2 text-gray-600 dark:text-gray-200 w-3/4 bg-gray-500 h-4 rounded-sm " />
      <div className="animate-pulse mt-2 text-gray-600 dark:text-gray-200 w-2/4 bg-gray-500 h-4 rounded-sm " />
      <div className="animate-pulse mt-2 text-gray-600 dark:text-gray-200 w-3/4 bg-gray-500 h-4 rounded-sm " />
    </div>
  );
};
