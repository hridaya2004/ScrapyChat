import type React from "react";
import { cn } from "@/lib/utils";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

const H1 = ({ className, children, ...props }: HeadingProps) => (
  <h1
    className={cn(
      "scroll-m-20 font-extrabold text-4xl tracking-tight lg:text-5xl",
      className
    )}
    {...props}
  >
    {children}
  </h1>
);

const H2 = ({ className, children, ...props }: HeadingProps) => (
  <h2
    className={cn(
      "scroll-m-20 font-semibold text-3xl tracking-tight",
      className
    )}
    {...props}
  >
    {children}
  </h2>
);

const H3 = ({ className, children, ...props }: HeadingProps) => (
  <h3
    className={cn(
      "scroll-m-20 font-semibold text-2xl tracking-tight",
      className
    )}
    {...props}
  >
    {children}
  </h3>
);

const H4 = ({ className, children, ...props }: HeadingProps) => (
  <h4
    className={cn(
      "scroll-m-20 font-semibold text-xl tracking-tight",
      className
    )}
    {...props}
  >
    {children}
  </h4>
);

const P = ({ className, children, ...props }: ParagraphProps) => (
  <p className={cn("leading-7", className)} {...props}>
    {children}
  </p>
);

const Lead = ({ className, children, ...props }: ParagraphProps) => (
  <p className={cn("text-muted-foreground text-xl", className)} {...props}>
    {children}
  </p>
);

const Muted = ({ className, children, ...props }: ParagraphProps) => (
  <p className={cn("text-muted-foreground text-sm", className)} {...props}>
    {children}
  </p>
);

export { H1, H2, H3, H4, P, Lead, Muted };
