'use client'

import { NextRequest, NextResponse } from "next/server";
import { feedHost } from "../feeds";
import { notFound } from "next/navigation";

export async function GET(
  _request: NextRequest,
  ctx: { params: { id: string } },
) {
  const feedId = ctx.params.id;
  if (!feedHost.hasFeedWithId(feedId)) {
    return notFound();
  }

  return NextResponse.json(
    await feedHost.handleListSingleFeedRequest({ feedId }),
  );
}
