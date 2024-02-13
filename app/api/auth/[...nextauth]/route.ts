'use client'

import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";
import type { NextRequest, NextResponse } from "next/server";

const handler = (async (req: NextRequest, ctx: { params: any}) => {

  return await NextAuth(authOptions(req))(req, ctx);
});

export { handler as GET, handler as POST };
