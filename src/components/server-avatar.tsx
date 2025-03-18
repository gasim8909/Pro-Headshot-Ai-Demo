import { UserCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface ServerAvatarProps {
  className?: string;
}

// This is a server-compatible version of the avatar component
// that doesn't use any client-side hooks or context
export default function ServerAvatar({ className = "" }: ServerAvatarProps) {
  return (
    <Avatar className={`relative ${className}`}>
      <AvatarFallback className="bg-gray-100">
        <UserCircle className="h-5 w-5 text-gray-500" />
      </AvatarFallback>
    </Avatar>
  );
}
