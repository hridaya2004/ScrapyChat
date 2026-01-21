import type React from "react";
import { cn } from "@/lib/utils";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  children: React.ReactNode;
}

interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children: React.ReactNode;
}

interface BlockquoteProps extends React.HTMLAttributes<HTMLQuoteElement> {
  className?: string;
  children: React.ReactNode;
}

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  children: React.ReactNode;
}

interface DivProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
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
      "scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight first:mt-0",
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
  <p className={cn("not-first:mt-6 leading-7", className)} {...props}>
    {children}
  </p>
);

const Blockquote = ({ className, children, ...props }: BlockquoteProps) => (
  <blockquote
    className={cn("mt-6 border-l-2 pl-6 italic", className)}
    {...props}
  >
    {children}
  </blockquote>
);

const InlineCode = ({ className, children, ...props }: CodeProps) => (
  <code
    className={cn(
      "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm",
      className
    )}
    {...props}
  >
    {children}
  </code>
);

const Lead = ({ className, children, ...props }: ParagraphProps) => (
  <p className={cn("text-muted-foreground text-xl", className)} {...props}>
    {children}
  </p>
);

const Large = ({ className, children, ...props }: DivProps) => (
  <div className={cn("font-semibold text-lg", className)} {...props}>
    {children}
  </div>
);

const Muted = ({ className, children, ...props }: ParagraphProps) => (
  <p className={cn("text-muted-foreground text-sm", className)} {...props}>
    {children}
  </p>
);

export { H1, H2, H3, H4, P, Lead, Large, Muted, Blockquote, InlineCode };
