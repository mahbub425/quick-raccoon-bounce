import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, User } from "lucide-react"; // Removed CheckCircle, DollarSign

interface HeaderProps {
  children?: React.ReactNode; // To allow passing mobile menu trigger
}

const Header = ({ children }: HeaderProps) => {
  const { user, logout } = useAuth();
  const { cartItemCount } = useCart();

  // Function to get the role-specific path for /cart
  const getCartPath = () => {
    if (!user || user.role === 'user') {
      return "/cart";
    }
    return `/${user.role}/cart`;
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 shadow-lg h-16 flex items-center">
      <div className="container mx-auto flex justify-between items-center w-full">
        <div className="flex items-center">
          {children} {/* Mobile menu trigger will be rendered here */}
          <Link to="/" className="text-2xl font-bold tracking-wide">
            ভাউচার এন্ট্রি সিস্টেম
          </Link>
        </div>
        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to={getCartPath()} className="relative p-2 hover:bg-blue-700 rounded-md transition-colors">
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/avatars/01.png" alt="@shadcn" />
                      <AvatarFallback className="bg-blue-800 text-white">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.designation} ({user.department})
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500 hover:text-red-700">
                    লগআউট
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/login">
              <Button variant="secondary" className="bg-blue-500 hover:bg-blue-700 text-white">
                লগইন
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;