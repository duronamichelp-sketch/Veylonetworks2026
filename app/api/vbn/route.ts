import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    connected: false,
    articles: [],
    message: "VBN news provider has not been connected yet.",
  });
}