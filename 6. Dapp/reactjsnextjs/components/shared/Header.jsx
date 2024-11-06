import Link from "next/link";

const Header = () => {
  return (
    <div className="bg-sky-500 p-5">
      <ul className="w-full flex justify-between items-center">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/CV">CV</Link>
        </li>
        <li>
          <Link href="/contact">contact</Link>
        </li>
      </ul>
    </div>
  );
};

export default Header;
