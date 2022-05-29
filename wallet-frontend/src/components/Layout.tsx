import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export const Layout = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => {
  return (
    <div>
      <header className="text-gray-600 body-font">
        <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
          <nav className="flex lg:w-2/5 flex-wrap items-center text-base md:ml-auto">
            <a href="#" className="hover:text-gray-900">
              Index
            </a>
          </nav>
          <a className="flex order-first lg:order-none lg:w-1/5 title-font font-medium items-center text-gray-900 lg:items-center lg:justify-center mb-4 md:mb-0">
            <span className="text-xl">Posts App</span>
          </a>
          <div className="lg:w-2/5 inline-flex lg:justify-end lg:ml-0">
            <WalletMultiButton />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4">{children}</main>
    </div>
  );
};
