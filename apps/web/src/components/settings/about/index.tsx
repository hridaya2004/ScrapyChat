"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLinkIcon, GithubIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { H4, Muted, P } from "@/components/typography";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const GITHUB_REPO = "hridaya2004/ScrapyChat";

interface GitHubContributor {
  avatar_url: string;
  contributions: number;
  html_url: string;
  id: number;
  login: string;
}

async function fetchContributors(): Promise<GitHubContributor[]> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contributors?per_page=50`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch contributors");
  }
  return res.json();
}

function ContributorSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <Skeleton className="size-10 rounded-full" />
      <Skeleton className="h-3 w-14 rounded" />
    </div>
  );
}

function ContributorCard({ contributor }: { contributor: GitHubContributor }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          className="group flex flex-col items-center gap-1.5 rounded-lg p-2 transition-colors hover:bg-accent"
          href={contributor.html_url}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Avatar className="size-10 ring-2 ring-transparent transition-all group-hover:ring-primary/30">
            <AvatarImage alt={contributor.login} src={contributor.avatar_url} />
            <AvatarFallback>
              {contributor.login.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-20 truncate text-muted-foreground text-xs group-hover:text-foreground">
            {contributor.login}
          </span>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        {contributor.login} - {contributor.contributions} contribution
        {contributor.contributions !== 1 ? "s" : ""}
      </TooltipContent>
    </Tooltip>
  );
}

export default function AboutSection() {
  const {
    data: contributors,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["github-contributors"],
    queryFn: fetchContributors,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });

  return (
    <section className="container px-4 py-2">
      <div className="flex flex-col gap-3">
        <H4>About</H4>

        <FieldGroup>
          <FieldSet>
            <FieldLegend>ScrapyChat</FieldLegend>
            <FieldDescription>
              ScrapyChat is an intelligent web scraping platform that combines
              the power of AI with modern scraping techniques. It allows users
              to extract, analyze, and interact with web data through a
              conversational interface — making web scraping accessible to
              everyone, regardless of technical expertise.
            </FieldDescription>
            <div className="flex items-center gap-3 pt-2">
              <Link
                className="inline-flex items-center gap-2 rounded-3xl border px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-foreground"
                href={`https://github.com/${GITHUB_REPO}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <GithubIcon className="size-4" />
                GitHub
                <ExternalLinkIcon className="size-3" />
              </Link>
            </div>
          </FieldSet>

          <FieldSeparator />

          <FieldSet>
            <FieldLegend>
              <span className="flex items-center gap-2">
                <UsersIcon className="size-4" />
                Contributors
              </span>
            </FieldLegend>
            <FieldDescription>
              The people who have contributed to building ScrapyChat.
            </FieldDescription>

            {isLoading && (
              <div className="flex flex-wrap gap-3 pt-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders never reorder
                  <ContributorSkeleton key={i} />
                ))}
              </div>
            )}

            {isError && (
              <Muted className="pt-2">
                Unable to load contributors. Please check your network
                connection and try again.
              </Muted>
            )}

            {contributors && contributors.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {contributors.map((contributor) => (
                  <ContributorCard
                    contributor={contributor}
                    key={contributor.id}
                  />
                ))}
              </div>
            )}

            {contributors && contributors.length === 0 && (
              <P className="pt-2 text-muted-foreground text-sm">
                No contributors found.
              </P>
            )}
          </FieldSet>
        </FieldGroup>
      </div>
    </section>
  );
}
