import type React from "react";

interface Props {
  className?: string;
  children: string;
}

const H1: React.FC<Props> = ({ className, children }) => (
  <h1
    className={`scroll-m-20 font-extrabold text-4xl tracking-tight lg:text-5xl ${className}`}
  >
    {children}
  </h1>
);

const H2: React.FC<Props> = ({ className, children }) => (
  <h2
    className={`scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight first:mt-0 ${className}`}
  >
    {children}
  </h2>
);

const H3: React.FC<Props> = ({ className, children }) => (
  <h3
    className={`scroll-m-20 font-semibold text-2xl tracking-tight ${className}`}
  >
    {children}
  </h3>
);

const H4: React.FC<Props> = ({ className, children }) => (
  <h4
    className={`scroll-m-20 font-semibold text-xl tracking-tight ${className}`}
  >
    {children}
  </h4>
);

const P: React.FC<Props> = ({ className, children }) => (
  <p className={`not-first:mt-6 leading-7 ${className}`}>{children}</p>
);

const Blockquote: React.FC<Props> = ({ className, children }) => (
  <blockquote className={`mt-6 border-l-2 pl-6 italic ${className}`}>
    {children}
  </blockquote>
);

const InlineCode: React.FC<Props> = ({ className, children }) => (
  <code
    className={`relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm ${className}`}
  >
    {children}
  </code>
);

const Lead: React.FC<Props> = ({ className, children }) => (
  <p className={`text-muted-foreground text-xl ${className}`}>{children}</p>
);

const Large: React.FC<Props> = ({ className, children }) => (
  <div className={`font-semibold text-lg ${className}`}>{children}</div>
);

const Muted: React.FC<Props> = ({ className, children }) => (
  <p className={`text-muted-foreground text-sm ${className}`}>{children}</p>
);

export { H1, H2, H3, H4, P, Lead, Large, Muted, Blockquote, InlineCode };
