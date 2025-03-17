import { ButtonHTMLAttributes, forwardRef } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  gradientFrom?: string;
  gradientTo?: string;
  hoverFrom?: string;
  hoverTo?: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost";
}

const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  (
    {
      gradientFrom = "from-blue-600",
      gradientTo = "to-purple-600",
      hoverFrom = "hover:from-blue-700",
      hoverTo = "hover:to-purple-700",
      className,
      children,
      size,
      variant,
      ...props
    },
    ref,
  ) => {
    return (
      <Button
        ref={ref}
        className={cn(
          `bg-gradient-to-r ${gradientFrom} ${gradientTo} ${hoverFrom} ${hoverTo} text-white`,
          className,
        )}
        size={size}
        variant={variant}
        {...props}
      >
        {children}
      </Button>
    );
  },
);

GradientButton.displayName = "GradientButton";

export { GradientButton };
