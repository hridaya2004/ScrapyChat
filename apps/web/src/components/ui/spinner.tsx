import { cn } from "@/lib/utils";

type SpinnerProps = {
  size?: string;
} & React.ComponentProps<"div">;

export function Spinner({
  size = "size-6",
  className,
  ...props
}: SpinnerProps) {
  const bars = new Array(12).fill(0);

  return (
    <div className={cn(size)}>
      <div className={cn("relative top-1/2 left-1/2 h-[inherit] w-[inherit]")}>
        {bars.map((_, i) => (
          <div
            className={cn(
              "absolute -top-[3.9%] -left-[10%] h-[8%] w-[24%] animate-spinner rounded-md bg-primary",
              `bar:nth-child(${i + 1})`,
              className
            )}
            key={`spinner-bar-${String(i)}`}
            style={{
              animationDelay: `-${1.3 - i * 0.1}s`,
              transform: `rotate(${30 * i}deg) translate(146%)`,
            }}
            {...props}
          />
        ))}
      </div>
    </div>
  );
}
