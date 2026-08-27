
"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@esmate/shadcn/components/ui/button";
import { Card, CardFooter, CardHeader } from "@esmate/shadcn/components/ui/card";
import { ArrowUpRight, Loader2 } from "@esmate/shadcn/pkgs/lucide-react";
import { useState } from "react";
import { getCollectionList } from "./service";
import { useRequest } from "@esmate/react/ahooks";
import { titleize } from "@/lib/string-utils";

interface Props {
  data: Awaited<ReturnType<typeof getCollectionList>>;
}

export function CollectionList(props: Props) {
  const [pages, setPages] = useState([props.data]);
  const lastPage = pages[pages.length - 1];
  const lastCursor = lastPage.edges[lastPage.edges.length - 1]?.cursor; // Optional chain in case empty
  const hasNextPage = lastPage.pageInfo.hasNextPage;

  const request = useRequest(
    async () => {
      setPages([...pages, await getCollectionList(lastCursor)]);
    },
    {
      manual: true,
    },
  );

  return (
    <div>
      <h1 className="sr-only">Collections</h1>
      {pages.every(({ edges }) => edges.length === 0) ? (
        <div className="rounded-2xl border border-orange-100 bg-white p-10 text-center text-stone-600">
          Collections will appear here when they are published.
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pages
          .flatMap(({ edges }) => edges)
          .map(({ node }) => (
            <Link key={node.handle} href={`/collections/${node.handle}`} className="group flex">
              <Card className="flex w-full flex-col overflow-hidden border-orange-100 bg-white pt-0 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-orange-200 group-hover:shadow-xl">
                <CardHeader className="m-0 overflow-hidden bg-orange-50 p-0">
                  {node.image ? (
                    <Image
                      src={node.image.url as string}
                      alt={node.image.altText || node.title}
                      height={node.image.height as number}
                      width={node.image.width as number}
                      loading="eager"
                      className="aspect-[4/3] h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                     <div className="flex aspect-[4/3] w-full items-center justify-center bg-orange-50 text-stone-500">
                        No Image
                     </div>
                  )}
                </CardHeader>
                <CardFooter className="mt-auto flex items-center justify-between gap-3 border-t border-orange-100 p-4">
                  <h3 className="font-serif text-base font-bold text-[#17130d]">{titleize(node.title)}</h3>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
      </div>
      {hasNextPage && (
        <div className="mt-12 flex justify-center">
          <Button
            size="lg"
            variant={request.error ? "destructive" : "default"}
            onClick={request.run}
            disabled={request.loading}
            className="min-w-50 rounded-xl bg-orange-500 text-white hover:bg-orange-600"
          >
            {request.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {request.loading ? "Loading..." : request.error ? "Try Again" : "Load More Collections"}
          </Button>
        </div>
      )}
    </div>
  );
}

