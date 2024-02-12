"use client";
import BlurImage from "@/components/blur-image";
import { placeholderBlurhash, random } from "@/lib/utils";
import { Post, Organization } from "@prisma/client";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import Image from "next/image";
import Link from "next/link";

export default function PostCard({
  data,
}: {
  data: Post & { organization: Organization | null };
}) {
  const url = `${data.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/docs/${data.slug}`;

  return (
    <div className="relative border-y border-gray-350 pb-10 transition-all hover:shadow-xl dark:border-gray-700 dark:hover:border-gray-100 md:rounded-lg md:border md:border-x md:shadow-md max-w-lg">
      <Link href={`/docs/${data.id}`} className="flex flex-col overflow-hidden">
        <div className="relative overflow-hidden">
          <div className="w-full">
            <AspectRatio className="w-full" ratio={16 / 9}>
              <Image
                alt={data.title ?? "Card thumbnail"}
                src={data.image ?? "/placeholder.png"}
                className="h-auto w-full object-cover"
                fill
                quality={100}
              />
            </AspectRatio>
          </div>
          {!data.published && (
            <span className="absolute bottom-2 right-2 rounded-md border border-gray-350 bg-gray-100 px-3 py-0.5 text-sm font-medium text-gray-600 shadow-md">
              Draft
            </span>
          )}
        </div>
        <div className="border-t border-gray-350 p-4 dark:border-gray-700">
          <h3 className="my-0 truncate font-cal text-xl font-bold tracking-wide  dark:text-gray-100">
            {data.title}
          </h3>
          <p className="mt-2 line-clamp-1 text-sm font-normal leading-snug text-gray-700 dark:text-gray-400">
            {data.description}
          </p>
        </div>
      </Link>
    </div>
  );
}
