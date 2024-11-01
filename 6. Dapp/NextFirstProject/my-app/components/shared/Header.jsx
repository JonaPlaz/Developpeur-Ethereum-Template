import Link from "next/link";

const Header = () => {
  return (
    <nav className="navbar">
      <div>Logo</div>
      <div className="flex-between w-1/4">
        <Link href="/">Home</Link>
        <Link href="/cv">cv</Link>
        <Link href="/contact">Contact</Link>
      </div>
    </nav>
  );
};

export default Header;
